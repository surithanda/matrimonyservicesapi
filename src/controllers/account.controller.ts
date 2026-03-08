import { Request, Response } from 'express';
import { AccountService } from '../services/account.service';
import { AuthenticatedRequest } from '../interfaces/auth.interface';
import fs from 'fs';
import path from 'path';
import pool from '../config/database';

export const registerAccount = async (req: Request, res: Response) => {
  try {
    // extract client id from api key and domain
    const apiKey = req.headers['x-api-key'];
    const domain = req.headers.origin || req.headers.referer;
    console.log("Request received:", { apiKey, domain });

    if (req?.body) {
      if (domain?.includes('localhost')) {
        // Bypass domain check for localhost during development
        console.log("Bypassing domain check for localhost");
        req.body.client_id = -1;
      } else {
        const query = `CALL api_clients_get(?, ?)`;
        const [results] = await pool.execute(query, [apiKey, null]) as any;
        const match = results[0]?.[0];

        if (!match) {
          console.log("No API client found for apiKey:", apiKey);
          return res.status(400).json({
            success: false,
            message: 'Invalid API key. Please contact support.',
            error: 'Failed to register account'
          });
        }

        console.log("API Client lookup result:", match.partner_root_domain);

        // Sanitize the stored domain (strip trailing slash) and do a plain string comparison
        const storedDomain = match.partner_root_domain?.trim().replace(/\/+$/, '');
        const requestDomain = (domain ?? '').replace(/\/+$/, '');

        if (storedDomain && requestDomain.includes(storedDomain)) {
          // Domain is valid, proceed with registration
          console.log("Domain validation succeeded:", domain);
        } else {
          console.log("Domain validation failed:", { requestDomain, storedDomain });
          return res.status(400).json({
            success: false,
            message: 'The current domain is not registered with us. Please contact support.',
            error: 'Failed to register account'
          });
        }

        if (!match?.partner_id) {
          console.log("No valid partner_id found for:", { apiKey, domain });
          return res.status(400).json({
            success: false,
            message: 'No client match found for the provided domain: ' + domain,
            error: 'Failed to register account'
          });
        }

        console.log("Valid API client match found:", { apiKey, domain, partner_id: match.partner_id });
        req.body.client_id = match.partner_id;
      }
    }

    console.log("Account registration data:", req.body);

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
