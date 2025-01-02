import { Request, Response } from 'express';
import { AccountService } from '../services/account.service';

export const registerAccount = async (req: Request, res: Response) => {
  try {
    const accountService = new AccountService();
    const result = await accountService.registerAccount(req.body);
    
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