import bcrypt from 'bcrypt';
import { LoginCredentials, LoginResponse, VerifyOTPResult } from '../interfaces/auth.interface';
import { AuthRepository } from '../repositories/auth.repository';
import { generateOTP, sendOTP } from '../utils/email.util';

export class AuthService {
  private authRepository: AuthRepository;

  constructor() {
    this.authRepository = new AuthRepository();
  }

  async login(credentials: { 
    email: string; 
    password: string; 
    clientInfo: {
      ipAddress: string;
      userAgent: string;
      systemName: string;
      location: string;
    }
  }): Promise<LoginResponse> {
    try {
      const user = await this.authRepository.findUserByEmail(credentials.email);

      if (!user) {
        return {
          success: false,
          message: 'Invalid email or password'
        };
      }

      // const validPassword = await bcrypt.compare(credentials.password, user.password);
      const validPassword = credentials.password === user.password;
      if (!validPassword) {
        return {
          success: false,
          message: 'Invalid email or password'
        };
      }

      // Generate OTP
      const otp = generateOTP();
      
      // Create login history entry with OTP and client info
      const historyId = await this.authRepository.createLoginHistory(
        credentials.email, 
        otp,
        credentials.clientInfo.ipAddress,
        credentials.clientInfo.systemName,
        credentials.clientInfo.userAgent,
        credentials.clientInfo.location
      );

      // Send OTP via email
      const otpSent = await sendOTP(credentials.email, otp);

      if (!otpSent) {
        return {
          success: false,
          message: 'Failed to send OTP'
        };
      }

      return {
        success: true,
        message: 'Login successful. Please verify OTP sent to your email.',
        user: {
          history_id: historyId,
          account_code: user.account_code,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name
        }
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Internal server error'
      };
    }
  }

  async verifyOTP(historyId: number, otp: string): Promise<VerifyOTPResult> {
    try {
      const result = await this.authRepository.verifyOTP(historyId, otp);

      if (result.error) {
        return {
          success: false,
          message: result.error
        };
      }

      return {
        success: true,
        user: {
          login_id: result.login_id,
          account_code: result.account_code,
          email: result.email,
          password: result.password,
          first_name: result.first_name,
          last_name: result.last_name,
          phone: result.primary_phone,
          date_of_birth: result.birth_date,
          age: result.age,
          address: result.address_line1,
          city: result.city,
          state: result.state,
          country: result.country,
          zip_code: result.zip
        }
      };
    } catch (error) {
      console.error('OTP verification error:', error);
      return {
        success: false,
        message: 'Internal server error'
      };
    }
  }

  async changePassword(accountCode: string, currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      // Get user details
      const user = await this.authRepository.findUserByAccountCode(accountCode);
      if (!user) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      // Verify current password
      const validPassword = await bcrypt.compare(currentPassword, user.password);
      if (!validPassword) {
        return {
          success: false,
          message: 'Current password is incorrect'
        };
      }

      // Hash new password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      const updated = await this.authRepository.updatePassword(user.account_code, hashedPassword);
      if (!updated) {
        return {
          success: false,
          message: 'Failed to update password'
        };
      }

      return {
        success: true,
        message: 'Password updated successfully'
      };
    } catch (error) {
      console.error('Password change error:', error);
      return {
        success: false,
        message: 'Internal server error'
      };
    }
  }

  async forgotPassword(email: string): Promise<{ success: boolean; message: string; history_id?: number }> {
    try {
      // Find user by email
      const user = await this.authRepository.findUserByEmail(email);
      
      // For security, don't reveal if email exists or not
      if (!user) {
        return {
          success: true,
          message: 'If your email is registered, you will receive a password reset OTP'
        };
      }

      // Generate OTP
      const otp = generateOTP();
      
      // Create password reset history entry with OTP
      const historyId = await this.authRepository.createLoginHistory(email, otp);

      // Send OTP via email
      const otpSent = await sendOTP(email, otp);

      if (!otpSent) {
        return {
          success: false,
          message: 'Failed to send OTP'
        };
      }

      return {
        success: true,
        message: 'Password reset OTP has been sent to your email',
        history_id: historyId
      };
    } catch (error) {
      console.error('Forgot password error:', error);
      return {
        success: false,
        message: 'Internal server error'
      };
    }
  }

  async resetPassword(historyId: number, otp: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      // Verify OTP
      const result = await this.authRepository.verifyOTP(historyId, otp);
      
      if (!result) {
        return {
          success: false,
          message: 'Invalid or expired OTP'
        };
      }

      // Hash new password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      const updated = await this.authRepository.updatePassword(result.account_code, hashedPassword);
      
      if (!updated) {
        return {
          success: false,
          message: 'Failed to update password'
        };
      }

      return {
        success: true,
        message: 'Password has been reset successfully'
      };
    } catch (error) {
      console.error('Reset password error:', error);
      return {
        success: false,
        message: 'Internal server error'
      };
    }
  }
} 