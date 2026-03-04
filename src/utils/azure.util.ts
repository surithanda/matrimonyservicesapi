import { BlobServiceClient, ContainerClient, generateBlobSASQueryParameters, StorageSharedKeyCredential, BlobSASPermissions } from '@azure/storage-blob';
import AZURE_CONFIG from '../config/azure.config';

// ─── Connection ────────────────────────────────────────────────────────────────

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING || '';

if (!connectionString) {
    console.warn(
        '[azure.util] AZURE_STORAGE_CONNECTION_STRING is not set. ' +
        'Azure Blob Storage functionality will be disabled.'
    );
}

let blobServiceClient: BlobServiceClient | null = null;
let containerClient: ContainerClient | null = null;

try {
    if (connectionString) {
        blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
        containerClient = blobServiceClient.getContainerClient(AZURE_CONFIG.CONTAINER_NAME);
        console.log('[azure.util] Azure Blob Storage client initialised successfully.');
    }
} catch (error) {
    console.error('[azure.util] Failed to initialise Azure Blob Storage client:', error);
}

// ─── Upload ────────────────────────────────────────────────────────────────────

/**
 * Upload a Buffer to Azure Blob Storage.
 *
 * @param buffer    - Image bytes (already watermarked)
 * @param blobName  - Full blob path, e.g. accounts/1/profiles/2/photos/xxx.jpg
 * @param mimeType  - MIME type (image/jpeg | image/png | image/webp)
 * @returns         - Public CDN URL of the uploaded blob
 */
export const uploadToBlobStorage = async (
    buffer: Buffer,
    blobName: string,
    mimeType: string
): Promise<string> => {
    if (!containerClient) {
        throw new Error(
            '[azure.util] Azure Blob Storage is not configured. ' +
            'Please set AZURE_STORAGE_CONNECTION_STRING in your .env file.'
        );
    }

    try {
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);

        await blockBlobClient.uploadData(buffer, {
            blobHTTPHeaders: {
                blobContentType: mimeType,
                blobCacheControl: 'public, max-age=31536000', // 1 year cache — photos don't change
            },
        });

        const publicUrl = AZURE_CONFIG.buildPublicUrl(blobName);
        console.log(`[azure.util] Uploaded blob: ${publicUrl}`);
        return publicUrl;
    } catch (error) {
        console.error('[azure.util] Failed to upload to Azure Blob Storage:', error);
        throw error;
    }
};

// ─── Delete ────────────────────────────────────────────────────────────────────

/**
 * Delete a blob from Azure Blob Storage.
 * Accepts either a full URL or just the blob name/path.
 * Silently ignores "blob not found" errors (idempotent).
 *
 * @param blobNameOrUrl - Full Azure blob URL or blob name
 */
export const deleteFromBlobStorage = async (blobNameOrUrl: string): Promise<void> => {
    if (!containerClient) {
        console.warn('[azure.util] Azure not configured — skipping delete.');
        return;
    }

    try {
        // Extract just the blob name from a full URL if needed
        const blobName = extractBlobName(blobNameOrUrl);
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);

        const exists = await blockBlobClient.exists();
        if (!exists) {
            console.warn(`[azure.util] Blob not found (nothing to delete): ${blobName}`);
            return;
        }

        await blockBlobClient.delete();
        console.log(`[azure.util] Deleted blob: ${blobName}`);
    } catch (error) {
        console.error('[azure.util] Failed to delete blob:', error);
        throw error;
    }
};

// ─── Helpers ────────────────────────────────────────────────────────────────────

/**
 * Extract the blob name from a full Azure URL.
 * e.g. https://account.blob.core.windows.net/container/accounts/1/photos/foo.jpg
 *      → accounts/1/photos/foo.jpg
 */
const extractBlobName = (blobNameOrUrl: string): string => {
    try {
        const url = new URL(blobNameOrUrl);
        // Path is /{containerName}/{blobName} — strip the leading /{containerName}/
        const parts = url.pathname.split('/');
        // parts[0] = '' (before first slash)
        // parts[1] = containerName
        // parts[2..n] = blob path segments
        return parts.slice(2).join('/');
    } catch {
        // Not a valid URL — treat as a blob name directly
        return blobNameOrUrl;
    }
};

/**
 * Test Azure connectivity at startup.
 * Returns true if the connection is healthy, false otherwise.
 */
export const testAzureConnection = async (): Promise<boolean> => {
    if (!blobServiceClient) {
        console.warn('[azure.util] Azure not configured — connection test skipped.');
        return false;
    }
    try {
        const props = await blobServiceClient.getProperties();
        console.log('[azure.util] Azure Blob Storage connection successful:', {
            defaultServiceVersion: props.defaultServiceVersion,
        });
        return true;
    } catch (error) {
        console.error('[azure.util] Azure Blob Storage connection failed:', error);
        return false;
    }
};

/**
 * Generate a SAS URL for a specific blob.
 * Valid for 24 hours by default.
 */
export const generateSASUrl = async (blobName: string, expiresInHours: number = 24): Promise<string> => {
    if (!containerClient || !connectionString) {
        // Fallback to public URL if no proper credentials available
        return AZURE_CONFIG.buildPublicUrl(blobName);
    }

    try {
        const accountName = AZURE_CONFIG.getAccountName();
        const accountKey = AZURE_CONFIG.getAccountKey();

        if (!accountName || !accountKey || accountName === 'undefined_account') {
            console.warn('[azure.util] Missing Storage Account Name or Key for SAS generation. Falling back to public URL.');
            return AZURE_CONFIG.buildPublicUrl(blobName);
        }

        const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);

        const sasOptions = {
            containerName: AZURE_CONFIG.CONTAINER_NAME,
            blobName,
            permissions: BlobSASPermissions.parse("r"), // Read permission
            startsOn: new Date(),
            expiresOn: new Date(new Date().valueOf() + expiresInHours * 60 * 60 * 1000)
        };

        const sasToken = generateBlobSASQueryParameters(sasOptions, sharedKeyCredential).toString();
        return `${AZURE_CONFIG.buildPublicUrl(blobName)}?${sasToken}`;
    } catch (error) {
        console.error('[azure.util] Failed to generate SAS URL:', error);
        return AZURE_CONFIG.buildPublicUrl(blobName); // fallback
    }
};

export { AZURE_CONFIG };
