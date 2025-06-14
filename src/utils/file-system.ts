/**
 * =================================
 * FILE SYSTEM UTILITIES
 * Directory creation and file management
 * =================================
 */

import fs from 'fs/promises';
import path from 'path';
import { config } from '@/config/app.config';
import { logger } from '@/config/logger.config';

/**
 * Create uploads directory structure
 */
export const createUploadsDirectory = async (): Promise<void> => {
  try {
    const uploadsDir = path.resolve(config.UPLOAD_DIR);
    const photoUploadsDir = path.join(uploadsDir, 'photos');
    const accountPhotoDir = path.join(photoUploadsDir, 'account');
    const profilePhotoDir = path.join(photoUploadsDir, 'profile');
    const documentsDir = path.join(uploadsDir, 'documents');
    const tempDir = path.join(uploadsDir, 'temp');

    const directories = [
      uploadsDir,
      photoUploadsDir,
      accountPhotoDir,
      profilePhotoDir,
      documentsDir,
      tempDir,
    ];

    for (const dir of directories) {
      try {
        await fs.access(dir);
        logger.debug(`Directory already exists: ${dir}`);
      } catch {
        await fs.mkdir(dir, { recursive: true });
        logger.info(`Created directory: ${dir}`);
      }
    }

    logger.info('Upload directories initialized successfully');
  } catch (error) {
    logger.error('Error creating upload directories:', error);
    throw error;
  }
};

/**
 * Ensure directory exists
 */
export const ensureDirectoryExists = async (dirPath: string): Promise<void> => {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
    logger.debug(`Created directory: ${dirPath}`);
  }
};

/**
 * Check if file exists
 */
export const fileExists = async (filePath: string): Promise<boolean> => {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};

/**
 * Delete file safely
 */
export const deleteFile = async (filePath: string): Promise<boolean> => {
  try {
    await fs.unlink(filePath);
    logger.debug(`Deleted file: ${filePath}`);
    return true;
  } catch (error) {
    logger.warn(`Failed to delete file: ${filePath}`, error);
    return false;
  }
};

/**
 * Move file from source to destination
 */
export const moveFile = async (sourcePath: string, destinationPath: string): Promise<void> => {
  try {
    // Ensure destination directory exists
    const destDir = path.dirname(destinationPath);
    await ensureDirectoryExists(destDir);
    
    // Move file
    await fs.rename(sourcePath, destinationPath);
    logger.debug(`Moved file from ${sourcePath} to ${destinationPath}`);
  } catch (error) {
    logger.error(`Failed to move file from ${sourcePath} to ${destinationPath}:`, error);
    throw error;
  }
};

/**
 * Copy file from source to destination
 */
export const copyFile = async (sourcePath: string, destinationPath: string): Promise<void> => {
  try {
    // Ensure destination directory exists
    const destDir = path.dirname(destinationPath);
    await ensureDirectoryExists(destDir);
    
    // Copy file
    await fs.copyFile(sourcePath, destinationPath);
    logger.debug(`Copied file from ${sourcePath} to ${destinationPath}`);
  } catch (error) {
    logger.error(`Failed to copy file from ${sourcePath} to ${destinationPath}:`, error);
    throw error;
  }
};

/**
 * Get file size in bytes
 */
export const getFileSize = async (filePath: string): Promise<number> => {
  try {
    const stats = await fs.stat(filePath);
    return stats.size;
  } catch (error) {
    logger.error(`Failed to get file size for ${filePath}:`, error);
    throw error;
  }
};

/**
 * Clean up temporary files older than specified age
 */
export const cleanupTempFiles = async (maxAgeHours: number = 24): Promise<void> => {
  try {
    const tempDir = path.join(config.UPLOAD_DIR, 'temp');
    const maxAge = maxAgeHours * 60 * 60 * 1000; // Convert to milliseconds
    const now = Date.now();

    const files = await fs.readdir(tempDir);
    let deletedCount = 0;

    for (const file of files) {
      const filePath = path.join(tempDir, file);
      const stats = await fs.stat(filePath);
      
      if (now - stats.mtime.getTime() > maxAge) {
        await deleteFile(filePath);
        deletedCount++;
      }
    }

    if (deletedCount > 0) {
      logger.info(`Cleaned up ${deletedCount} temporary files`);
    }
  } catch (error) {
    logger.error('Error cleaning up temporary files:', error);
  }
};

/**
 * Get directory size in bytes
 */
export const getDirectorySize = async (dirPath: string): Promise<number> => {
  try {
    let totalSize = 0;
    const files = await fs.readdir(dirPath, { withFileTypes: true });

    for (const file of files) {
      const filePath = path.join(dirPath, file.name);
      
      if (file.isDirectory()) {
        totalSize += await getDirectorySize(filePath);
      } else {
        const stats = await fs.stat(filePath);
        totalSize += stats.size;
      }
    }

    return totalSize;
  } catch (error) {
    logger.error(`Failed to get directory size for ${dirPath}:`, error);
    return 0;
  }
}; 