import { Router } from 'express';
import { createPersonalProfile, createProfileAddress, createProfileEducation, createProfileEmployment } from '../controllers/profile.controller';
import { validateApiKey } from '../middlewares/apiKey.middleware';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * /profile/personal:
 *   post:
 *     summary: Create personal profile
 *     tags: [Profile]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProfilePersonal'
 *     responses:
 *       201:
 *         description: Personal profile created successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post(
  '/personal',
  validateApiKey,
  authenticateJWT,
  createPersonalProfile
);

/**
 * @swagger
 * /profile/address:
 *   post:
 *     summary: Create profile address
 *     tags: [Profile]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProfileAddress'
 *     responses:
 *       201:
 *         description: Profile address created successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post(
  '/address',
  validateApiKey,
  authenticateJWT,
  createProfileAddress
);

/**
 * @swagger
 * /profile/education:
 *   post:
 *     summary: Create profile education
 *     tags: [Profile]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProfileEducation'
 *     responses:
 *       201:
 *         description: Profile education created successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post(
  '/education',
  validateApiKey,
  authenticateJWT,
  createProfileEducation
);

/**
 * @swagger
 * /profile/employment:
 *   post:
 *     summary: Create profile employment
 *     tags: [Profile]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProfileEmployment'
 *     responses:
 *       201:
 *         description: Profile employment created successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post(
  '/employment',
  validateApiKey,
  authenticateJWT,
  createProfileEmployment
);

export default router; 