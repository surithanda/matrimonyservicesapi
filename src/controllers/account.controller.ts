import { Request, Response } from 'express';
import pool from '../config/database';
import { IAccount } from '../interfaces/account.interface';
import { generateAccountCode } from '../utils/helpers';
import bcrypt from 'bcrypt';

export const registerAccount = async (req: Request, res: Response) => {
  try {
    const accountData: IAccount = req.body;
    const connection = await pool.getConnection();
    
    try {
      // Check if user already exists (by email and phone)
      const [existingAccounts] = await connection.execute(
        `SELECT account_code FROM account 
         WHERE email = ? OR primary_phone = ?`,
        [accountData.email, accountData.primary_phone]
      );

      if (Array.isArray(existingAccounts) && existingAccounts.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'An account with this email or phone number already exists'
        });
      }

      // Generate unique account code
      accountData.account_code = await generateAccountCode();
      
      // Hash the password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(accountData.password, saltRounds);
      
      await connection.beginTransaction();
      
      const [result] = await connection.execute(
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
      
      await connection.commit();
      
      res.status(201).json({
        success: true,
        message: 'Account registered successfully',
        data: { account_code: accountData.account_code }
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to register account',
      error: error.message
    });
  }
};                 