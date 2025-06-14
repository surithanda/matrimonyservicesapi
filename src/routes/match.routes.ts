import { Router } from 'express';
import { validateApiKey, verifyToken } from '../middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * /api/matches:
 *   get:
 *     summary: Get user matches
 *     tags: [Matches]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Matches retrieved successfully
 */
router.get('/', validateApiKey, verifyToken, (req, res) => {
  res.json({
    success: true,
    message: 'User matches endpoint',
    data: []
  });
});

/**
 * @swagger
 * /api/matches/compatible:
 *   get:
 *     summary: Get compatible matches
 *     tags: [Matches]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Compatible matches retrieved successfully
 */
router.get('/compatible', validateApiKey, verifyToken, (req, res) => {
  res.json({
    success: true,
    message: 'Compatible matches endpoint',
    data: []
  });
});

export default router; 