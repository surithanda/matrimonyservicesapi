import pool from '../config/database';

export class AuthRepository {
  async findUserByEmail(email: string): Promise<any> {
    const [results] = await pool.execute(
      'CALL usp_api_find_user_for_auth(?)',
      [email]
    );
    
    // The SP returns a result set with all login table fields
    // First array element is the result set, second element is the first row
    return (results as any[])[0][0];
  }

  async findUserByAccountCode(accountCode: string): Promise<any> {
    const [results] = await pool.query(
      'SELECT account_code, email, password, first_name, last_name FROM account WHERE account_code = ?',
      [accountCode]
    );
    return (results as any[])[0];
  }

  async createLoginHistory(email: string, otp: string): Promise<number> {
    const [results] = await pool.query(
      `INSERT INTO login_history (
        login_name, 
        login_date, 
        login_status, 
        email_otp,
        email_otp_valid_start,
        email_otp_valid_end,
        ip_address,
        user_agent
      ) VALUES (?, NOW(), ?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 5 MINUTE), ?, ?)`,
      [
        email,
        0, // 0 for pending
        otp,
        '127.0.0.1', // You might want to pass this from the request
        'web' // You might want to pass this from the request
      ]
    );
    return (results as any).insertId;
  }

  async verifyOTP(historyId: number, otp: string): Promise<any> {
    try {
      
      // If status checks pass, proceed with OTP verification
      const [results] = await pool.execute(
        'CALL usp_api_verify_otp(?, ?)',
        [historyId, otp]
      );
      
      const userDetails = (results as any[])[0];
      if (!userDetails || userDetails.length === 0) {
        return { error: 'Invalid OTP' };
      }

      return userDetails[0];
    } catch (error) {
      console.error('Error in verifyOTP:', error);
      throw error;
    }
  }

  // No need for separate saveOTP and clearOTP methods as we're using the login_history table

  async updatePassword(accountCode: string, hashedPassword: string): Promise<boolean> {
    const [result] = await pool.execute(
      'UPDATE account SET password = ? WHERE account_code = ?',
      [hashedPassword, accountCode]
    );
    return (result as any).affectedRows > 0;
  }
} 