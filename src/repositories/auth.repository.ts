import pool from '../config/database';

export class AuthRepository {
  async findUserByEmail(email: string): Promise<any> {
    const [users] = await pool.execute(
      'SELECT account_code, email, password, first_name, last_name FROM account WHERE email = ?',
      [email]
    );
    return (users as any[])[0];
  }
} 