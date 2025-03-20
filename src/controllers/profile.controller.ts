import { Request, Response } from 'express';
import { ProfileService } from '../services/profile.service';
import { AuthenticatedRequest } from '../interfaces/auth.interface';
import { IProfileFamilyReference, IProfileLifestyle, IProfilePhoto } from '../interfaces/profile.interface';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

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

export const createProfileAddress = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const profileService = new ProfileService();
    
    const addressData = {
      ...req.body,
      account_id: parseInt(req.user?.account_code || '0')
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

export const createProfileEmployment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const profileService = new ProfileService();
    
    const employmentData = {
      ...req.body,
      account_id: parseInt(req.user?.account_code || '0')
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

export const createFamilyReference = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const profileService = new ProfileService();
    
    const referenceData: IProfileFamilyReference = {
      ...req.body,
      account_id: parseInt(req.user?.account_code || '0')
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

// Add this helper function
const ensureDirectoryExists = (dirPath: string) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const sanitizeFilename = (filename: string): string => {
  return filename.replace(/[^a-z0-9]/gi, '-').toLowerCase();
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const accountId: any = (req as AuthenticatedRequest)?.user?.account_code;
    const profileId = req.body.profile_id;
    const uploadPath = path.join(__dirname, `../uploads/${accountId}/${profileId}/Photos/`);
    
    ensureDirectoryExists(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const caption = req.body.caption;
    if (!caption) {
      cb(new Error('Caption is required'), '');
      return;
    }
    
    const sanitizedCaption = sanitizeFilename(caption);
    cb(null, `${sanitizedCaption}.jpg`);
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if (!req.body.caption) {
      cb(new Error('Caption is required'));
      return;
    }
    cb(null, true);
  }
});

export const uploadProfilePhoto = upload.single('photo');

export const createProfilePhoto = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const profileService = new ProfileService();
    
    const photoData: IProfilePhoto = {
      profile_id: parseInt(req.body.profile_id),
      photo_type: parseInt(req.body.photo_type),
      description: req.body.description,
      caption: req.body.caption,
      url: req.file?.path || '', // Ensure req.file is defined before accessing path
      user_created: req.user?.email || '',
      ip_address: req.ip || '',
      browser_profile: req.headers['user-agent'] || ''
    };

    const result = await profileService.createProfilePhoto(photoData);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    res.status(201).json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to upload profile photo',
      error: error.message
    });
  }
};