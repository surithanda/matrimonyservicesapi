import { Request, Response } from 'express';
import { ProfileService } from '../services/profile.service';
import { AuthenticatedRequest } from '../interfaces/auth.interface';
import { IProfileFamilyReference, IProfileLifestyle, IProfilePhoto } from '../interfaces/profile.interface';
import { IProfileHobbyInterest } from '../interfaces/hobby.interface';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

export const getPersonalProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const profileService = new ProfileService();
    
    // Add account_id and created_user from authenticated user
    const profileData = {
      ...req.body,
      account_code: req.user?.account_code,
      created_user: req.user?.email
    };

    const result = await profileService.getPersonalProfile(profileData);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to get personal profile details',
      error: error.message
    });
  }
};

export const createPersonalProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const profileService = new ProfileService();
    
    // Add account_id and created_user from authenticated user
    const profileData = {
      ...req.body,
      account_code: req.user?.account_code,
      created_user: req.user?.email
    };

    const result = await profileService.createPersonalProfile(profileData);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    res.status(201).json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to create personal profile',
      error: error.message
    });
  }
};

export const getProfileAddress = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const profileService = new ProfileService();
    
    // Add account_id and created_user from authenticated user
    const profileData = {
      ...req.body,
      account_code: req.user?.account_code,
      created_user: req.user?.email
    };

    const result = await profileService.getProfileAddress(profileData);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to get profile address details',
      error: error.message
    });
  }
};

export const createProfileAddress = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const profileService = new ProfileService();
    
    const addressData = {
      ...req.body,
      account_id: parseInt(req.user?.account_code || '0'),
      created_user: req.user?.email
    };

    const result = await profileService.createProfileAddress(addressData);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    res.status(201).json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to create profile address',
      error: error.message
    });
  }
};

export const updateProfileAddress = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const profileService = new ProfileService();
    const addressId = req.params.id;
    
    const addressData = {
      ...req.body,
      profile_address_id: parseInt(addressId),
      modified_user: req.user?.email
    };

    const result = await profileService.updateProfileAddress(addressData);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    res.status(200).json({
      success: true,
      status: 'success',
      message: 'Address updated successfully',
      data: result
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to update profile address',
      error: error.message
    });
  }
};

export const deleteProfileAddress = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const profileService = new ProfileService();
    const addressId = req.params.id;
    
    // Get profile_id from request body or query params
    const profileId = req.body.profile_id || req.query.profile_id;
    
    if (!profileId) {
      return res.status(400).json({
        success: false,
        message: 'profile_id is required'
      });
    }

    const deleteData = {
      profile_id: parseInt(profileId as string),
      profile_address_id: parseInt(addressId),
      created_user: req.user?.email
    };

    const result = await profileService.deleteProfileAddress(deleteData);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    res.status(200).json({
      success: true,
      status: 'success',
      message: 'Address deleted successfully',
      data: result
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete profile address',
      error: error.message
    });
  }
};

// 
export const getProfileEducation = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const profileService = new ProfileService();
    
    // Add account_id and created_user from authenticated user
    const profileData = {
      ...req.body,
      account_code: req.user?.account_code,
      created_user: req.user?.email
    };

    const result = await profileService.getProfileEducation(profileData);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to get profile education details',
      error: error.message
    });
  }
};

export const createProfileEducation = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const profileService = new ProfileService();
    
    const educationData = {
      ...req.body,
      user_created: req.user?.email
    };

    const result = await profileService.createProfileEducation(educationData);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    res.status(201).json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to create profile education',
      error: error.message
    });
  }
};

// 
export const getProfileEmployment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const profileService = new ProfileService();
    
    // Add account_id and created_user from authenticated user
    const profileData = {
      ...req.body,
      account_code: req.user?.account_code,
      created_user: req.user?.email
    };

    const result = await profileService.getProfileEmployment(profileData);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to get profile employment details',
      error: error.message
    });
  }
};

export const createProfileEmployment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const profileService = new ProfileService();
    
    const employmentData = {
      ...req.body,
      account_id: parseInt(req.user?.account_code || '0'),
      created_user: req.user?.email
    };

    const result = await profileService.createProfileEmployment(employmentData);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    res.status(201).json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to create profile employment',
      error: error.message
    });
  }
};

// 
export const getProfileProperty = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const profileService = new ProfileService();
    
    // Add account_id and created_user from authenticated user
    const profileData = {
      ...req.body,
      account_code: req.user?.account_code,
      created_user: req.user?.email
    };

    const result = await profileService.getProfileProperty(profileData);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to get profile property details',
      error: error.message
    });
  }
};

export const createProfileProperty = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const profileService = new ProfileService();
    
    const propertyData = {
      ...req.body,
      created_by: req.user?.email,
      ip_address: req.ip,
      browser_profile: req.headers['user-agent']
    };

    const result = await profileService.createProfileProperty(propertyData);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    res.status(201).json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to create profile property',
      error: error.message
    });
  }
};

// 
export const getFamilyReference = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const profileService = new ProfileService();
    
    // Add account_id and created_user from authenticated user
    const profileData = {
      ...req.body,
      account_code: req.user?.account_code,
      created_user: req.user?.email
    };

    const result = await profileService.getFamilyReference(profileData);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to get profile family reference details',
      error: error.message
    });
  }
};

export const createFamilyReference = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const profileService = new ProfileService();
    
    const referenceData: IProfileFamilyReference = {
      ...req.body,
      account_id: parseInt(req.user?.account_code || '0'),
      created_user: req.user?.email
    };

    const result = await profileService.createFamilyReference(referenceData);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    res.status(201).json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to create family reference',
      error: error.message
    });
  }
};

// 
export const getProfileLifestyle = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const profileService = new ProfileService();
    
    // Add account_id and created_user from authenticated user
    const profileData = {
      ...req.body,
      account_code: req.user?.account_code,
      created_user: req.user?.email
    };

    const result = await profileService.getProfileLifestyle(profileData);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to get profile lifestyle details',
      error: error.message
    });
  }
};

export const createProfileLifestyle = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const profileService = new ProfileService();
    
    const lifestyleData: IProfileLifestyle = {
      ...req.body,
      created_user: req.user?.email,
      is_active: req.body.is_active === 'true', // Convert string to boolean
      profile_id: parseInt(req.body.profile_id)
    };

    const result = await profileService.createProfileLifestyle(lifestyleData);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    res.status(201).json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to create profile lifestyle',
      error: error.message
    });
  }
};

// File type validation constants
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_FILES_PER_UPLOAD = 1;

// Helper function to ensure directory exists
const ensureDirectoryExists = (dirPath: string) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true, mode: 0o755 });
  }
};

// Environment detection
const isRenderEnvironment = () => {
  return process.env.RENDER === 'true' || process.env.NODE_ENV === 'production';
};

// Get the appropriate storage base path
const getStorageBasePath = () => {
  if (isRenderEnvironment()) {
    return '/photos'; // Render persistent disk mount path
  }
  return path.join(__dirname, '../../uploads'); // Local development path
};

// Sanitize filename to prevent directory traversal and special characters
const sanitizeFilename = (filename: string): string => {
  // Remove any path traversal attempts and replace special characters
  return filename
    .replace(/^.*[\\/]/, '') // Remove path
    .replace(/[^\w\d.-]/g, '_') // Replace special chars with underscore
    .toLowerCase();
};

// Configure storage for Render persistent disk
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      const accountId = (req as AuthenticatedRequest)?.user?.account_code;
      const profileId = req.body.profile_id;
      
      if (!accountId || !profileId) {
        throw new Error('Missing account ID or profile ID');
      }

      // Use environment-aware storage path
      const basePath = getStorageBasePath();
      const uploadPath = path.join(
        basePath,
        'accounts',
        accountId.toString(),
        'profiles', 
        profileId.toString(),
        'photos'
      );
      
      ensureDirectoryExists(uploadPath);
      cb(null, uploadPath);
    } catch (error) {
      cb(error as Error, '');
    }
  },
  filename: (req, file, cb) => {
    try {
      const fileExt = path.extname(file.originalname).toLowerCase();
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const sanitizedCaption = req.body.caption 
        ? `${sanitizeFilename(req.body.caption)}-` 
        : '';
      
      cb(null, `${sanitizedCaption}${uniqueSuffix}${fileExt}`);
    } catch (error) {
      cb(error as Error, '');
    }
  }
});

// File filter for validation
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  try {
    // Check file type
    if (!ALLOWED_FILE_TYPES.includes(file.mimetype)) {
      return cb(new Error(`Invalid file type. Only ${ALLOWED_FILE_TYPES.join(', ')} are allowed.`));
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return cb(new Error(`File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`));
    }

    // Check required fields
    if (!req.body.profile_id) {
      return cb(new Error('Profile ID is required'));
    }

    // Check photo type (450: profile, 454: cover, 456: additional)
    const photoType = parseInt(req.body.photo_type);
    const validPhotoTypes = [450, 454, 456];
    if (isNaN(photoType) || !validPhotoTypes.includes(photoType)) {
      return cb(new Error('Invalid photo type. Must be 450 (profile), 454 (cover), or 456 (additional)'));
    }

    cb(null, true);
  } catch (error) {
    cb(error as Error);
  }
};

// Configure multer
const upload = multer({ 
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: MAX_FILES_PER_UPLOAD
  }
});

// Error handling middleware for multer
export const handleMulterError = (err: any, req: Request, res: Response, next: any) => {
  if (err instanceof multer.MulterError) {
    // A Multer error occurred when uploading
    return res.status(400).json({
      success: false,
      message: err.message || 'File upload error',
      error: err.code
    });
  } else if (err) {
    // An unknown error occurred
    return res.status(500).json({
      success: false,
      message: 'Failed to upload file',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
  next();
};

// Middleware to handle file uploads
export const uploadProfilePhoto = [
  upload.single('photo'),
  (req: Request, res: Response, next: any) => {
    console.log(req);
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded or file upload failed'
      });
    }
    next();
  },
  handleMulterError
];

/**
 * @swagger
 * /profile/photo:
 *   post:
 *     summary: Upload a profile photo
 *     tags: [Profile]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - profile_id
 *               - photo
 *               - photo_type
 *             properties:
 *               profile_id:
 *                 type: integer
 *                 description: The ID of the profile to attach the photo to
 *               photo_type:
 *                 type: integer
 *                 description: 1 for profile, 2 for cover, 3 for additional photos
 *                 enum: [1, 2, 3]
 *               description:
 *                 type: string
 *                 description: Optional description of the photo
 *               caption:
 *                 type: string
 *                 description: Optional caption for the photo
 *               photo:
 *                 type: string
 *                 format: binary
 *                 description: The image file to upload (max 5MB)
 *     responses:
 *       201:
 *         description: Photo uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     photo_id:
 *                       type: integer
 *                     url:
 *                       type: string
 *       400:
 *         description: Invalid request or file
 *       401:
 *         description: Unauthorized
 *       413:
 *         description: File too large
 *       415:
 *         description: Unsupported file type
 *       500:
 *         description: Server error
 */
export const createProfilePhoto = async (req: AuthenticatedRequest, res: Response) => {
  try {
    console.log(req);
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded or file upload failed'
      });
    }

    console.log(req.file, req.body);

    const profileService = new ProfileService();
    
    // Create URL for the uploaded file using environment-aware path generation
    const basePath = getStorageBasePath();
    const relativePath = path.relative(basePath, req.file.path);
    
    const photoData: IProfilePhoto = {
      profile_id: parseInt(req.body.profile_id),
      photo_type: parseInt(req.body.photo_type) || 456, // Default to additional photos
      description: req.body.description || '',
      caption: req.body.caption || path.parse(req.file.originalname).name,
      url: `/photos/${relativePath.replace(/\\/g, '/')}`, // Always use /photos for client access
      user_created: req.user?.email || 'system',
      ip_address: req.ip || '',
      browser_profile: req.headers['user-agent'] || ''
    };

    const result = await profileService.createProfilePhoto(photoData);
    
    if (!result.success) {
      // Clean up the uploaded file if database operation fails
      try {
        fs.unlinkSync(req.file.path);
      } catch (error) {
        console.error('Failed to clean up file after database error:', error);
      }
      return res.status(400).json(result);
    }
    
    // Return success response with file URL
    res.status(201).json({
      success: true,
      message: 'Profile photo uploaded successfully',
      data: {
        ...result.data,
        url: photoData.url // Return the full URL for client-side use
      }
    });
  } catch (error: any) {
    // Clean up the uploaded file on error
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Failed to clean up file on error:', unlinkError);
      }
    }

    console.error('Error uploading profile photo:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload profile photo',
      error: error.message
    });
  }
};

export const getProfilePhotos = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const profileId = parseInt(req.params.profileId);
    if (!profileId || isNaN(profileId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid profile ID'
      });
    }

    const profileService = new ProfileService();
    const result = await profileService.getProfilePhotos(profileId);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve profile photos',
      error: error.message
    });
  }
};

export const getProfileHobbies = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const profileService = new ProfileService();
    const profileData: IProfileHobbyInterest = {
      ...req.body,
      account_code: req.user?.account_code,
      created_user: req.user?.email
    };
    console.log('Profile Data:', profileData); // Debugging line to check profileData
    const result = await profileService.getProfileHobbies(profileData);
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to get hobbies',
      error: error.message
    });
  }
};

export const addProfileHobby = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const profileService = new ProfileService();
    const hobbyData: IProfileHobbyInterest = {
      ...req.body,
      account_code: req.user?.account_code,
      created_user: req.user?.email
    };
    const result = await profileService.addProfileHobby(hobbyData);
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.status(201).json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to add hobby',
      error: error.message
    });
  }
};

export const removeProfileHobby = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const profileService = new ProfileService();
    const hobbyData: IProfileHobbyInterest = {
      ...req.body,
      account_code: req.user?.account_code,
      created_user: req.user?.email
    };
    const result = await profileService.removeProfileHobby(hobbyData);
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to remove hobby',
      error: error.message
    });
  }
};

export const addProfileFamily = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const profileService = new ProfileService();
    // const { profile_id, family } = req.body;
    const data = {
      ...req.body,
      account_code: req.user?.account_code,
      created_user: req.user?.email
    };
    if (!req.body?.profile_id) {
      return res.status(400).json({ message: 'profile_id is required' });
    }
    const result = await profileService.addProfileFamily(data);
    // return res.status(201).json({ message: 'Family record added successfully', data: result });

    // const result = await profileService.createProfileEmployment(employmentData);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    res.status(201).json(result);

  } catch (error: unknown) {
    return res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const updateProfileFamily = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const profileService = new ProfileService();
    const { profile_id, family } = req.body;
    if (!profile_id || !family) {
      return res.status(400).json({ message: 'profile_id and family are required' });
    }
    const result = await profileService.updateProfileFamily(profile_id, family);
    return res.status(200).json({ message: 'Family record updated successfully', data: result });
  } catch (error: unknown) {
    return res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const deleteProfileFamily = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const profileService = new ProfileService();
    const { profile_id, family_id } = req.body;
    if (!profile_id || !family_id) {
      return res.status(400).json({ message: 'profile_id and family_id are required' });
    }
    const result = await profileService.deleteProfileFamily(profile_id, family_id);
    return res.status(200).json({ message: 'Family record deleted successfully', data: result });
  } catch (error: unknown) {
    return res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const searchProfiles = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const profileService = new ProfileService();
    
    // Extract search parameters from request body
    const searchParams = {
      profile_id: req.body.profile_id,
      min_age: req.body.min_age,
      max_age: req.body.max_age,
      religion: req.body.religion,
      max_education: req.body.max_education,
      occupation: req.body.occupation,
      country: req.body.country,
      caste_id: req.body.caste_id,
      marital_status: req.body.marital_status
    };

    const result = await profileService.searchProfiles(searchParams);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to search profiles',
      error: error.message
    });
  }
};

export const getUserPreferences = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const profileService = new ProfileService();
    const profileId = parseInt(req.params.profileId);
    const preferenceId = req.query.preference_id ? parseInt(req.query.preference_id as string) : undefined;
    
    if (!profileId) {
      return res.status(400).json({
        success: false,
        message: 'Profile ID is required'
      });
    }

    const result = await profileService.getUserPreferences(profileId, preferenceId, req.user?.email);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to get user preferences',
      error: error.message
    });
  }
};

export const trackProfileView = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const profileService = new ProfileService();
    const { profileId, viewedProfileId } = req.body;
    const accountCode = req.user?.account_code;
    
    if (!accountCode) {
      return res.status(400).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    if (!viewedProfileId) {
      return res.status(400).json({
        success: false,
        message: 'Viewed profile ID is required'
      });
    }

    // Get the current user's profile ID
    // const profileResult = await profileService.getProfileByAccountCode(accountCode);
    // if (!profileResult.success || !profileResult.data?.profile_id) {
    //   return res.status(404).json({
    //     success: false,
    //     message: 'User profile not found'
    //   });
    // }

    // const profileId = profileResult.data.profile_id;
    // const email = req.user?.account_id;

    // Track the view
    const result = await profileService.trackProfileView(
      profileId,
      viewedProfileId,
      Number(req.user?.account_id)
    );

    res.status(200).json(result);
  } catch (error: any) {
    console.error('Error tracking profile view:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track profile view',
      error: error.message
    });
  }
};

export const saveUserPreferences = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const profileService = new ProfileService();
    
    // Map frontend preferences to stored procedure parameters
    const preferencesData = {
      profile_id: req.body.profile_id,
      min_age: req.body.min_age || null,
      max_age: req.body.max_age || null,
      gender: req.body.gender || null,
      religion: req.body.religion || null,
      caste: req.body.caste || null,
      marital_status: req.body.marital_status || null,
      location_preference: req.body.country || null, // Map country to location_preference
      distance_preference: null, // Not used in frontend, set to null
      max_education: req.body.max_education || null,
      occupation: req.body.occupation || null,
      created_user: req.user?.email
    };

    // Log the preferences data for debugging
    console.log('Saving preferences:', preferencesData);

    const result = await profileService.saveUserPreferences(preferencesData);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    res.status(200).json({
      success: true,
      message: 'Preferences saved successfully',
      data: result
    });
  } catch (error: any) {
    console.error('Error saving preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save user preferences',
      error: error.message
    });
  }
};

/**
 * @swagger
 * /profile/favorites/{profileId}:
 *   get:
 *     summary: Get user's favorite profiles
 *     tags: [Profile]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: profileId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Profile ID to get favorites for
 *     responses:
 *       200:
 *         description: Successfully retrieved favorite profiles
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Profile'
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export const getFavorites = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const profileService = new ProfileService();
    const { profileId } = req.body;
    console.log(profileId);
    if (!profileId) {
      return res.status(400).json({
        success: false,
        message: 'Profile ID is required'
      });
    }
    
    const result = await profileService.getFavorites({profileId: Number(profileId), account: Number(req.user?.account_id)});
    
    res.status(200).json({
      success: true,
      message: 'Favorites retrieved successfully',
      data: result
    });
  } catch (error: any) {
    console.error('Error getting favorites:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get favorites',
      error: error.message
    });
  }
};

export const createFavoriteProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const profileService = new ProfileService();
    console.log('Incoming POST request to /api/profile/favorites', req.body);
    const { profile_id, favorite_profile_id, is_favorite } = req.body;
    // const accountCode = req.user?.account_code;
    
    // if (!accountCode) {
    //   return res.status(400).json({
    //     success: false,
    //     message: 'User account code is required'
    //   });
    // }

    if (!favorite_profile_id) {
      return res.status(400).json({
        success: false,
        message: 'Favorite profile ID is required'
      });
    }

    // Convert to numbers
    const profile_id_num = Number(profile_id);
    const favorite_profile_id_num = Number(favorite_profile_id);
    const is_favorite_bool = Boolean(is_favorite);
    
    // Call the service
    const result = await profileService.createFavoriteProfile(
      profile_id_num,
      favorite_profile_id_num,
      is_favorite_bool,
      Number(req.user?.account_id)
    );
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    res.status(200).json({
      success: true,
      data: result.data,
      message: is_favorite_bool ? 'Added to favorites' : 'Removed from favorites'
    });
  } catch (error: any) {
    console.error('Error in createFavoriteProfile controller:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update favorite status',
      error: error.message
    });
  }
};

/**
 * @swagger
 * /profile/account_profiles/{accountId}:
 *   get:
 *     summary: Get all profiles for a specific account
 *     tags: [Profile]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: accountId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Account ID to get profiles for
 *     responses:
 *       200:
 *         description: Successfully retrieved profiles
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ProfilePersonal'
 *       400:
 *         description: Invalid account ID
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export const getProfilesByAccountId = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const accountId = parseInt(req.params.accountId);
    if (isNaN(accountId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid account ID'
      });
    }

    const profileService = new ProfileService();
    const result = await profileService.getProfilesByAccountId(accountId);
    
    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error: any) {
    console.error('Error in getProfilesByAccountId:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch profiles'
    });
  }
};

export const deleteFavorite = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const profileService = new ProfileService();
    const {profileId, favoriteProfileId} = req.body;
    console.log(profileId, favoriteProfileId);
    if (!profileId) {
      return res.status(400).json({
        success: false,
        message: 'Profile ID is required',
        error: 'Profile ID is required to delete favorite'
      });
    }

    const result = await profileService.deleteFavorite({profileId: Number(profileId), account: Number(req.user?.account_id)});
    
    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json({
      success: true,
      data: result.data,
      message: 'Removed from favorites'
    });
  } catch (error: any) {
    console.error('Error in deleteFavorite controller:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove from favorites',
      error: error.message
    });
  }
};

// Property Update/Delete Operations
export const updateProfileProperty = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const profileService = new ProfileService();
    const propertyId = req.params.id;
    
    const propertyData = {
      ...req.body,
      property_id: parseInt(propertyId),
      modified_user: req.user?.email
    };

    const result = await profileService.updateProfileProperty(propertyData);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    res.status(200).json({
      success: true,
      status: 'success',
      message: 'Property updated successfully',
      data: result
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to update profile property',
      error: error.message
    });
  }
};

export const deleteProfileProperty = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const profileService = new ProfileService();
    const propertyId = req.params.id;
    const profileId = req.body.profile_id || req.query.profile_id;
    
    if (!profileId) {
      return res.status(400).json({
        success: false,
        message: 'profile_id is required'
      });
    }

    const deleteData = {
      profile_id: parseInt(profileId as string),
      property_id: parseInt(propertyId),
      created_user: req.user?.email
    };

    const result = await profileService.deleteProfileProperty(deleteData);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    res.status(200).json({
      success: true,
      status: 'success',
      message: 'Property deleted successfully',
      data: result
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete profile property',
      error: error.message
    });
  }
};

// Family Reference Update/Delete Operations
export const updateFamilyReference = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const profileService = new ProfileService();
    const referenceId = req.params.id;
    
    const referenceData = {
      ...req.body,
      reference_id: parseInt(referenceId),
      modified_user: req.user?.email
    };

    const result = await profileService.updateFamilyReference(referenceData);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    res.status(200).json({
      success: true,
      status: 'success',
      message: 'Family reference updated successfully',
      data: result
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to update family reference',
      error: error.message
    });
  }
};

export const deleteFamilyReference = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const profileService = new ProfileService();
    const referenceId = req.params.id;
    const profileId = req.body.profile_id || req.query.profile_id;
    
    if (!profileId) {
      return res.status(400).json({
        success: false,
        message: 'profile_id is required'
      });
    }

    const deleteData = {
      profile_id: parseInt(profileId as string),
      reference_id: parseInt(referenceId),
      created_user: req.user?.email
    };

    const result = await profileService.deleteFamilyReference(deleteData);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    res.status(200).json({
      success: true,
      status: 'success',
      message: 'Family reference deleted successfully',
      data: result
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete family reference',
      error: error.message
    });
  }
};

// Education Update/Delete Operations
export const updateProfileEducation = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const profileService = new ProfileService();
    const educationId = req.params.id;
    
    const educationData = {
      ...req.body,
      education_id: parseInt(educationId),
      modified_user: req.user?.email
    };

    const result = await profileService.updateProfileEducation(educationData);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    res.status(200).json({
      success: true,
      status: 'success',
      message: 'Education updated successfully',
      data: result
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to update profile education',
      error: error.message
    });
  }
};

export const deleteProfileEducation = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const profileService = new ProfileService();
    const educationId = req.params.id;
    const profileId = req.body.profile_id || req.query.profile_id;
    
    if (!profileId) {
      return res.status(400).json({
        success: false,
        message: 'profile_id is required'
      });
    }

    const deleteData = {
      profile_id: parseInt(profileId as string),
      education_id: parseInt(educationId),
      created_user: req.user?.email
    };

    const result = await profileService.deleteProfileEducation(deleteData);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    res.status(200).json({
      success: true,
      status: 'success',
      message: 'Education deleted successfully',
      data: result
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete profile education',
      error: error.message
    });
  }
};

// Employment Update/Delete Operations
export const updateProfileEmployment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const profileService = new ProfileService();
    const employmentId = req.params.id;
    
    const employmentData = {
      ...req.body,
      employment_id: parseInt(employmentId),
      modified_user: req.user?.email
    };

    const result = await profileService.updateProfileEmployment(employmentData);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    res.status(200).json({
      success: true,
      status: 'success',
      message: 'Employment updated successfully',
      data: result
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to update profile employment',
      error: error.message
    });
  }
};

export const deleteProfileEmployment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const profileService = new ProfileService();
    const employmentId = req.params.id;
    const profileId = req.body.profile_id || req.query.profile_id;
    
    if (!profileId) {
      return res.status(400).json({
        success: false,
        message: 'profile_id is required'
      });
    }

    const deleteData = {
      profile_id: parseInt(profileId as string),
      employment_id: parseInt(employmentId),
      created_user: req.user?.email
    };

    const result = await profileService.deleteProfileEmployment(deleteData);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    res.status(200).json({
      success: true,
      status: 'success',
      message: 'Employment deleted successfully',
      data: result
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete profile employment',
      error: error.message
    });
  }
};

// Lifestyle Update/Delete Operations
export const updateProfileLifestyle = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const profileService = new ProfileService();
    const lifestyleId = req.params.id;
    
    const lifestyleData = {
      ...req.body,
      lifestyle_id: parseInt(lifestyleId),
      modified_user: req.user?.email
    };

    const result = await profileService.updateProfileLifestyle(lifestyleData);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    res.status(200).json({
      success: true,
      status: 'success',
      message: 'Lifestyle updated successfully',
      data: result
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to update profile lifestyle',
      error: error.message
    });
  }
};

export const deleteProfileLifestyle = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const profileService = new ProfileService();
    const lifestyleId = req.params.id;
    const profileId = req.body.profile_id || req.query.profile_id;
    
    if (!profileId) {
      return res.status(400).json({
        success: false,
        message: 'profile_id is required'
      });
    }

    const deleteData = {
      profile_id: parseInt(profileId as string),
      lifestyle_id: parseInt(lifestyleId),
      created_user: req.user?.email
    };

    const result = await profileService.deleteProfileLifestyle(deleteData);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    res.status(200).json({
      success: true,
      status: 'success',
      message: 'Lifestyle deleted successfully',
      data: result
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete profile lifestyle',
      error: error.message
    });
  }
};

// Personal Profile Update/Delete Operations
export const updatePersonalProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const profileService = new ProfileService();
    const profileId = req.params.id;
    
    const profileData = {
      ...req.body,
      profile_id: parseInt(profileId),
      modified_user: req.user?.email
    };

    const result = await profileService.updatePersonalProfile(profileData);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    res.status(200).json({
      success: true,
      status: 'success',
      message: result.message || 'Personal profile updated successfully',
      data: result
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to update personal profile',
      error: error.message
    });
  }
};

export const deletePersonalProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const profileService = new ProfileService();
    const profileId = req.params.id;
    
    const deleteData = {
      profile_id: parseInt(profileId),
      created_user: req.user?.email
    };

    const result = await profileService.deletePersonalProfile(deleteData);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    res.status(200).json({
      success: true,
      status: 'success',
      message: 'Personal profile deleted successfully',
      data: result
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete personal profile',
      error: error.message
    });
  }
};

export const getCompleteProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const profileService = new ProfileService();
    
    // Add account_id and created_user from authenticated user
    const profileData = {
      ...req.body,
      account_code: req.user?.account_code,
      created_user: req.user?.email
    };

    const result = await profileService.getCompleteProfile(profileData);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    res.status(200).json({
      success: true,
      status: 'success',
      message: 'Complete profile data retrieved successfully',
      data: result.data
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to get complete profile data',
      error: error.message
    });
  }
};

export const getAllProfiles = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const profileService = new ProfileService();
    
    // Add account_id and created_user from authenticated user
    const profileData = {
      ...req.body,
      account_code: req.user?.account_code,
      created_user: req.user?.email
    };

    const result = await profileService.getAllProfiles(profileData);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    res.status(200).json({
      success: true,
      status: 'success',
      message: 'All profiles retrieved successfully',
      data: result.data
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to get all profiles',
      error: error.message
    });
  }
};