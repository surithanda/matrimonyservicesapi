// Configuration for file storage across different environments
export const STORAGE_CONFIG = {
  // Maximum file size (5MB)
  MAX_FILE_SIZE: 5 * 1024 * 1024,
  
  // Allowed file types for photo uploads
  ALLOWED_PHOTO_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  
  // Maximum files per upload
  MAX_FILES_PER_UPLOAD: 1,
  
  // Photo type constants
  PHOTO_TYPES: {
    PROFILE: 450,
    COVER: 454,
    ADDITIONAL: 456
  },
  
  // Storage paths
  PATHS: {
    // Render persistent disk mount path
    RENDER_PHOTOS: '/photos',
    
    // Local development path (relative to project root)
    LOCAL_UPLOADS: 'uploads',
    
    // Photo subdirectories
    ACCOUNTS: 'accounts',
    PROFILES: 'profiles',
    PHOTOS: 'photos'
  },
  
  // Environment detection
  isRenderEnvironment: () => {
    return process.env.RENDER === 'true' || process.env.NODE_ENV === 'production';
  },
  
  // Get base storage path based on environment
  getBasePath: () => {
    if (STORAGE_CONFIG.isRenderEnvironment()) {
      return STORAGE_CONFIG.PATHS.RENDER_PHOTOS;
    }
    const path = require('path');
    return path.join(process.cwd(), STORAGE_CONFIG.PATHS.LOCAL_UPLOADS);
  }
};

export default STORAGE_CONFIG;