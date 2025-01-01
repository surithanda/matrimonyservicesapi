import { Router } from 'express';
import { registerAccount } from '../controllers/account.controller';

const router = Router();

router.post('/register', async (req, res, next) => {
  try {
    await registerAccount(req, res);
    next();
  } catch (error) {
    next(error);
  }
});

export default router; 