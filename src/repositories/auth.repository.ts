import pool from "../config/database";
import { VerifyOTPResult } from "../interfaces/auth.interface";

export class AuthRepository {
  async findUserByEmail(email: string): Promise<any> {
    const [results] = await pool.execute("CALL usp_api_find_user_for_auth(?)", [
      email,
    ]);

    // The SP returns a result set with all login table fields
    // First array element is the result set, second element is the first row
    return (results as any[])[0][0];
  }

  async findUserByAccountCode(accountCode: string): Promise<any> {
    const [results] = await pool.execute(
      "CALL usp_api_find_account_by_code(?)",
      [accountCode]
    );

    // The SP returns a result set with all account fields
    // First array element is the result set, second element is the first row
    return (results as any[])[0][0];
  }

  async createLoginHistory(
    email: string,
    otp: string,
    ipAddress: string = "127.0.0.1",
    systemName: string = "web",
    userAgent: string = "web",
    location: string = "unknown"
  ): Promise<number> {
    const [results] = await pool.execute(
      "CALL usp_api_create_login_history(?, ?, ?, ?, ?, ?)",
      [
        email, // p_login_name
        parseInt(otp), // p_email_otp
        ipAddress, // p_ip_address
        systemName, // p_system_name
        userAgent, // p_user_agent
        location, // p_location
      ]
    );

    // The SP returns a result set with the history_id
    return (results as any[])[0][0].history_id;
  }

  async validateLogin(
    email: string,
    password: string,
    ipAddress: string = "127.0.0.1",
    systemName: string = "web",
    userAgent: string = "web",
    location: string = "unknown"
  ): Promise<any> {
    try {
      const results = await pool.execute(
        "CALL eb_login_validate(?, ?, ?, ?, ?, ?)",
        [email, password, ipAddress, systemName, userAgent, location]
      );

      let response = (results[0] as any)[0][0];

      return response;
      // if(response.status == 'success') {
      //     console.log(response);
      //     const OTP = response.otp;
      //     console.log("OTP--------------->: ", OTP);
      //     // const userDetails = (results as any[])[0];
      //     // if (!userDetails || userDetails.length === 0) {
      //     //   return { error: 'Invalid OTP' };
      //     // }

      //     // return userDetails[0];
      // }
      // else {
      //     // console.log(response);
      //     const error = response.error_message;
      //     // console.log("Error--------------->: ", error);
      //     return { error: error };

      // }
    } catch (error) {
      console.error("Error in verifyOTP:", error);
      throw error;
    }
  }

  async verifyOTP(email: string, otp: string): Promise<VerifyOTPResult> {
    try {
      console.log("email", email);
      console.log("otp", otp);
      // If status checks pass, proceed with OTP verification
      const [results] = await pool.execute("CALL eb_validate_email_otp(?, ?)", [
        email,
        otp,
      ]);

      const userDetails = (results as any[])[0][0];
      console.log("userDetails", userDetails);

      const iVerifyOTPResult: VerifyOTPResult = {
        success: userDetails.status,
        message: userDetails.message,
        user: 
          {
              account_id: userDetails.account_id,
              account_code: userDetails.account_code,
              email: userDetails.email,
            }         
      };
      return iVerifyOTPResult;
      } catch (error) {
      console.error("Error in verifyOTP:", error);
      throw error;
    }
  }

  // No need for separate saveOTP and clearOTP methods as we're using the login_history table

  async updatePassword(
    email: string,
    currentPassword: string | null,
    newPassword: string
  ): Promise<any> {
    try {
      const [results] = await pool.execute(
        "CALL usp_api_update_password(?, ?, ?)",
        [email, currentPassword, newPassword]
      );
      return results;
    } catch (error) {
      console.error("Update password error:", error);
      throw error;
    }
  }
}
