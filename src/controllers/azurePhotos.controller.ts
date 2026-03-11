import { Response } from "express";
import { AuthenticatedRequest } from "../interfaces/auth.interface";
import multer from "multer";
import pool from "../config/database";
import { processImage } from '../utils/imageProcessor.util';
import { uploadToBlobStorage, deleteFromBlobStorage, generateSASUrl, AZURE_CONFIG } from "../utils/azure.util";

const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: MAX_FILE_SIZE, files: 1 },
    fileFilter: (_req, file, cb) => {
        if (!ALLOWED_FILE_TYPES.includes(file.mimetype)) {
            return cb(new Error("Invalid file type. Allowed: jpeg, png, webp"));
        }
        cb(null, true);
    }
});

export const uploadProfilePhotoMiddleware = upload.single("photo");

// ─── resolveBlobName ────────────────────────────────────────────────────────
// Determines the correct Azure blob path from a DB photo record.
//
// Priority:
//  1. relative_path  — always the canonical blob path (set by both upload paths)
//  2. Full http URL  — extract blob portion, force .jpg extension
//     NOTE: old rows may have a truncated URL (.j / .jp) because the SP param
//     was VARCHAR(100). The force-.jpg strips any partial extension so we still
//     resolve to the correct blob (confirmed exists in Azure as .jpg).
//  3. Raw value      — treat as blob path, force .jpg
//
function resolveBlobName(p: any): string {
    // 1. relative_path (canonical, always correct)
    if (p.relative_path && typeof p.relative_path === 'string' && p.relative_path.trim()) {
        return p.relative_path.trim();
    }

    // 2. Full URL → extract & force .jpg
    if (p.url && typeof p.url === 'string' && p.url.startsWith('http')) {
        try {
            const u = new URL(p.url);
            const parts = u.pathname.split('/');
            parts.shift(); // leading ''
            parts.shift(); // container name
            return parts.join('/').replace(/\.[^/.]*$/, '.jpg');
        } catch {
            return p.url;
        }
    }

    // 3. Raw blob path
    return (p.url || '').replace(/\.[^/.]*$/, '.jpg');
}

// ─── checkSpResult ──────────────────────────────────────────────────────────
// Reads the first row of an SP result set and throws a descriptive error
// if status !== 'success'.
//
function checkSpResult(result: any, spName: string): void {
    const row = (result as any[][])[0]?.[0];
    if (!row || row.status !== 'success') {
        const msg = row?.error_message || `${spName} returned status: ${row?.status ?? 'unknown'}`;
        throw new Error(msg);
    }
}

// ─── getPhotos ──────────────────────────────────────────────────────────────
export const getPhotos = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const profileId = req.body.profile_id;
        if (!profileId) {
            return res.status(400).json({ success: false, message: "profile_id is required" });
        }

        const [rows] = await pool.execute("CALL eb_profile_photo_get(?)", [profileId]);
        const photos = (rows as any[])[0] || [];
        console.log("Photos:", photos);

        const photosWithSas = await Promise.all(photos.map(async (p: any) => {
            const blob = resolveBlobName(p);
            const thumbBlob = blob.replace(/\.jpg$/, '_thumb.jpg');
            return {
                ...p,
                // eb_profile_photo_get returns 'profile_photo_id' but the UI
                // references 'photo_id' — normalize here so both fields are present.
                photo_id: p.profile_photo_id || p.photo_id,
                sas_url: await generateSASUrl(blob, 1),
                thumbnail_sas_url: await generateSASUrl(thumbBlob, 1),
            };
        }));

        res.json({ success: true, data: photosWithSas });
    } catch (e: any) {
        console.error("[getPhotos]", e.message);
        res.status(500).json({ success: false, message: e.message });
    }
};

// ─── uploadPhoto ─────────────────────────────────────────────────────────────
// Handles both NEW (no existing record for caption) and REPLACE (existing record).
// The backend distinguishes them by querying the DB — UI sends the same payload
// for both; caption acts as the unique category key.
//
// NEW:     upload → SP create (check result) → save relative_path
// REPLACE: SP delete (old record) → upload (Azure auto-overwrites) → SP create → save relative_path
//
export const uploadPhoto = async (req: AuthenticatedRequest, res: Response) => {
    const profileId = req.body.profile_id;
    const caption = req.body.caption;
    const photoType = parseInt(req.body.photo_type) || 456;

    // Track blobs uploaded so we can clean up on failure
    let uploadedBlob: string | null = null;
    let uploadedThumb: string | null = null;

    try {
        if (!profileId || !req.file || !caption) {
            return res.status(400).json({ success: false, message: "profile_id, caption and photo file are required" });
        }

        // ── Step 1: Load existing photos ──────────────────────────────────────
        const [existingRows] = await pool.execute("CALL eb_profile_photo_get(?)", [profileId]);
        const existingPhotos: any[] = (existingRows as any[])[0] || [];
        const exactMatch = existingPhotos.find((p: any) => p.caption === caption);

        // ── Step 2: Determine operation and validate ───────────────────────────
        if (!exactMatch && existingPhotos.length >= 7) {
            return res.status(400).json({ success: false, message: "Maximum of 7 photos per profile reached." });
        }

        const partnerId = req.user?.partner_id || 1;

        // ── Step 3: Derive blob name (deterministic: same caption = same blob) ──
        // Azure auto-overwrites on upload so no explicit delete needed for REPLACE.
        let blobName = AZURE_CONFIG.generateBlobName(
            partnerId.toString(),
            profileId.toString(),
            req.file.originalname,
            caption
        );
        // Force .jpg — processImage always outputs JPEG
        blobName = blobName.replace(/\.[^/.]+$/, '') + '.jpg';
        const thumbBlobName = blobName.replace(/\.jpg$/, '_thumb.jpg');

        // ── Step 4 (REPLACE only): Delete old DB record FIRST ─────────────────
        // Must happen before SP create so the photo count drops below 7.
        if (exactMatch) {
            try {
                const [delResult] = await pool.execute(
                    "CALL eb_profile_photo_delete(?, ?, ?)",
                    [exactMatch.photo_id || exactMatch.profile_photo_id, profileId, req.user?.email || 'system']
                );
                checkSpResult(delResult, 'eb_profile_photo_delete');
                console.log(`[uploadPhoto] REPLACE: deleted old record for caption="${caption}"`);
            } catch (delErr: any) {
                // Log but continue — the Azure upload will overwrite the blob anyway.
                // The SP create below will fail if the old record wasn't deleted (count still at 7).
                console.warn(`[uploadPhoto] REPLACE delete warning: ${delErr.message}`);
            }
        }

        // ── Step 5: Process image (watermark + thumbnail) ──────────────────────
        const { main, thumbnail } = await processImage(
            req.file.buffer,
            null,
            "MataMatrimony"
        );

        // ── Step 6: Upload to Azure ─────────────────────────────────────────────
        // For REPLACE: Azure auto-overwrites the blob with the same name — no explicit delete needed.
        const mainUrl = await uploadToBlobStorage(main, blobName, 'image/jpeg');
        uploadedBlob = blobName;

        await uploadToBlobStorage(thumbnail, thumbBlobName, 'image/jpeg');
        uploadedThumb = thumbBlobName;

        if (!mainUrl) {
            throw new Error("Azure upload failed — no URL returned");
        }

        // ── Step 7: Insert DB record via SP ────────────────────────────────────
        // SP p_url is now VARCHAR(500) — full URL is safe.
        const [insertResult] = await pool.execute(
            "CALL eb_profile_photo_create(?, ?, ?, ?, ?, ?)",
            [profileId, mainUrl, photoType, caption, req.body.description || caption, req.user?.email || 'system']
        );

        // Check SP result — if fail, clean up the blobs we just uploaded
        try {
            checkSpResult(insertResult, 'eb_profile_photo_create');
        } catch (spErr: any) {
            console.error("[uploadPhoto] SP create failed:", spErr.message);
            // Clean up Azure blobs
            try { await deleteFromBlobStorage(blobName); } catch (_) { /* no-op */ }
            try { await deleteFromBlobStorage(thumbBlobName); } catch (_) { /* no-op */ }
            return res.status(400).json({ success: false, message: spErr.message });
        }

        // ── Step 8: Save relative_path (belt-and-suspenders) ──────────────────
        // Saves the short blob path so resolveBlobName always has a reliable source.
        // Uses profile_photo (singular) — the actual table name confirmed from delete SP.
        try {
            await pool.execute(
                "UPDATE profile_photo SET relative_path = ? WHERE profile_id = ? AND caption = ? ORDER BY profile_photo_id DESC LIMIT 1",
                [blobName, profileId, caption]
            );
        } catch (rpErr: any) {
            // Non-fatal — resolveBlobName falls back to URL extraction
            console.warn("[uploadPhoto] Could not save relative_path:", rpErr.message);
        }

        const operation = exactMatch ? 'replaced' : 'uploaded';
        res.status(201).json({ success: true, message: `Photo ${operation} successfully` });

    } catch (e: any) {
        // Unexpected error — clean up any Azure blobs uploaded in this request
        if (uploadedBlob) { try { await deleteFromBlobStorage(uploadedBlob); } catch (_) { /* no-op */ } }
        if (uploadedThumb) { try { await deleteFromBlobStorage(uploadedThumb); } catch (_) { /* no-op */ } }
        console.error("[uploadPhoto] Unexpected error:", e.message);
        res.status(500).json({ success: false, message: e.message });
    }
};

// ─── deletePhoto ─────────────────────────────────────────────────────────────
// Calls eb_profile_photo_delete SP first (validates photo exists, logs activity),
// then removes blobs from Azure.
//
export const deletePhoto = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { profile_id, photo_id } = req.body;
        if (!photo_id || !profile_id) {
            return res.status(400).json({ success: false, message: "photo_id and profile_id are required" });
        }

        // Find the photo to resolve its blob name before deleting from DB
        const [existingRows] = await pool.execute("CALL eb_profile_photo_get(?)", [profile_id]);
        const photos: any[] = (existingRows as any[])[0] || [];
        const target = photos.find((p: any) => p.photo_id == photo_id || p.profile_photo_id == photo_id);

        // ── Step 1: Delete from DB via SP ─────────────────────────────────────
        const [delResult] = await pool.execute(
            "CALL eb_profile_photo_delete(?, ?, ?)",
            [photo_id, profile_id, req.user?.email || 'system']
        );
        checkSpResult(delResult, 'eb_profile_photo_delete');

        // ── Step 2: Delete from Azure ──────────────────────────────────────────
        if (target) {
            const blob = resolveBlobName(target);
            const thumbBlob = blob.replace(/\.jpg$/, '_thumb.jpg');
            try { await deleteFromBlobStorage(blob); } catch (e) { console.warn("[deletePhoto] blob not found in Azure:", blob); }
            try { await deleteFromBlobStorage(thumbBlob); } catch (_) { /* thumb may not exist */ }
        }

        res.json({ success: true, message: "Photo deleted successfully" });
    } catch (e: any) {
        console.error("[deletePhoto]", e.message);
        res.status(500).json({ success: false, message: e.message });
    }
};

// ─── setPrimary ───────────────────────────────────────────────────────────────
export const setPrimary = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { profile_id, photo_id } = req.body;
        if (!photo_id || !profile_id) {
            return res.status(400).json({ success: false, message: "photo_id and profile_id are required" });
        }

        const [rows] = await pool.execute("CALL eb_profile_photo_get(?)", [profile_id]);
        const photos: any[] = (rows as any[])[0] || [];

        const target = photos.find((p: any) => p.photo_id == photo_id);
        const currentPrimary = photos.find((p: any) => p.photo_type == 450);

        if (!target) {
            return res.status(404).json({ success: false, message: "Photo not found" });
        }

        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            if (currentPrimary && currentPrimary.photo_id != target.photo_id) {
                // Demote previous primary back to the new target's old type
                await connection.execute(
                    "UPDATE profile_photo SET photo_type = ?, caption = ? WHERE photo_id = ?",
                    [target.photo_type, target.caption, currentPrimary.photo_id]
                );
            }

            // Promote target to primary (Clear Headshot / type 450)
            await connection.execute(
                "UPDATE profile_photo SET photo_type = 450, caption = 'Clear Headshot' WHERE photo_id = ?",
                [photo_id]
            );

            await connection.commit();
        } catch (e) {
            await connection.rollback();
            throw e;
        } finally {
            connection.release();
        }

        res.json({ success: true, message: "Primary photo updated" });
    } catch (e: any) {
        console.error("[setPrimary]", e.message);
        res.status(500).json({ success: false, message: e.message });
    }
};
