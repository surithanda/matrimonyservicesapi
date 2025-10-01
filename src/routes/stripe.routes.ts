import { Router } from "express";
import { validateApiKey } from "../middlewares/apiKey.middleware";
import { authenticateJWT } from "../middlewares/auth.middleware";
import {
  createCheckoutSession,
  handleWebhookEvent,
} from "../controllers/stripe.controller";

const router = Router();
router.post(
  "/create-session",
  validateApiKey,
  authenticateJWT,
  createCheckoutSession
);
router.post("/webhook", handleWebhookEvent);
export default router;
