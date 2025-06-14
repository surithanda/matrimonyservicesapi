import { Router } from 'express';
import { validateApiKey, verifyToken, requireRole } from '../middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Admin]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/users', validateApiKey, verifyToken, requireRole('ADMIN'), (req, res) => {
  res.json({
    success: true,
    message: 'Admin users endpoint',
    data: []
  });
});

/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     summary: Get platform statistics (Admin only)
 *     tags: [Admin]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 */
router.get('/stats', validateApiKey, verifyToken, requireRole('ADMIN'), (req, res) => {
  res.json({
    success: true,
    message: 'Admin statistics endpoint',
    data: {
      totalUsers: 1000,
      activeSubscriptions: 250,
      totalMatches: 150
    }
  });
});

export default router; 