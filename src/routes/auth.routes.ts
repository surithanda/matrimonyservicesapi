import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validateApiKey } from '../middlewares/apiKey.middleware';

const router = Router();
const authController = new AuthController();

router.post('/login', validateApiKey, authController.login);
router.post('/verify-otp', validateApiKey, authController.verifyOTP);

/**
 * @swagger
 * /auth/verify-otp:
 *   post:
 *     summary: Verify OTP after login
 *     tags: [Auth]
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - account_code
 *               - otp
 *             properties:
 *               account_code:
 *                 type: string
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Invalid or expired OTP
 *       500:
 *         description: Server error
 */

export default router; 