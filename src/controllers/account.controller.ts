import { Request, Response } from 'express';
import { AccountService } from '../services/account.service';
import { AuthenticatedRequest } from '../interfaces/auth.interface';
import fs from 'fs';
import path from 'path';

export const registerAccount = async (req: Request, res: Response) => {
  try {
    console.log(req.body);
    const accountService = new AccountService();
    const result = await accountService.registerAccount(req.body);

    console.log("Controller result", result);
    console.log("-----------------------------------------------------------------------------");
    if (!result.success) {
      return res.status(409).json(result);
    }
    
    res.status(201).json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to register account',
      error: error.message
    });
  }
};

export const updateAccount = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const accountService = new AccountService();
    const accountCode = req.user?.account_code;

    if (!accountCode) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const result = await accountService.updateAccount(accountCode, req.body);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to update account',
      error: error.message
    });
  }
};

export const uploadPhoto = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No photo file uploaded'
      });
    }

    const accountService = new AccountService();
    const accountCode = req.user?.account_code;
    
    if (!accountCode) {
      // Delete uploaded file if unauthorized
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting file:', unlinkError);
      }
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    // Get the existing account to check for old photo
    const existingAccount = await accountService.getAccount(accountCode);
    if (!existingAccount.success) {
      // Delete uploaded file if account not found
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting file:', unlinkError);
      }
      return res.status(404).json(existingAccount);
    }

    // If there's an existing photo, delete it
    if (existingAccount.data?.photo) {
      const oldPhotoPath = path.join(__dirname, '../../uploads/photos', existingAccount.data.photo);
      if (fs.existsSync(oldPhotoPath)) {
        try {
          fs.unlinkSync(oldPhotoPath);
        } catch (unlinkError) {
          console.error('Error deleting old photo:', unlinkError);
        }
      }
    }

    // Store relative path in database
    const relativePhotoPath = `account/${req.file.filename}`;
    const result = await accountService.updateAccount(accountCode, {
      photo: relativePhotoPath
    });

    if (!result.success) {
      // Delete uploaded file if update fails
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting uploaded file:', unlinkError);
      }
      return res.status(400).json(result);
    }

    res.status(200).json({
      success: true,
      message: 'Photo uploaded successfully',
      data: {
        photo_url: `/uploads/photos/${relativePhotoPath}`
      }
    });
  } catch (error: any) {
    // Delete uploaded file if any error occurs
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting uploaded file on error:', unlinkError);
      }
    }
    res.status(500).json({
      success: false,
      message: 'Failed to upload photo',
      error: error.message
    });
  }
};

export const getProfilePhoto = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const accountService = new AccountService();
    const accountCode = req.user?.account_code;

    if (!accountCode) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const result = await accountService.getProfilePhoto(accountCode);
    if (!result.success) {
      return res.status(404).json(result);
    }

    // Return the URL for the photo
    res.status(200).json({
      success: true,
      message: 'Photo retrieved successfully',
      data: {
        photo_url: result.photoUrl ? `/uploads/${result.photoUrl}` : null
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve photo',
      error: error.message
    });
  }
};                 