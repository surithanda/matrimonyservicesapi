import { Router } from 'express';
import { createPersonalProfile, createProfileAddress } from '../controllers/profile.controller';
import { validateApiKey } from '../middlewares/apiKey.middleware';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();

router.post(
  '/personal',
  validateApiKey,
  authenticateJWT,
  createPersonalProfile
);

router.post(
  '/address',
  validateApiKey,
  authenticateJWT,
  createProfileAddress
);

export default router; 