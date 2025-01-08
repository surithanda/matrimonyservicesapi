import { Request, Response } from 'express';
import { ProfileService } from '../services/profile.service';
import { AuthenticatedRequest } from '../interfaces/auth.interface';

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