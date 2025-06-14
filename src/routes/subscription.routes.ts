import { Router } from 'express';
import { validateApiKey, verifyToken } from '../middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * /api/subscriptions:
 *   get:
 *     summary: Get subscription plans
 *     tags: [Subscriptions]
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Subscription plans retrieved successfully
 */
router.get('/', validateApiKey, (req, res) => {
  res.json({
    success: true,
    message: 'Subscription plans endpoint',
    data: [
      { id: '1', name: 'Basic', price: 29.99, duration: 'monthly' },
      { id: '2', name: 'Premium', price: 49.99, duration: 'monthly' },
      { id: '3', name: 'VIP', price: 99.99, duration: 'monthly' }
    ]
  });
});

/**
 * @swagger
 * /api/subscriptions/current:
 *   get:
 *     summary: Get current user subscription
 *     tags: [Subscriptions]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Current subscription retrieved successfully
 */
router.get('/current', validateApiKey, verifyToken, (req, res) => {
  res.json({
    success: true,
    message: 'Current subscription endpoint',
    data: req.user?.subscription || null
  });
});

export default router; 