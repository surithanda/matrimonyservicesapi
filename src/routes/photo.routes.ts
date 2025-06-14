import { Router } from 'express';
import { validateApiKey, verifyToken } from '../middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * /api/photos:
 *   get:
 *     summary: Get user photos
 *     tags: [Photos]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Photos retrieved successfully
 */
router.get('/', validateApiKey, verifyToken, (req, res) => {
  res.json({
    success: true,
    message: 'User photos endpoint',
    data: []
  });
});

/**
 * @swagger
 * /api/photos/{id}:
 *   delete:
 *     summary: Delete a photo
 *     tags: [Photos]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Photo ID
 *     responses:
 *       200:
 *         description: Photo deleted successfully
 */
router.delete('/:id', validateApiKey, verifyToken, (req, res) => {
  res.json({
    success: true,
    message: 'Photo deleted successfully',
    data: { id: req.params.id }
  });
});

export default router; 