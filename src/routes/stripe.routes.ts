import express from 'express';
import { StripeWebhookController } from '../controllers/stripe/webhook.controller';
import { StripeCustomerController } from '../controllers/stripe/customer.controller';
import { StripeProductController } from '../controllers/stripe/product.controller';
import { StripeSubscriptionController } from '../controllers/stripe/subscription.controller';
import { StripePaymentController } from '../controllers/stripe/payment.controller';

const router = express.Router();
const stripeWebhookController = new StripeWebhookController();
const stripeCustomerController = new StripeCustomerController();
const stripeProductController = new StripeProductController();
const stripeSubscriptionController = new StripeSubscriptionController();
const stripePaymentController = new StripePaymentController();

// Webhook endpoint - raw body is needed for signature verification
// The parseRawBody middleware handles both raw and JSON payloads
router.post('/webhook', 
  express.raw({ type: 'application/json' }), 
  (req, res, next) => stripeWebhookController.parseRawBody(req, res, next),
  (req, res) => stripeWebhookController.handleWebhook(req, res)
);

// Customer routes
router.post('/customers', (req, res) => stripeCustomerController.createCustomer(req, res));
router.get('/customers/:customerId', (req, res) => stripeCustomerController.getCustomer(req, res));
router.put('/customers/:customerId', (req, res) => stripeCustomerController.updateCustomer(req, res));
router.delete('/customers/:customerId', (req, res) => stripeCustomerController.deleteCustomer(req, res));

// Product routes
router.post('/products', (req, res) => stripeProductController.createProduct(req, res));
router.get('/products', (req, res) => stripeProductController.listProducts(req, res));
router.get('/products/:productId', (req, res) => stripeProductController.getProduct(req, res));
router.put('/products/:productId', (req, res) => stripeProductController.updateProduct(req, res));
router.delete('/products/:productId', (req, res) => stripeProductController.deleteProduct(req, res));
router.post('/products/sync', (req, res) => stripeProductController.syncProductsFromStripe(req, res));

// Subscription routes
router.post('/subscriptions', (req, res) => stripeSubscriptionController.createSubscription(req, res));
router.get('/subscriptions/:subscriptionId', (req, res) => stripeSubscriptionController.getSubscription(req, res));
router.get('/customers/:customerId/subscriptions', (req, res) => stripeSubscriptionController.listSubscriptionsByCustomer(req, res));
router.put('/subscriptions/:subscriptionId', (req, res) => stripeSubscriptionController.updateSubscription(req, res));
router.post('/subscriptions/:subscriptionId/cancel', (req, res) => stripeSubscriptionController.cancelSubscription(req, res));

// Payment routes
router.post('/payment-intents', (req, res) => stripePaymentController.createPaymentIntent(req, res));
router.get('/payment-intents/:paymentIntentId', (req, res) => stripePaymentController.getPaymentIntent(req, res));
router.post('/payment-intents/:paymentIntentId/confirm', (req, res) => stripePaymentController.confirmPaymentIntent(req, res));
router.post('/payment-intents/:paymentIntentId/cancel', (req, res) => stripePaymentController.cancelPaymentIntent(req, res));
router.post('/payment-intents/:paymentIntentId/capture', (req, res) => stripePaymentController.capturePaymentIntent(req, res));
router.get('/charges/:chargeId', (req, res) => stripePaymentController.getCharge(req, res));
router.get('/customers/:customerId/charges', (req, res) => stripePaymentController.listChargesByCustomer(req, res));

export default router;
