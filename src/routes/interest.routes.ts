import { Router } from 'express';
import { validateApiKey, verifyToken } from '../middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * /api/interests:
 *   get:
 *     summary: Get user interests
 *     tags: [Interests]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Interests retrieved successfully
 */
router.get('/', validateApiKey, verifyToken, (req, res) => {
  res.json({
    success: true,
    message: 'User interests endpoint',
    data: []
  });
});

/**
 * @swagger
 * /api/interests:
 *   post:
 *     summary: Send interest to user
 *     tags: [Interests]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               targetUserId:
 *                 type: string
 *               message:
 *                 type: string
 *     responses:
 *       200:
 *         description: Interest sent successfully
 */
router.post('/', validateApiKey, verifyToken, (req, res) => {
  res.json({
    success: true,
    message: 'Interest sent successfully',
    data: req.body
  });
});

export default router; 