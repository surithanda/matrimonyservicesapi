import bcrypt from "bcrypt";
import {
  LoginCredentials,
  LoginResponse,
  VerifyOTPResult,
} from "../interfaces/auth.interface";
import { AuthRepository } from "../repositories/auth.repository";
import { ProfileRepository } from "../repositories/profile.repository";
import { generateOTP, sendOTP } from "../utils/email.util";
// import { AppError } from '../middleware/error.middleware';

export class AuthService {
  private authRepository: AuthRepository;
  private profileRepository: ProfileRepository;
  private fixedSalt = "$2b$10$YourFixedSaltHere12345678";

  constructor() {
    this.authRepository = new AuthRepository();
    this.profileRepository = new ProfileRepository();
  }

  async login(credentials: {
    email: string;
    password: string;
    clientInfo: {
      ipAddress: string;
      userAgent: string;
      systemName: string;
      location: string;
    };
  }): Promise<LoginResponse> {
    try {
      const hashedPassword = await bcrypt.hash(credentials.password, this.fixedSalt);

      const loginresult = await this.authRepository.validateLogin(
        credentials.email,
        hashedPassword,
        credentials.clientInfo.ipAddress,
        credentials.clientInfo.systemName,
        credentials.clientInfo.userAgent,
        credentials.clientInfo.location
      );

      if (loginresult.status == "success") {
        // Send OTP via email
        const otpSent = await sendOTP(credentials.email, loginresult.otp);

        if (!otpSent) {
          return {
            success: false,
            message: "Failed to send OTP",
          };
        }

        return {
          success: true,
          message: "Login successful. Please verify OTP sent to your email.",
        };
      } else {
        return {
          success: false,
          message: loginresult.error_message,
        };
      }
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        message: "Internal server error",
      };
    }
  }

  async verifyOTP(email: string, otp: string): Promise<VerifyOTPResult> {
    try {
      const results = await this.authRepository.verifyOTP(email, otp);
      
      console.log("result from auth service",results);
      console.log("user",results.user);
      console.log("message",results.message);
      console.log("success",results.success);
      return results;
      
    } catch (error) {
      console.error("OTP verification error:", error);
      return {
        success: false,
        message: "Internal server error",
        user: {
          account_id: "",
          account_code: "",
          email: "",
        }
      };
    }
  } 


  async changePassword(
    email: string,
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Call the stored procedure directly
      const [updateResult] = await this.authRepository.updatePassword(
        email,
        currentPassword,
        newPassword
      );

      // Check if we have a result and it has the expected message
      if (!updateResult || !updateResult[0] || !updateResult[0].message) {
        return {
          success: false,
          message: "Failed to update password",
        };
      }

      return {
        success: true,
        message: updateResult[0].message,
      };
    } catch (error: any) {
      console.error("Password change error:", error);
      // Handle specific SQL error states
      if (error.sqlState === "45000") {
        return {
          success: false,
          message: error.message,
        };
      }

      return {
        success: false,
        message: "Failed to update password. Please try again.",
      };
    }
  }

  async forgotPassword(
    email: string,
    clientInfo: {
      ipAddress: string;
      userAgent: string;
      systemName: string;
      location: string;
    }
  ): Promise<{ success: boolean; message: string; OTP?: number }> {
    try {
      // Find user by email
      // const user = await this.authRepository.findUserByEmail(email);

      const result = await this.authRepository.validateEmailAndGenerateOTP(email, clientInfo.ipAddress, clientInfo.userAgent, clientInfo.systemName, clientInfo.location);
      // For security, don't reveal if email exists or not
      console.log("result--->", result);
      if (!result) {
        return {
          success: result.success,
          message:
            "If your email is registered, you will receive a password reset OTP",
        };
      }

      // Send OTP via email
      const otpSent = await sendOTP(email, result.otp);

      if (!otpSent) {
        return {
          success: false,
          message: "Failed to send OTP",
        };
      }

      return {
        success: true,
        message: "Password reset OTP has been sent to your email",
        // OTP: result.otp,
      };
    } catch (error) {
      console.error("Forgot password error:", error);
      return {
        success: false,
        message: "Internal server error",
      };
    }
  }


  
  async resetPassword(
    email: string,
    otp: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const hashedPassword = await bcrypt.hash(newPassword, this.fixedSalt);
      // Verify OTP
      const result = await this.authRepository.verifyOTP(email,otp);

      if (!result || !result.success) {
        return {
          success: false,
          message: "Invalid or expired OTP",
        };
      }

      // Update password with null as currentPassword for reset flow
      const updateResult = await this.authRepository.updateNewPassword(
        result.user.email,  
        hashedPassword
      );
      console.log("updateResult",updateResult);
      // Check if we have a result and it has the expected message
      if (!updateResult || !updateResult.message) {
        return {
            success: false,
            message: updateResult.message
        };
      }

      return {
        success: true,
        message: "Password reset successfully",
      };
    } catch (error) {
      console.error("Reset password error:", error);
      if (error instanceof Error && error.message.includes("45000")) {
        return {
          success: false,
          message: error.message,
        };
      }
      return {
        success: false,
        message: "Internal server error",
      };
    }
  }
}
