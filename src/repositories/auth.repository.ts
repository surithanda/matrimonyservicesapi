import pool from '../config/database';

export class AuthRepository {
  async findUserByEmail(email: string): Promise<any> {
    const [results] = await pool.query(
      'SELECT account_code, email, password, first_name, last_name FROM account WHERE email = ?',
      [email]
    );
    return (results as any[])[0];
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
    const [results] = await pool.query(
      `SELECT h.*, a.* 
       FROM login_history h
       JOIN account a ON h.login_name = a.email
       WHERE h.history_id = ? 
       AND h.email_otp = ? 
       AND h.email_otp_valid_end > NOW()
       AND h.login_status = 0`,
      [historyId, otp]
    );

    if ((results as any[]).length > 0) {
      // Update login status to success (1)
      await pool.query(
        'UPDATE login_history SET login_status = 1 WHERE history_id = ?',
        [historyId]
      );
      return (results as any[])[0];
    }

    // Update login status to failed (2) if OTP is invalid
    await pool.query(
      'UPDATE login_history SET login_status = 2, login_failure_reason = ? WHERE history_id = ?',
      ['Invalid OTP', historyId]
    );
    return null;
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