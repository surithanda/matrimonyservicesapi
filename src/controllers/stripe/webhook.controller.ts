import { Request, Response, NextFunction } from 'express';
import stripe from '../../config/stripe';
import { stripeConfig } from '../../config/stripe';
import { StripeCustomerService } from '../../services/stripe/customer.service';
import { StripeProductService } from '../../services/stripe/product.service';
import { StripePriceService } from '../../services/stripe/price.service';
import { StripeSubscriptionService } from '../../services/stripe/subscription.service';
import { StripePaymentService } from '../../services/stripe/payment.service';
import pool from '../../config/database';
import dotenv from 'dotenv';

dotenv.config();

// Determine if we're in testing mode
const WEBHOOK_TESTING_MODE = process.env.STRIPE_WEBHOOK_TESTING === 'true' || process.env.NODE_ENV === 'development';

export class StripeWebhookController {
  private stripeCustomerService: StripeCustomerService;
  private stripeProductService: StripeProductService;
  private stripePriceService: StripePriceService;
  private stripeSubscriptionService: StripeSubscriptionService;
  private stripePaymentService: StripePaymentService;

  constructor() {
    this.stripeCustomerService = new StripeCustomerService();
    this.stripeProductService = new StripeProductService();
    this.stripePriceService = new StripePriceService();
    this.stripeSubscriptionService = new StripeSubscriptionService();
    this.stripePaymentService = new StripePaymentService();
  }

  /**
   * Middleware to parse raw body for webhook testing
   */
  parseRawBody(req: Request, res: Response, next: NextFunction): void {
    if (req.body && typeof req.body !== 'string' && !Buffer.isBuffer(req.body)) {
      // If body is already parsed as JSON (like in Postman tests), use it as is
      next();
    } else {
      // If body is raw (like in real Stripe webhooks), parse it
      const rawBody = req.body;
      try {
        req.body = JSON.parse(rawBody);
        next();
      } catch (error) {
        res.status(400).send('Invalid JSON payload');
      }
    }
  }

  async handleWebhook(req: Request, res: Response): Promise<void> {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
      if (WEBHOOK_TESTING_MODE) {
        // In testing mode, we either:
        // 1. Use the signature if provided, but don't error if verification fails
        // 2. Accept the payload directly if no signature is provided
        try {
          if (sig && stripeConfig.webhookSecret) {
            event = stripe.webhooks.constructEvent(
              req.body,
              sig,
              stripeConfig.webhookSecret
            );
            console.log('Webhook signature verified in testing mode');
          } else {
            // No signature or secret, just use the body directly
            event = req.body;
            console.log('Webhook received in testing mode without signature verification');
          }
        } catch (err: any) {
          // In testing mode, we continue even if signature verification fails
          console.warn(`Webhook signature verification failed in testing mode: ${err.message}`);
          event = req.body;
        }
      } else {
        // Production mode - strict signature verification
        if (!sig) {
          res.status(400).send('Missing stripe-signature header');
          return;
        }
        
        if (!stripeConfig.webhookSecret) {
          res.status(500).send('Webhook secret not configured');
          return;
        }
        
        event = stripe.webhooks.constructEvent(
          req.body,
          sig,
          stripeConfig.webhookSecret
        );
      }
    } catch (err: any) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    // Handle the event
    try {
      await this.processEvent(event);
      res.json({ received: true });
    } catch (error: any) {
      console.error(`Error processing webhook: ${error.message}`);
      res.status(500).send(`Webhook processing error: ${error.message}`);
    }
  }

  private async processEvent(event: any): Promise<void> {
    const connection = await pool.getConnection();
    
    try {
      // Log the event
      await this.logEvent(event, connection);

      // Process based on event type
      switch (event.type) {
        // Customer events
        case 'customer.created':
        case 'customer.updated':
        case 'customer.deleted':
          await this.handleCustomerEvent(event);
          break;

        // Product events
        case 'product.created':
        case 'product.updated':
        case 'product.deleted':
          await this.handleProductEvent(event);
          break;

        // Price events
        case 'price.created':
        case 'price.updated':
        case 'price.deleted':
          await this.handlePriceEvent(event);
          break;

        // Subscription events
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
        case 'customer.subscription.trial_will_end':
          await this.handleSubscriptionEvent(event);
          break;

        // Payment events
        case 'payment_intent.created':
        case 'payment_intent.succeeded':
        case 'payment_intent.payment_failed':
        case 'payment_intent.canceled':
          await this.handlePaymentIntentEvent(event);
          break;

        // Charge events
        case 'charge.succeeded':
        case 'charge.failed':
        case 'charge.refunded':
        case 'charge.dispute.created':
          await this.handleChargeEvent(event);
          break;

        // Invoice events
        case 'invoice.created':
        case 'invoice.finalized':
        case 'invoice.payment_succeeded':
        case 'invoice.payment_failed':
          await this.handleInvoiceEvent(event);
          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
    } finally {
      connection.release();
    }
  }

  private async logEvent(event: any, connection: any): Promise<void> {
    try {
      await connection.execute(
        `INSERT INTO stripe_events (
          id, type, api_version, account, created, data, request_id, livemode
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          event.id,
          event.type,
          event.api_version,
          event.account,
          new Date(event.created * 1000),
          JSON.stringify(event.data),
          event.request?.id || null,
          event.livemode
        ]
      );
    } catch (error: any) {
      console.error(`Error logging event: ${error.message}`);
      // Continue processing even if logging fails
    }
  }

  private async handleCustomerEvent(event: any): Promise<void> {
    const customer = event.data.object;
    
    if (event.type === 'customer.deleted') {
      // Handle customer deletion
      await this.stripeCustomerService.syncCustomerFromStripe(customer.id);
    } else {
      // Handle customer creation or update
      await this.stripeCustomerService.syncCustomerFromStripe(customer.id);
    }
  }

  private async handleProductEvent(event: any): Promise<void> {
    const product = event.data.object;
    
    if (event.type === 'product.deleted') {
      // Handle product deletion (archive)
      await this.stripeProductService.updateProduct(product.id, { active: false });
    } else {
      // Handle product creation or update
      await this.stripeProductService.syncProductsFromStripe();
    }
  }

  private async handlePriceEvent(event: any): Promise<void> {
    const price = event.data.object;
    
    if (event.type === 'price.deleted') {
      // Handle price deletion (deactivate)
      await this.stripePriceService.deactivatePrice(price.id);
    } else {
      // Handle price creation or update
      await this.stripePriceService.syncPricesFromStripe(price.product);
    }
  }

  private async handleSubscriptionEvent(event: any): Promise<void> {
    const subscription = event.data.object;
    
    // Sync subscription data
    await this.stripeSubscriptionService.syncSubscriptionFromStripe(subscription.id);
    
    // Handle specific subscription events
    if (event.type === 'customer.subscription.trial_will_end') {
      // Notify customer about trial ending
      console.log(`Trial will end soon for subscription: ${subscription.id}`);
      // Implement notification logic here
    }
  }

  private async handlePaymentIntentEvent(event: any): Promise<void> {
    const paymentIntent = event.data.object;
    
    // Sync payment intent data
    await this.stripePaymentService.syncPaymentFromStripe(paymentIntent.id);
  }

  private async handleChargeEvent(event: any): Promise<void> {
    const charge = event.data.object;
    
    // Get payment intent ID from charge
    const paymentIntentId = charge.payment_intent;
    
    if (paymentIntentId) {
      // Sync payment intent and associated charges
      await this.stripePaymentService.syncPaymentFromStripe(paymentIntentId);
    }
  }

  private async handleInvoiceEvent(event: any): Promise<void> {
    const invoice = event.data.object;
    
    // If invoice has a subscription, sync it
    if (invoice.subscription) {
      await this.stripeSubscriptionService.syncSubscriptionFromStripe(invoice.subscription);
    }
    
    // If invoice has a payment intent, sync it
    if (invoice.payment_intent) {
      await this.stripePaymentService.syncPaymentFromStripe(invoice.payment_intent);
    }
  }
}
