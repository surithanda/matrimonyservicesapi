import { Router } from "express";
import { validateApiKey } from "../middlewares/apiKey.middleware";
import { authenticateJWT } from "../middlewares/auth.middleware";
import {
  createCheckoutSession,
  verifySession,
  handleWebhookEvent,
  getPaymentHistory,
} from "../controllers/stripe.controller";

const router = Router();

// Create a Stripe Checkout session
router.post(
  "/create-session",
  validateApiKey,
  authenticateJWT,
  createCheckoutSession
);

// Verify a Checkout session after Stripe redirect (safety check — webhook is authoritative)
// GET /api/stripe/verify-session?session_id=cs_xxx
router.get(
  "/verify-session",
  validateApiKey,
  authenticateJWT,
  verifySession
);

// Get payment history for the authenticated account
// GET /api/stripe/payment-history
router.get(
  "/payment-history",
  validateApiKey,
  authenticateJWT,
  getPaymentHistory
);

export default router;
