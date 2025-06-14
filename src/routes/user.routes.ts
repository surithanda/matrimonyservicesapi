import { Router } from 'express';
import { validateApiKey, verifyToken } from '../middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Users]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/profile', validateApiKey, verifyToken, (req, res) => {
  res.json({
    success: true,
    message: 'User profile endpoint',
    data: req.user
  });
});

/**
 * @swagger
 * /api/users/search:
 *   get:
 *     summary: Search users
 *     tags: [Users]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: age_min
 *         schema:
 *           type: integer
 *         description: Minimum age
 *       - in: query
 *         name: age_max
 *         schema:
 *           type: integer
 *         description: Maximum age
 *     responses:
 *       200:
 *         description: Search results
 */
router.get('/search', validateApiKey, verifyToken, (req, res) => {
  res.json({
    success: true,
    message: 'User search endpoint',
    data: []
  });
});

export default router; 