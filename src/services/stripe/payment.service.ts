import stripe from '../../config/stripe';
import Stripe from 'stripe';
import { StripePaymentIntentRepository, StripeChargeRepository } from '../../repositories/stripe/payment.repository';
import { StripeCustomerRepository } from '../../repositories/stripe/customer.repository';
import pool from '../../config/database';

export class StripePaymentService {
  private stripePaymentIntentRepository: StripePaymentIntentRepository;
  private stripeChargeRepository: StripeChargeRepository;
  private stripeCustomerRepository: StripeCustomerRepository;

  constructor() {
    this.stripePaymentIntentRepository = new StripePaymentIntentRepository();
    this.stripeChargeRepository = new StripeChargeRepository();
    this.stripeCustomerRepository = new StripeCustomerRepository();
  }

  async createPaymentIntent(paymentData: {
    amount: number;
    currency: string;
    customer?: string;
    payment_method?: string;
    payment_method_types?: string[];
    description?: string;
    receipt_email?: string;
    statement_descriptor?: string;
    metadata?: Record<string, string>;
  }): Promise<any> {
    const connection = await pool.getConnection();
    
    try {
      // Check if customer exists if provided
      if (paymentData.customer) {
        const customer = await this.stripeCustomerRepository.findById(paymentData.customer);
        
        if (!customer) {
          // Try to get from Stripe
          try {
            const stripeCustomer = await stripe.customers.retrieve(paymentData.customer);
            if (stripeCustomer.deleted) {
              return {
                success: false,
                message: 'Customer has been deleted'
              };
            }
            await this.stripeCustomerRepository.create(stripeCustomer as any);
          } catch (error) {
            return {
              success: false,
              message: 'Customer not found'
            };
          }
        }
      }

      // Create payment intent in Stripe
      const paymentIntent = await stripe.paymentIntents.create({
        amount: paymentData.amount,
        currency: paymentData.currency,
        customer: paymentData.customer,
        payment_method: paymentData.payment_method,
        payment_method_types: paymentData.payment_method_types || ['card'],
        description: paymentData.description,
        receipt_email: paymentData.receipt_email,
        statement_descriptor: paymentData.statement_descriptor,
        metadata: paymentData.metadata,
        confirm: paymentData.payment_method ? true : false,
      });

      // Save payment intent to database
      await this.stripePaymentIntentRepository.create(paymentIntent, connection);

      return {
        success: true,
        message: 'Payment intent created successfully',
        data: paymentIntent
      };
    } catch (error: any) {
      throw error;
    } finally {
      connection.release();
    }
  }

  async getPaymentIntent(paymentIntentId: string): Promise<any> {
    try {
      // Get from database first
      const localPaymentIntent = await this.stripePaymentIntentRepository.findById(paymentIntentId);
      
      if (!localPaymentIntent) {
        // If not in database, try to get from Stripe
        const stripePaymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        
        // Save to database
        await this.stripePaymentIntentRepository.create(stripePaymentIntent);
        
        return {
          success: true,
          message: 'Payment intent retrieved from Stripe',
          data: stripePaymentIntent
        };
      }
      
      return {
        success: true,
        message: 'Payment intent found',
        data: localPaymentIntent
      };
    } catch (error: any) {
      if (error.code === 'resource_missing') {
        return {
          success: false,
          message: 'Payment intent not found in Stripe'
        };
      }
      throw error;
    }
  }

  async confirmPaymentIntent(paymentIntentId: string, paymentMethodId?: string): Promise<any> {
    try {
      // Confirm payment intent in Stripe
      const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
        payment_method: paymentMethodId
      });
      
      // Update in database
      await this.stripePaymentIntentRepository.create(paymentIntent);
      
      return {
        success: true,
        message: 'Payment intent confirmed successfully',
        data: paymentIntent
      };
    } catch (error: any) {
      throw error;
    }
  }

  async cancelPaymentIntent(paymentIntentId: string, cancellationReason?: string): Promise<any> {
    try {
      // Cancel payment intent in Stripe
      const paymentIntent = await stripe.paymentIntents.cancel(paymentIntentId, {
        cancellation_reason: cancellationReason as any
      });
      
      // Update in database
      await this.stripePaymentIntentRepository.create(paymentIntent);
      
      return {
        success: true,
        message: 'Payment intent canceled successfully',
        data: paymentIntent
      };
    } catch (error: any) {
      throw error;
    }
  }

  async capturePaymentIntent(paymentIntentId: string, amountToCapture?: number): Promise<any> {
    try {
      // Capture payment intent in Stripe
      const paymentIntent = await stripe.paymentIntents.capture(paymentIntentId, {
        amount_to_capture: amountToCapture
      });
      
      // Update in database
      await this.stripePaymentIntentRepository.create(paymentIntent);
      
      return {
        success: true,
        message: 'Payment intent captured successfully',
        data: paymentIntent
      };
    } catch (error: any) {
      throw error;
    }
  }

  async getCharge(chargeId: string): Promise<any> {
    try {
      // Get from database first
      const localCharge = await this.stripeChargeRepository.findById(chargeId);
      
      if (!localCharge) {
        // If not in database, try to get from Stripe
        const stripeCharge = await stripe.charges.retrieve(chargeId);
        
        // Save to database
        await this.stripeChargeRepository.create(stripeCharge);
        
        return {
          success: true,
          message: 'Charge retrieved from Stripe',
          data: stripeCharge
        };
      }
      
      return {
        success: true,
        message: 'Charge found',
        data: localCharge
      };
    } catch (error: any) {
      if (error.code === 'resource_missing') {
        return {
          success: false,
          message: 'Charge not found in Stripe'
        };
      }
      throw error;
    }
  }

  async listChargesByCustomer(customerId: string): Promise<any> {
    try {
      // Get from database
      const localCharges = await this.stripeChargeRepository.findByCustomerId(customerId);
      
      if (localCharges.length === 0) {
        // If none in database, get from Stripe
        const stripeCharges = await stripe.charges.list({
          customer: customerId,
          limit: 100
        });
        
        // Save to database
        for (const charge of stripeCharges.data) {
          await this.stripeChargeRepository.create(charge);
        }
        
        return {
          success: true,
          message: 'Charges retrieved from Stripe',
          data: stripeCharges.data
        };
      }
      
      return {
        success: true,
        message: 'Charges found',
        data: localCharges
      };
    } catch (error: any) {
      throw error;
    }
  }

  async syncPaymentFromStripe(paymentIntentId: string): Promise<any> {
    try {
      // Get payment intent from Stripe
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId, {
        expand: ['charges.data']
      }) as Stripe.PaymentIntent & {
        charges?: {
          data: Stripe.Charge[];
        }
      };
      
      // Save payment intent to database
      await this.stripePaymentIntentRepository.create(paymentIntent);
      
      // Save charges to database
      if (paymentIntent.charges && paymentIntent.charges.data) {
        for (const charge of paymentIntent.charges.data) {
          await this.stripeChargeRepository.create(charge);
        }
      }
      
      return {
        success: true,
        message: 'Payment synced successfully',
        data: paymentIntent
      };
    } catch (error: any) {
      throw error;
    }
  }
}
