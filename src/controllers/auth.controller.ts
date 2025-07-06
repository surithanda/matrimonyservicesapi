import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import jwt from 'jsonwebtoken';
import { OTPVerificationResponse } from '../interfaces/auth.interface';
import logger from '../config/logger';
//import { AppError } from '../middleware/error.middleware';

// Add custom interface for Request with user
interface AuthenticatedRequest extends Request {
  user?: {
    email: string;
  };
}

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  public login = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { email, password } = req.body;

      logger.info('Login attempt', {
        email,
        ip: req.ip,
        userAgent: req.get('user-agent'),
        timestamp: new Date().toISOString()
      });

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required'
        });
      }

      // Get client information from request
      const clientInfo = {
        ipAddress: req.ip || req.socket.remoteAddress || '127.0.0.1',
        userAgent: req.get('user-agent') || 'unknown',
        systemName: req.get('sec-ch-ua-platform') || 'web', // Gets OS platform
        location: req.get('accept-language') || 'unknown'    // Gets user's locale
      };

      const result = await this.authService.login({ 
        email, 
        password,
        clientInfo  // Pass client info to service
      });

      if (!result.success) {
        return res.status(401).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      logger.error('Login error:', {
        error: {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : 'No stack trace'
        },
        request: {
          body: req.body,
          headers: req.headers,
          ip: req.ip
        },
        timestamp: new Date().toISOString()
      });

      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        errorCode: 'AUTH_LOGIN_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  };

  public verifyOTP = async (req: Request, res: Response): Promise<Response<OTPVerificationResponse>> => {
    try {
      const { email, otp } = req.body;

      if (!email || !otp) {
        return res.status(400).json({
          success: false,
          message: 'Email and OTP are required'
        });
      }

      const result = await this.authService.verifyOTP(email, otp);
      console.log("result from auth controller",result);
      if (!result || !result.success) {
        return res.status(401).json({
          success: false,
          message: 'Invalid OTP verification result'
        });
      }
    
      // Generate JWT token after successful verification
      const token = jwt.sign(
        { 
          account_code: result.user?.account_code,
          account_id: result.user?.account_id,
          email: result.user?.email,
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + (72 * 60 * 60) // 24 hours from now
        },
        process.env.JWT_SECRET || 'Abhishek@123'
      );

      return res.status(200).json({
        success: true,
        message: 'OTP verified successfully',
        token,
        user: {
          account_code: result.user?.account_code,
          email: result.user?.email,
          account_id: result.user?.account_id,
        }
      });
    } catch (error) {
      console.error('OTP verification error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };

  public changePassword = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
      const { current_password, new_password, confirm_new_password } = req.body;
      
      // Get token from Authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({
          success: false,
          message: 'Authorization header missing'
        });
      }

      const token = authHeader.split(' ')[1];
      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'Token missing'
        });
      }

      // Decrypt JWT token to get email
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'Abhishek@123') as {
        email: string;  // Using account_code as it contains email
        iat: number;
        exp: number;
      };

      const email = decoded.email; // Get email from account_code

      // Validate request
      if (!current_password || !new_password || !confirm_new_password) {
        return res.status(400).json({
          success: false,
          message: 'All password fields are required'
        });
      }

      // Check if new passwords match
      if (new_password !== confirm_new_password) {
        return res.status(400).json({
          success: false,
          message: 'New passwords do not match'
        });
      }

      // Add password strength validation
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(new_password)) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character'
        });
      }

      if (!email) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
      }

      const result = await this.authService.changePassword(
        email,
        current_password,
        new_password
      );
      
      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({
          success: false,
          message: 'Invalid token'
        });
      }
      console.error('Password change error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };

  public forgotPassword = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email is required'
        });
      }

      const result = await this.authService.forgotPassword(email);
      
      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error('Forgot password error:', error);
      return res.status(500).json({
        success: false,
        message: `Internal server error: ${error}`
      });
    }
  };

  public resetPassword = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { history_id, otp, new_password, confirm_new_password } = req.body;

      // Validate request
      if (!history_id || !otp || !new_password || !confirm_new_password) {
        return res.status(400).json({
          success: false,
          message: 'All fields are required'
        });
      }

      // Check if new passwords match
      if (new_password !== confirm_new_password) {
        return res.status(400).json({
          success: false,
          message: 'New passwords do not match'
        });
      }

      // Validate password strength
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(new_password)) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character'
        });
      }

      const result = await this.authService.resetPassword(history_id, otp, new_password);
      
      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error('Reset password error:', error);
      return res.status(500).json({
        success: false,
        message: `Internal server error: ${error}`
      });
    }
  };
} 
