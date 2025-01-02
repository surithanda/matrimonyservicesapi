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
} 