import { Request, Response } from "express";
import { AuthenticatedRequest } from "../interfaces/auth.interface";
import multer from "multer";
import pool from "../config/database";
import { applyWatermark } from "../utils/watermark.util";
import { uploadToBlobStorage, deleteFromBlobStorage, generateSASUrl, AZURE_CONFIG } from "../utils/azure.util";
import sharp from "sharp";

const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: MAX_FILE_SIZE, files: 1 },
    fileFilter: (req, file, cb) => {
        if (!ALLOWED_FILE_TYPES.includes(file.mimetype)) {
            return cb(new Error("Invalid file type."));
        }
        cb(null, true);
    }
});

export const uploadProfilePhotoMiddleware = upload.single("photo");

export const getPhotos = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const profileId = req.body.profile_id;
        if (!profileId) {
            return res.status(400).json({ success: false, message: "Profile ID required" });
        }

        const [rows] = await pool.execute("CALL eb_profile_photo_get(?)", [profileId]);
        const photos = (rows as any[])[0] || [];

        // Attach SAS URLs
        const photosWithSas = await Promise.all(photos.map(async (p: any) => {
            let extractBlobName = (blobUrl: string) => {
                try {
                    const u = new URL(blobUrl);
                    // the pathname is usually /container/accountId/profileId/slug.ext
                    // so we rip off the /container/ part to get the true blob name
                    const parts = u.pathname.split('/');
                    parts.shift(); // remove empty string before first /
                    parts.shift(); // remove container name
                    return parts.join('/');
                } catch { return blobUrl; }
            };

            // It might already be a raw partnerId/profileId/slug format, or a full URL
            const blob = p.url.startsWith('http') ? extractBlobName(p.url) : p.url;

            // To find the thumbnail, replace the extension with _thumb.ext
            // e.g., photo.jpg -> photo_thumb.jpg
            const thumbBlob = blob.replace(/(\.[^.]+)$/, '_thumb$1');

            return {
                ...p,
                sas_url: await generateSASUrl(blob, 1), // 1 hour SAS
                thumbnail_sas_url: await generateSASUrl(thumbBlob, 1)
            };
        }));

        res.json({ success: true, data: photosWithSas });
    } catch (e: any) {
        res.status(500).json({ success: false, message: e.message });
    }
}

export const uploadPhoto = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const profileId = req.body.profile_id;
        const caption = req.body.caption; // e.g. "Clear Headshot"
        const photoType = parseInt(req.body.photo_type) || 456;

        if (!profileId || !req.file || !caption) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        // Check for existing photo of the same caption/type and delete
        const [rows] = await pool.execute("CALL eb_profile_photo_get(?)", [profileId]);
        const existingPhotos = (rows as any[])[0] || [];

        // 7 allowed exactly
        if (existingPhotos.length >= 7 && !existingPhotos.find((p: any) => p.caption === caption)) {
            return res.status(400).json({ success: false, message: "Max 7 photos reached" });
        }

        let extractBlobName = (blobUrl: string) => {
            try {
                const u = new URL(blobUrl);
                const parts = u.pathname.split('/');
                parts.shift();
                parts.shift();
                return parts.join('/');
            } catch { return blobUrl; }
        };

        const exactMatch = existingPhotos.find((p: any) => p.caption === caption);
        if (exactMatch) {
            try {
                // Delete from Azure (main + thumb)
                const blob = exactMatch.url.startsWith('http') ? extractBlobName(exactMatch.url) : exactMatch.url;
                await deleteFromBlobStorage(blob);

                const thumbBlob = blob.replace(/(\.[^.]+)$/, '_thumb$1');
                await deleteFromBlobStorage(thumbBlob);

                // DB Delete (Raw query because no delete SP found)
                await pool.execute("DELETE FROM profile_photos WHERE photo_id = ?", [exactMatch.photo_id]);
            } catch (err) {
                console.error("Failed to delete replacing photo", err);
            }
        }

        const partnerId = req.user?.partner_id || 1;

        // Auto-rotate and Resize to 1200px
        const resizedMain = await sharp(req.file.buffer)
            .rotate()
            .resize({ width: 1200, withoutEnlargement: true })
            .toBuffer();

        const watermarkedBuffer = await applyWatermark(resizedMain, req.file.mimetype);

        // Generate thumb
        const thumbBuffer = await sharp(watermarkedBuffer)
            .resize({ width: 300, withoutEnlargement: true })
            .toBuffer();

        // Azure Upload
        // blobName is {partner_id}/{profile_id}/{category_slug}.{ext}
        const blobName = AZURE_CONFIG.generateBlobName(partnerId.toString(), profileId.toString(), req.file.originalname, caption);

        // e.g., photo.jpg -> photo_thumb.jpg
        const thumbBlobName = blobName.replace(/(\.[^.]+)$/, '_thumb$1');

        await uploadToBlobStorage(watermarkedBuffer, blobName, req.file.mimetype);
        await uploadToBlobStorage(thumbBuffer, thumbBlobName, req.file.mimetype);

        // DB Insert - Save the raw blob path as requested
        const [insertResult] = await pool.execute("CALL eb_profile_photo_create(?, ?, ?, ?, ?, ?)", [
            profileId,
            blobName || null,
            photoType,
            caption || null,
            req.body.description || caption || null,
            req.user?.email || "system" || null
        ]);

        res.json({ success: true, message: "Uploaded successfully" });
    } catch (e: any) {
        res.status(500).json({ success: false, message: e.message });
    }
}

export const deletePhoto = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { profile_id, photo_id } = req.body;
        if (!photo_id || !profile_id) return res.status(400).json({ success: false, message: "Missing photo_id" });

        const [rows] = await pool.execute("CALL eb_profile_photo_get(?)", [profile_id]);
        const photos = (rows as any[])[0] || [];
        const target = photos.find((p: any) => p.photo_id == photo_id);

        if (target) {
            let extractBlobName = (blobUrl: string) => {
                try {
                    const u = new URL(blobUrl);
                    const parts = u.pathname.split('/');
                    parts.shift();
                    parts.shift();
                    return parts.join('/');
                } catch { return blobUrl; }
            };

            const blob = target.url.startsWith('http') ? extractBlobName(target.url) : target.url;
            await deleteFromBlobStorage(blob);

            const thumbBlob = blob.replace(/(\.[^.]+)$/, '_thumb$1');
            await deleteFromBlobStorage(thumbBlob);

            await pool.execute("DELETE FROM profile_photos WHERE photo_id = ?", [photo_id]);
        }
        res.json({ success: true, message: "Deleted" });
    } catch (e: any) {
        res.status(500).json({ success: false, message: e.message });
    }
}

export const setPrimary = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { profile_id, photo_id } = req.body;
        if (!photo_id || !profile_id) return res.status(400).json({ success: false, message: "Missing parameters" });

        const [rows] = await pool.execute("CALL eb_profile_photo_get(?)", [profile_id]);
        const photos = (rows as any[])[0] || [];

        const target = photos.find((p: any) => p.photo_id == photo_id);
        const currentPrimary = photos.find((p: any) => p.photo_type == 450);

        if (!target) return res.status(404).json({ success: false, message: "Photo not found" });

        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            if (currentPrimary && currentPrimary.photo_id != target.photo_id) {
                // Swap the previous primary back to the new one's old slot
                await connection.execute(
                    "UPDATE profile_photos SET photo_type = ?, caption = ? WHERE photo_id = ?",
                    [target.photo_type, target.caption, currentPrimary.photo_id]
                );
            }

            // Make the target the new primary (Clear Headshot / 450)
            await connection.execute(
                "UPDATE profile_photos SET photo_type = 450, caption = 'Clear Headshot' WHERE photo_id = ?",
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
        res.status(500).json({ success: false, message: e.message });
    }
}
