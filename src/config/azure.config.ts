// Azure Blob Storage configuration constants

export const AZURE_CONFIG = {
    // Container where all profile photos are stored
    CONTAINER_NAME: process.env.AZURE_STORAGE_CONTAINER_NAME || 'matrimony-photos',

    // Base CDN/blob URL — used to construct public photo URLs
    CDN_BASE_URL: process.env.AZURE_STORAGE_CDN_BASE_URL || '',

    // Max file size: 5MB (same as current Google Drive limit)
    MAX_FILE_SIZE: 5 * 1024 * 1024,

    // Allowed MIME types
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],

    // Photo type codes (matches existing DB values)
    PHOTO_TYPES: {
        PROFILE: 450,
        COVER: 454,
        ADDITIONAL: 456,
    },

    /**
     * Generate a structured blob name under the path:
     *   accounts/{accountId}/profiles/{profileId}/photos/{timestamp}-{sanitized-filename}
     *
     * This mirrors the existing local disk / Drive folder structure.
     */
    generateBlobName: (
        accountId: string,
        profileId: string,
        originalFilename: string,
        captionPrefix?: string
    ): string => {
        const ext = originalFilename
            .replace(/^.*[\\/]/, '')
            .split('.')
            .pop()?.toLowerCase() || 'jpg';

        const categorySlug = captionPrefix
            ? captionPrefix.replace(/[^\w\d-]/g, '_').toLowerCase()
            : 'photo';

        // {partner_id}/{profile_id}/{category_slug}.{ext}
        return `${accountId}/${profileId}/${categorySlug}.${ext}`;
    },

    getAccountName: (): string => {
        if (process.env.AZURE_STORAGE_ACCOUNT_NAME) {
            return process.env.AZURE_STORAGE_ACCOUNT_NAME;
        }

        // Parse from connection string: DefaultEndpointsProtocol=https;AccountName=myaccount;AccountKey=...
        const connStr = process.env.AZURE_STORAGE_CONNECTION_STRING || '';
        const match = connStr.match(/AccountName=([^;]+)/);
        return match ? match[1] : 'undefined_account';
    },

    getAccountKey: (): string => {
        if (process.env.AZURE_STORAGE_ACCOUNT_KEY) {
            return process.env.AZURE_STORAGE_ACCOUNT_KEY;
        }

        // Parse from connection string: DefaultEndpointsProtocol=https;AccountName=myaccount;AccountKey=...
        const connStr = process.env.AZURE_STORAGE_CONNECTION_STRING || '';
        const match = connStr.match(/AccountKey=([^;]+)/);
        return match ? match[1] : '';
    },

    /**
     * Build the full public URL for a blob.
     * If CDN_BASE_URL is set use that, otherwise fall back to the standard
     * Azure blob storage URL format.
     */
    buildPublicUrl: (blobName: string): string => {
        const accountName = AZURE_CONFIG.getAccountName();
        const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || 'matrimony-photos';

        const base =
            process.env.AZURE_STORAGE_CDN_BASE_URL ||
            `https://${accountName}.blob.core.windows.net/${containerName}`;

        return `${base}/${blobName}`;
    },
};

export default AZURE_CONFIG;
