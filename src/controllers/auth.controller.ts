import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { AccountService } from '../services/account.service';
import jwt from 'jsonwebtoken';
import { OTPVerificationResponse } from '../interfaces/auth.interface';
import logger from '../config/logger';
import pool from '../config/database';


// Add custom interface for Request with user
interface AuthenticatedRequest extends Request {
  user?: {
    email: string;
    partner_id?: number;
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

      // FIX: result.success is typed as boolean in the interface, but the service
      // actually returns the string 'Success' or 'Fail' at runtime (type mismatch in service).
      // String() normalizes both cases: String(true)='true', String('Success')='Success'.
      // A failed OTP returns 400 (user input error), NOT 401 (which triggers UnauthorizedModal).
      const isVerified = result && String(result.success) === 'Success';
      if (!isVerified) {
        return res.status(400).json({
          success: false,
          message: (result as any)?.message || 'OTP verification failed. Please try again.'
        });
      }


      // Fetch partner_id using x-api-key for the session payload
      let partnerId = 1; // Default
      const apiKey = req.headers['x-api-key'] || req.headers['X-API-KEY'] || req.headers['x-api-key'];
      if (apiKey) {
        try {
          const [clientResults] = await pool.execute("CALL api_clients_get(?, ?)", [apiKey, null]) as any;
          const match = clientResults?.[0]?.[0];
          if (match?.partner_id) {
            partnerId = match.partner_id;
          }
        } catch (err) {
          console.warn("Failed to lookup partner_id for JWT", err);
        }
      }

      // Generate JWT token after successful verification
      const token = jwt.sign(
        {
          account_code: result.user?.account_code,
          account_id: result.user?.account_id,
          partner_id: partnerId,
          email: result.user?.email,
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + (72 * 60 * 60) // 72 hours from now
        },
        process.env.JWT_SECRET!  // startup guard in auth.middleware.ts ensures this is set
      );

      // Cookie config:
      // - Production: SameSite=None;Secure — required when frontend and API are on different
      //   domains (e.g. *.vercel.app subdomains are separate sites per the Public Suffix List).
      //   SameSite=Lax/Strict refuses to send cookies in cross-site XHR even with credentials.
      // - Development: SameSite=Lax — frontend and API on localhost (same site, no Secure needed).
      res.cookie('matrimony-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 72 * 60 * 60 * 1000, // 72h — matches JWT exp
        path: '/'
      });

      // Fetch payment_status and created_date from account.
      // This is included directly in the OTP response so the frontend has the data
      // immediately after login — without requiring a separate cross-domain API call
      // that may fail due to browser third-party cookie restrictions.
      const accountService = new AccountService();
      let paymentStatus = 'unpaid';
      let createdDate: string | null = null;
      try {
        const accountDetails = await accountService.getAccount(result.user?.email || '');
        if (accountDetails.success && accountDetails.data) {
          paymentStatus = accountDetails.data.payment_status || 'unpaid';
          createdDate = accountDetails.data.created_date || null;
        }
      } catch (err) {
        console.warn('Non-critical: could not fetch payment status for OTP response:', err);
      }

      // Phase 3: token removed from JSON body — delivered exclusively via HttpOnly Set-Cookie header.
      // The user object includes payment_status + created_date so usePaymentStatus()
      // works immediately from Redux state without a separate API call.
      return res.status(200).json({
        success: true,
        message: 'OTP verified successfully',
        user: {
          account_code: result.user?.account_code,
          email: result.user?.email,
          account_id: result.user?.account_id,
          payment_status: paymentStatus,
          created_date: createdDate,
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

      // FIX: Previously read Authorization header manually to get email.
      // Since Phase 3 removed the Bearer token from axios, that always returned 401.
      // authenticateJWT middleware already verified the JWT (via cookie) and sets req.user.
      const email = req.user?.email;

      if (!email) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized: session not found'
        });
      }

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

      const clientInfo = {
        ipAddress: req.ip || req.socket.remoteAddress || '127.0.0.1',
        userAgent: req.get('user-agent') || 'unknown',
        systemName: req.get('sec-ch-ua-platform') || 'web', // Gets OS platform
        location: req.get('accept-language') || 'unknown'    // Gets user's locale
      };
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email is required'
        });
      }

      const result = await this.authService.forgotPassword(email, clientInfo);

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
      const { email, otp, new_password } = req.body;

      // Validate request
      if (!email || !otp || !new_password) {
        return res.status(400).json({
          success: false,
          message: 'All fields are required'
        });
      }

      // Check if new passwords match


      // Validate password strength
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(new_password)) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character'
        });
      }

      const result = await this.authService.resetPassword(email, otp, new_password);

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


  // public resetPassword = async (req: Request, res: Response): Promise<Response> => {
  //   try {
  //     const { history_id, otp, new_password, confirm_new_password } = req.body;

  //     // Validate request
  //     if (!history_id || !otp || !new_password || !confirm_new_password) {
  //       return res.status(400).json({
  //         success: false,
  //         message: 'All fields are required'
  //       });
  //     }

  //     // Check if new passwords match
  //     if (new_password !== confirm_new_password) {
  //       return res.status(400).json({
  //         success: false,
  //         message: 'New passwords do not match'
  //       });
  //     }

  //     // Validate password strength
  //     const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  //     if (!passwordRegex.test(new_password)) {
  //       return res.status(400).json({
  //         success: false,
  //         message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character'
  //       });
  //     }

  //     const result = await this.authService.resetPassword(history_id, otp, new_password);

  //     if (!result.success) {
  //       return res.status(400).json(result);
  //     }

  //     return res.status(200).json(result);
  //   } catch (error) {
  //     console.error('Reset password error:', error);
  //     return res.status(500).json({
  //       success: false,
  //       message: `Internal server error: ${error}`
  //     });
  //   }
  // };


  public resendOTP = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email is required',
        });
      }

      const result = await this.authService.resendOTP(email);

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error('Resend OTP error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  };

  public logout = async (req: Request, res: Response): Promise<Response> => {
    // Phase 1 (S-3/S-4): Clear the HttpOnly cookie server-side.
    // Browser cannot clear HttpOnly cookies via JS — only the server can.
    res.clearCookie('matrimony-token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/'
    });

    return res.status(200).json({ success: true, message: 'Logged out successfully' });
  };

}


