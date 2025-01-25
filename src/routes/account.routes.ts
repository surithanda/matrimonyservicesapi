import { Router } from 'express';
import { registerAccount, updateAccount, uploadPhoto, getProfilePhoto } from '../controllers/account.controller';
import { validateApiKey } from '../middlewares/apiKey.middleware';
import { authenticateJWT } from '../middlewares/auth.middleware';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import express from 'express';
import fs from 'fs';

const router = Router();

const ensureDirectoryExists = (dirPath: string) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Configure multer for photo uploads
const storage = multer.diskStorage({
  destination: (req: express.Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    const accountCode = (req as AuthenticatedRequest).user?.account_code;
    const uploadPath = path.join(__dirname, `../../uploads/photos/${accountCode}`);
    
    try {
      ensureDirectoryExists(uploadPath);
      cb(null, uploadPath);
    } catch (error) {
      cb(error as Error, '');
    }
  },
  filename: (req: express.Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const uniqueFilename = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueFilename);
  }
});

const fileFilter = (req: express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(null, false);
    return cb(new Error('Only image files are allowed!'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});

// Serve uploaded photos
router.use('/photos', express.static(path.join(__dirname, '../../uploads/photos')));

/**
 * @swagger
 * /account/register:
 *   post:
 *     summary: Register a new account
 *     tags: [Account]
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - primary_phone
 *               - primary_phone_country
 *               - primary_phone_type
 *               - first_name
 *               - last_name
 *               - birth_date
 *               - gender
 *               - address_line1
 *               - city
 *               - state
 *               - zip
 *               - country
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *               primary_phone:
 *                 type: string
 *               primary_phone_country:
 *                 type: string
 *               primary_phone_type:
 *                 type: string
 *                 enum: [MOBILE, HOME, WORK]
 *               secondary_phone:
 *                 type: string
 *               secondary_phone_country:
 *                 type: string
 *               secondary_phone_type:
 *                 type: string
 *                 enum: [MOBILE, HOME, WORK]
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               middle_name:
 *                 type: string
 *               birth_date:
 *                 type: string
 *                 format: date
 *               gender:
 *                 type: string
 *                 enum: [M, F, O]
 *               address_line1:
 *                 type: string
 *               address_line2:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               zip:
 *                 type: string
 *               country:
 *                 type: string
 *               photo:
 *                 type: string
 *               secret_question:
 *                 type: string
 *               secret_answer:
 *                 type: string
 *               driving_license:
 *                 type: string
 *     responses:
 *       201:
 *         description: Account created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     account_code:
 *                       type: string
 *       409:
 *         description: Account already exists
 *       500:
 *         description: Server error
 */
router.post('/register', validateApiKey, registerAccount);

/**
 * @swagger
 * /account/update:
 *   put:
 *     summary: Update account details
 *     tags: [Account]
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
 *               primary_phone:
 *                 type: string
 *               primary_phone_country:
 *                 type: string
 *               primary_phone_type:
 *                 type: string
 *                 enum: [MOBILE, HOME, WORK]
 *               secondary_phone:
 *                 type: string
 *               secondary_phone_country:
 *                 type: string
 *               secondary_phone_type:
 *                 type: string
 *                 enum: [MOBILE, HOME, WORK]
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               middle_name:
 *                 type: string
 *               birth_date:
 *                 type: string
 *                 format: date
 *               gender:
 *                 type: string
 *                 enum: [M, F, O]
 *               address_line1:
 *                 type: string
 *               address_line2:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               zip:
 *                 type: string
 *               country:
 *                 type: string
 *               photo:
 *                 type: string
 *               secret_question:
 *                 type: string
 *               secret_answer:
 *                 type: string
 *               driving_license:
 *                 type: string
 *     responses:
 *       200:
 *         description: Account updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.put('/update', validateApiKey, authenticateJWT, updateAccount);

/**
 * @swagger
 * /account/photo:
 *   post:
 *     summary: Upload or update account photo
 *     tags: [Account]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - photo
 *             properties:
 *               photo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Photo uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     photo_url:
 *                       type: string
 *       400:
 *         description: Invalid file type or size
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/photo', validateApiKey, authenticateJWT, upload.single('photo'), uploadPhoto);

/**
 * @swagger
 * /account/photo:
 *   get:
 *     summary: Get account photo
 *     tags: [Account]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Photo retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/photo', validateApiKey, authenticateJWT, getProfilePhoto);

export default router;