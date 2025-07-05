import { IAccount } from '../interfaces/account.interface';
import pool from '../config/database';
import { PoolConnection } from 'mysql2/promise';

export class AccountRepository {
  async findByEmailOrPhone(email: string, phone: string): Promise<any> {
    const [accounts] = await pool.execute(
      `SELECT account_code FROM account 
       WHERE email = ? OR primary_phone = ?`,
      [email, phone]
    );
    return accounts;
  }

  async findByAccountCode(accountCode: string): Promise<any> {
    const [accounts] = await pool.execute(
      `SELECT * FROM account WHERE account_code = ?`,
      [accountCode]
    );
    return (accounts as any[])[0];
  }

  async getAccountByEmail(email: string): Promise<any> {
    const [accounts] = await pool.execute(
      `CALL get_accountDetails(?)`,
      [email]
    );
    return (accounts as any[])[0];
  }



  async create(accountData: IAccount, hashedPassword: string, connection: PoolConnection): Promise<any> {

    
    const result = await connection.execute(
      // `CALL usp_account_login_create(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      `CALL eb_account_login_create(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        accountData.email, // email
        // accountData.email, // user_name (same as email)
        hashedPassword, // user_pwd
        accountData.first_name,
        accountData.middle_name || null,
        accountData.last_name,
        accountData.birth_date,
        accountData.gender,
        accountData.primary_phone,
        accountData.primary_phone_country,
        accountData.primary_phone_type,
        accountData.secondary_phone || null,
        accountData.secondary_phone_country || null,
        accountData.secondary_phone_type || null,
        accountData.address_line1,
        accountData.address_line2 || null,
        accountData.city,
        accountData.state,
        accountData.zip,
        accountData.country,
        accountData.photo || null,
        accountData.secret_question || null,
        accountData.secret_answer || null
      ]
    );
    const data = result[0];
    return data;
  }

  async update(accountCode: string, accountData: Partial<IAccount>, connection: PoolConnection): Promise<void> {
    const updateFields: string[] = [];
    const values: any[] = [];

    // Build dynamic update query based on provided fields
    Object.entries(accountData).forEach(([key, value]) => {
      if (value !== undefined && key !== 'account_code' && key !== 'email' && key !== 'password') {
        updateFields.push(`${key} = ?`);
        values.push(value);
      }
    });

    if (updateFields.length === 0) {
      return;
    }

    // Add modified date and user
    updateFields.push('modified_date = NOW()');
    updateFields.push('modified_user = ?');
    values.push('SYSTEM');

    // Add account_code for WHERE clause
    values.push(accountCode);

    await connection.execute(
      `UPDATE account SET ${updateFields.join(', ')} WHERE account_code = ?`,
      values
    );
  }
} 