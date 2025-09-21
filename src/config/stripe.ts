import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripeConfig = {
  secretKey: process.env.STRIPE_SECRET_KEY || '',
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  apiVersion: '2023-10-16' // Use the latest stable version
};

const stripe = new Stripe(stripeConfig.secretKey, {
  apiVersion: stripeConfig.apiVersion as any
});

export default stripe;
export { stripeConfig };
