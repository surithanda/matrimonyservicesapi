import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validateApiKey } from '../middlewares/apiKey.middleware';

const router = Router();
const authController = new AuthController();

router.post('/login', validateApiKey, authController.login);

export default router; 