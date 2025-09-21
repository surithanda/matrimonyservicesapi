import stripe from '../../config/stripe';
import Stripe from 'stripe';
import { StripeSubscriptionRepository } from '../../repositories/stripe/subscription.repository';
import { StripeCustomerRepository } from '../../repositories/stripe/customer.repository';
import { StripePriceRepository } from '../../repositories/stripe/price.repository';
import pool from '../../config/database';

// Define the payment behavior type to match Stripe's expected values
type StripePaymentBehavior = Stripe.SubscriptionCreateParams.PaymentBehavior;

export class StripeSubscriptionService {
  private stripeSubscriptionRepository: StripeSubscriptionRepository;
  private stripeCustomerRepository: StripeCustomerRepository;
  private stripePriceRepository: StripePriceRepository;

  constructor() {
    this.stripeSubscriptionRepository = new StripeSubscriptionRepository();
    this.stripeCustomerRepository = new StripeCustomerRepository();
    this.stripePriceRepository = new StripePriceRepository();
  }

  async createSubscription(subscriptionData: {
    customer: string;
    items: Array<{ price: string; quantity?: number }>;
    trial_period_days?: number;
    metadata?: Record<string, string>;
    payment_behavior?: StripePaymentBehavior;
    payment_method?: string;
    promotion_code?: string;
  }): Promise<any> {
    const connection = await pool.getConnection();
    
    try {
      // Check if customer exists
      const customer = await this.stripeCustomerRepository.findById(subscriptionData.customer);
      
      if (!customer) {
        // Try to get from Stripe
        try {
          const stripeCustomer = await stripe.customers.retrieve(subscriptionData.customer);
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

      // Check if prices exist
      for (const item of subscriptionData.items) {
        const price = await this.stripePriceRepository.findById(item.price);
        
        if (!price) {
          // Try to get from Stripe
          try {
            const stripePrice = await stripe.prices.retrieve(item.price);
            await this.stripePriceRepository.create(stripePrice);
          } catch (error) {
            return {
              success: false,
              message: `Price ${item.price} not found`
            };
          }
        }
      }

      // Create subscription in Stripe
      const subscription = await stripe.subscriptions.create({
        customer: subscriptionData.customer,
        items: subscriptionData.items,
        trial_period_days: subscriptionData.trial_period_days,
        payment_behavior: subscriptionData.payment_behavior as Stripe.SubscriptionCreateParams.PaymentBehavior,
        default_payment_method: subscriptionData.payment_method,
        // promotion_code is not directly supported in SubscriptionCreateParams
        // Use metadata to store it if needed
        metadata: {
          ...subscriptionData.metadata,
          ...(subscriptionData.promotion_code ? { promotion_code: subscriptionData.promotion_code } : {})
        },
        expand: ['latest_invoice.payment_intent']
      });

      // Save subscription to database
      await this.stripeSubscriptionRepository.create(subscription as any, connection);

      return {
        success: true,
        message: 'Subscription created successfully',
        data: subscription
      };
    } catch (error: any) {
      throw error;
    } finally {
      connection.release();
    }
  }

  async getSubscription(subscriptionId: string): Promise<any> {
    try {
      // Get from database first
      const localSubscription = await this.stripeSubscriptionRepository.findById(subscriptionId);
      
      if (!localSubscription) {
        // If not in database, try to get from Stripe
        const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId, {
          expand: ['latest_invoice.payment_intent', 'customer', 'items.data.price.product']
        });
        
        // Save to database
        await this.stripeSubscriptionRepository.create(stripeSubscription as any);
        
        return {
          success: true,
          message: 'Subscription retrieved from Stripe',
          data: stripeSubscription
        };
      }
      
      return {
        success: true,
        message: 'Subscription found',
        data: localSubscription
      };
    } catch (error: any) {
      if (error.code === 'resource_missing') {
        return {
          success: false,
          message: 'Subscription not found in Stripe'
        };
      }
      throw error;
    }
  }

  async listSubscriptionsByCustomer(customerId: string, status?: string): Promise<any> {
    try {
      // Get from database
      const localSubscriptions = await this.stripeSubscriptionRepository.findByCustomerId(customerId, status);
      
      if (localSubscriptions.length === 0) {
        // If none in database, get from Stripe
        const params: any = {
          customer: customerId,
          limit: 100,
          expand: ['data.latest_invoice.payment_intent', 'data.items.data.price.product']
        };
        
        if (status) {
          params.status = status;
        }
        
        const stripeSubscriptions = await stripe.subscriptions.list(params);
        
        // Save to database
        for (const subscription of stripeSubscriptions.data) {
          await this.stripeSubscriptionRepository.create(subscription as any);
        }
        
        return {
          success: true,
          message: 'Subscriptions retrieved from Stripe',
          data: stripeSubscriptions.data
        };
      }
      
      return {
        success: true,
        message: 'Subscriptions found',
        data: localSubscriptions
      };
    } catch (error: any) {
      throw error;
    }
  }

  async updateSubscription(subscriptionId: string, updateData: any): Promise<any> {
    try {
      // Update in Stripe
      const subscription = await stripe.subscriptions.update(subscriptionId, updateData);
      
      // Update in database
      await this.stripeSubscriptionRepository.create(subscription as any);
      
      return {
        success: true,
        message: 'Subscription updated successfully',
        data: subscription
      };
    } catch (error: any) {
      throw error;
    }
  }

  async cancelSubscription(subscriptionId: string, cancelAtPeriodEnd: boolean = false): Promise<any> {
    try {
      let subscription;
      
      if (cancelAtPeriodEnd) {
        // Cancel at period end
        subscription = await stripe.subscriptions.update(subscriptionId, {
          cancel_at_period_end: true
        });
      } else {
        // Cancel immediately
        subscription = await stripe.subscriptions.cancel(subscriptionId);
      }
      
      // Update in database
      await this.stripeSubscriptionRepository.create(subscription as any);
      
      return {
        success: true,
        message: cancelAtPeriodEnd ? 'Subscription will be canceled at period end' : 'Subscription canceled successfully',
        data: subscription
      };
    } catch (error: any) {
      throw error;
    }
  }

  async syncSubscriptionFromStripe(subscriptionId: string): Promise<any> {
    try {
      // Get from Stripe
      const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
        expand: ['latest_invoice.payment_intent', 'customer', 'items.data.price.product']
      });
      
      // Save to database
      await this.stripeSubscriptionRepository.create(subscription as any);
      
      return {
        success: true,
        message: 'Subscription synced successfully',
        data: subscription
      };
    } catch (error: any) {
      throw error;
    }
  }
}
