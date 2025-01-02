import { IAccount } from '../interfaces/account.interface';
import { AccountRepository } from '../repositories/account.repository';
import { generateAccountCode } from '../utils/helpers';
import bcrypt from 'bcrypt';
import pool from '../config/database';

export class AccountService {
  private accountRepository: AccountRepository;

  constructor() {
    this.accountRepository = new AccountRepository();
  }

  async registerAccount(accountData: IAccount): Promise<{ success: boolean; message: string; data?: any }> {
    const connection = await pool.getConnection();
    
    try {
      // Check existing account
      const existingAccounts = await this.accountRepository.findByEmailOrPhone(
        accountData.email,
        accountData.primary_phone
      );

      if (Array.isArray(existingAccounts) && existingAccounts.length > 0) {
        return {
          success: false,
          message: 'An account with this email or phone number already exists'
        };
      }

      // Generate unique account code
      accountData.account_code = await generateAccountCode();
      
      // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(accountData.password, saltRounds);
      
      await connection.beginTransaction();
      
      await this.accountRepository.create(accountData, hashedPassword, connection);
      
      await connection.commit();
      
      return {
        success: true,
        message: 'Account registered successfully',
        data: { account_code: accountData.account_code }
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
} 