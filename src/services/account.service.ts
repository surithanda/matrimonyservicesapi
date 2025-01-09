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

      // Hash password
      const saltRounds = 10;
      // const hashedPassword = await bcrypt.hash(accountData.password, saltRounds);
      const hashedPassword = accountData.password
      
      await connection.beginTransaction();
      
      await this.accountRepository.create(accountData, hashedPassword, connection);
      
      await connection.commit();
      
      return {
        success: true,
        message: 'Account registered successfully'
      };
    } catch (error: any) {
      await connection.rollback();
      // Check for specific stored procedure error messages
      if (error.message.includes('Email already exists')) {
        return {
          success: false,
          message: 'Email already exists'
        };
      } else if (error.message.includes('Primary phone number already exists')) {
        return {
          success: false,
          message: 'Phone number already exists'
        };
      }
      throw error;
    } finally {
      connection.release();
    }
  }

  async getAccount(accountCode: string): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      const account = await this.accountRepository.findByAccountCode(accountCode);
      
      if (!account) {
        return {
          success: false,
          message: 'Account not found'
        };
      }

      // Remove sensitive fields
      delete account.password;
      delete account.secret_answer;
      
      return {
        success: true,
        message: 'Account found',
        data: account
      };
    } catch (error) {
      throw error;
    }
  }

  async updateAccount(accountCode: string, accountData: Partial<IAccount>): Promise<{ success: boolean; message: string; data?: any }> {
    const connection = await pool.getConnection();
    
    try {
      // Check if account exists
      const existingAccount = await this.accountRepository.findByAccountCode(accountCode);
      
      if (!existingAccount) {
        return {
          success: false,
          message: 'Account not found'
        };
      }

      // If updating phone, check if it's already used by another account
      if (accountData.primary_phone) {
        const accountsWithPhone = await this.accountRepository.findByEmailOrPhone('', accountData.primary_phone);
        if (Array.isArray(accountsWithPhone) && accountsWithPhone.length > 0) {
          const isOwnPhone = accountsWithPhone.some(acc => acc.account_code === accountCode);
          if (!isOwnPhone) {
            return {
              success: false,
              message: 'Phone number is already in use by another account'
            };
          }
        }
      }
      
      await connection.beginTransaction();
      
      await this.accountRepository.update(accountCode, accountData, connection);
      
      await connection.commit();
      
      return {
        success: true,
        message: 'Account updated successfully'
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
} 