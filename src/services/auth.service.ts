import bcrypt from 'bcrypt';
import { LoginCredentials, LoginResponse, VerifyOTPResult } from '../interfaces/auth.interface';
import { AuthRepository } from '../repositories/auth.repository';
import { generateOTP, sendOTP } from '../utils/email.util';

export class AuthService {
  private authRepository: AuthRepository;

  constructor() {
    this.authRepository = new AuthRepository();
  }

  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const user = await this.authRepository.findUserByEmail(credentials.email);

    if (!user) {
      return {
        success: false,
        message: 'Invalid email or password'
      };
    }

    const validPassword = await bcrypt.compare(credentials.password, user.password);

    if (!validPassword) {
      return {
        success: false,
        message: 'Invalid email or password'
      };
    }

    // Generate OTP
    const otp = generateOTP();
    
    // Create login history entry with OTP
    const historyId = await this.authRepository.createLoginHistory(user.email, otp);

    // Send OTP via email
    const otpSent = await sendOTP(user.email, otp);

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
  }

  async verifyOTP(historyId: number, otp: string): Promise<VerifyOTPResult> {
    const result = await this.authRepository.verifyOTP(historyId, otp);

    if (!result) {
      return {
        success: false,
        message: 'Invalid or expired OTP'
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
} 