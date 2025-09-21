import stripe from '../../config/stripe';
import { StripeCustomerRepository } from '../../repositories/stripe/customer.repository';
import { AccountRepository } from '../../repositories/account.repository';
import { PoolConnection } from 'mysql2/promise';
import pool from '../../config/database';

export class StripeCustomerService {
  private stripeCustomerRepository: StripeCustomerRepository;
  private accountRepository: AccountRepository;

  constructor() {
    this.stripeCustomerRepository = new StripeCustomerRepository();
    this.accountRepository = new AccountRepository();
  }

  async createCustomer(accountId: number): Promise<any> {
    const connection = await pool.getConnection();
    
    try {
      // Get account details
      const account = await this.accountRepository.findByAccountCode(accountId.toString());
      
      if (!account) {
        throw new Error('Account not found');
      }

      // Check if customer already exists
      const existingCustomer = await this.stripeCustomerRepository.findByAccountId(accountId);
      
      if (existingCustomer) {
        return {
          success: true,
          message: 'Customer already exists',
          data: existingCustomer
        };
      }

      // Create customer in Stripe
      const customer = await stripe.customers.create({
        email: account.email,
        name: `${account.first_name} ${account.last_name}`,
        phone: account.primary_phone,
        address: {
          line1: account.address_line1,
          line2: account.address_line2 || '',
          city: account.city,
          state: account.state,
          postal_code: account.zip,
          country: account.country,
        },
        metadata: {
          account_id: accountId.toString()
        }
      });

      // Save customer to database
      await this.stripeCustomerRepository.create(customer, connection);

      return {
        success: true,
        message: 'Customer created successfully',
        data: customer
      };
    } catch (error: any) {
      throw error;
    } finally {
      connection.release();
    }
  }

  async getCustomer(customerId: string): Promise<any> {
    try {
      // Get from database first
      const localCustomer = await this.stripeCustomerRepository.findById(customerId);
      
      if (!localCustomer) {
        // If not in database, try to get from Stripe
        const stripeCustomer = await stripe.customers.retrieve(customerId);
        
        if (stripeCustomer && !stripeCustomer.deleted) {
          // Save to database
          await this.stripeCustomerRepository.create(stripeCustomer as any);
          return {
            success: true,
            message: 'Customer retrieved from Stripe',
            data: stripeCustomer
          };
        }
        
        return {
          success: false,
          message: 'Customer not found'
        };
      }
      
      return {
        success: true,
        message: 'Customer found',
        data: localCustomer
      };
    } catch (error: any) {
      if (error.code === 'resource_missing') {
        return {
          success: false,
          message: 'Customer not found in Stripe'
        };
      }
      throw error;
    }
  }

  async updateCustomer(customerId: string, updateData: any): Promise<any> {
    try {
      // Update in Stripe
      const customer = await stripe.customers.update(customerId, updateData);
      
      // Update in database
      await this.stripeCustomerRepository.create(customer as any);
      
      return {
        success: true,
        message: 'Customer updated successfully',
        data: customer
      };
    } catch (error: any) {
      throw error;
    }
  }

  async deleteCustomer(customerId: string): Promise<any> {
    try {
      // Delete in Stripe
      const deleted = await stripe.customers.del(customerId);
      
      // Soft delete in database
      await this.stripeCustomerRepository.softDelete(customerId);
      
      return {
        success: true,
        message: 'Customer deleted successfully',
        data: deleted
      };
    } catch (error: any) {
      throw error;
    }
  }

  async syncCustomerFromStripe(customerId: string): Promise<any> {
    try {
      // Get from Stripe
      const customer = await stripe.customers.retrieve(customerId);
      
      if (customer && !customer.deleted) {
        // Save to database
        await this.stripeCustomerRepository.create(customer as any);
        
        return {
          success: true,
          message: 'Customer synced successfully',
          data: customer
        };
      }
      
      return {
        success: false,
        message: 'Customer not found or deleted'
      };
    } catch (error: any) {
      throw error;
    }
  }
}
