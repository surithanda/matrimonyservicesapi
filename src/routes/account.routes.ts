import { Router } from 'express';
import { registerAccount } from '../controllers/account.controller';
import { validateApiKey } from '../middlewares/apiKey.middleware';

const router = Router();

router.post('/register', validateApiKey, registerAccount);

export default router; 