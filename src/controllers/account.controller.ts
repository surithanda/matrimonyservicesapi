import { Request, Response } from 'express';
import { AccountService } from '../services/account.service';
import { AuthenticatedRequest } from '../interfaces/auth.interface';
import fs from 'fs';
import path from 'path';
import { createFile, getFileById, deleteFile } from '../utils/drive.util';

export const registerAccount = async (req: Request, res: Response) => {
  try {
    // console.log(req.body);
    const accountService = new AccountService();
    const result = await accountService.registerAccount(req.body);

    // console.log("Controller result", result);
    // console.log("-----------------------------------------------------------------------------");
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

export const getAccountDetails = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const accountService = new AccountService();
    const accountCode = req.user?.account_code;

    if (!accountCode) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const result = await accountService.getAccount(String(req?.user?.email));
    
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
    console.log("uploading file ",req.file)

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No photo file uploaded'
      });
    }

    const accountService = new AccountService();
    const accountCode = req.user?.account_code;
    
    if (!accountCode) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    // Get the existing account to check for old photo
    const existingAccount = await accountService.getAccount(accountCode);
    if (!existingAccount.success) {
      return res.status(404).json(existingAccount);
    }

    // Upload file to Google Drive using multer file
    const driveFile = await createFile(req.file);
    
    if (!driveFile.data.id) {
      return res.status(500).json({
        success: false,
        message: 'Failed to upload file to Google Drive',
      });
    }

    const fileDetails = await getFileById(driveFile.data.id);

    if (existingAccount.data?.photo && existingAccount.data.photo.startsWith('https://')) {
      try {
        const fileId = existingAccount.data.photo.split('/').pop()?.split('?')[0];
        if (fileId) {
          await deleteFile(fileId);
        }
      } catch (unlinkError) {
        console.error('Error deleting old photo from Google Drive:', unlinkError);
      }
    }

    const result = await accountService.updateAccount(accountCode, {
      photo: fileDetails.imgUrl
    });

    if (!result.success) {
      try {
        await deleteFile(driveFile.data.id);
      } catch (unlinkError) {
        console.error('Error deleting uploaded file from Google Drive:', unlinkError);
      }
      
      try {
        fs.unlinkSync(req.file.path);
      } catch (error) {
        console.error('Error deleting local file:', error);
      }
      
      return res.status(400).json(result);
    }

    try {
      fs.unlinkSync(req.file.path);
      console.log('Local file cleaned up after successful upload');
    } catch (error) {
      console.error('Failed to clean up local file:', error);
    }

    res.status(200).json({
      success: true,
      message: 'Photo uploaded successfully',
      data: {
        photo_url: fileDetails.imgUrl
      }
    });
  } catch (error: any) {
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting local file on error:', unlinkError);
      }
    }
    
    console.error('Error uploading photo:', error);
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