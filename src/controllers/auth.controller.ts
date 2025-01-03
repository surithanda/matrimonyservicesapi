import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import jwt from 'jsonwebtoken';
import { OTPVerificationResponse } from '../interfaces/auth.interface';

// Add custom interface for Request with user
interface AuthenticatedRequest extends Request {
  user?: {
    account_code: string;
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

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required'
        });
      }

      const result = await this.authService.login({ email, password });

      if (!result.success) {
        return res.status(401).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };

  public verifyOTP = async (req: Request, res: Response): Promise<Response<OTPVerificationResponse>> => {
    try {
      const { history_id, otp } = req.body;

      if (!history_id || !otp) {
        return res.status(400).json({
          success: false,
          message: 'History ID and OTP are required'
        });
      }

      const result = await this.authService.verifyOTP(history_id, otp);
      
      if (!result || !result.user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid OTP verification result'
        });
      }

      // Generate JWT token after successful verification
      const token = jwt.sign(
        { 
          user_id: result.user.login_id,
          account_code: result.user.account_code 
        },
        process.env.JWT_SECRET || 'Abhishek@123',  // Fallback secret
        { expiresIn: '24h' }
      );

      return res.status(200).json({
        success: true,
        message: 'OTP verified successfully',
        token,
        user: {
          full_name: result.user.first_name + ' ' + result.user.last_name,
          email: result.user.email,
          phone: result.user.phone,
          date_of_birth: result.user.date_of_birth,
          age: result.user.age,
          address: result.user.address,
          city: result.user.city,
          state: result.user.state,
          country: result.user.country,
          zip_code: result.user.zip_code,
          account_code: result.user.account_code
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
      const accountCode = req.user?.account_code; // This will come from JWT middleware
      console.log(accountCode, req.user);

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

      // Validate password strength
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(new_password)) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character'
        });
      }

      if (!accountCode) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
      }

      const result = await this.authService.changePassword(accountCode, current_password, new_password);
      
      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
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
        message: 'Internal server error'
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
        message: 'Internal server error'
      });
    }
  };
} 