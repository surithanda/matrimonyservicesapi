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

  async create(accountData: IAccount, hashedPassword: string, connection: PoolConnection): Promise<void> {
    await connection.execute(
      `INSERT INTO account (
        account_code, email, password, primary_phone, primary_phone_country, primary_phone_type,
        secondary_phone, secondary_phone_country, secondary_phone_type,
        first_name, last_name, middle_name, birth_date, gender,
        address_line1, address_line2, city, state, zip, country,
        photo, secret_question, secret_answer, driving_license,
        created_user, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        accountData.account_code,
        accountData.email,
        hashedPassword,
        accountData.primary_phone,
        accountData.primary_phone_country,
        accountData.primary_phone_type,
        accountData.secondary_phone || null,
        accountData.secondary_phone_country || null,
        accountData.secondary_phone_type || null,
        accountData.first_name,
        accountData.last_name,
        accountData.middle_name || null,
        accountData.birth_date,
        accountData.gender,
        accountData.address_line1,
        accountData.address_line2 || null,
        accountData.city,
        accountData.state,
        accountData.zip,
        accountData.country,
        accountData.photo || null,
        accountData.secret_question || null,
        accountData.secret_answer || null,
        accountData.driving_license || null,
        'SYSTEM'
      ]
    );
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