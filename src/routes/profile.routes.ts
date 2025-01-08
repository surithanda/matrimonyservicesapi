import { Router } from 'express';
import { createPersonalProfile } from '../controllers/profile.controller';
import { validateApiKey } from '../middlewares/apiKey.middleware';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();

router.post(
  '/personal',
  validateApiKey,
  authenticateJWT,
  createPersonalProfile
);

export default router; 