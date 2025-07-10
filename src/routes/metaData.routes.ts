import { Router } from 'express';
import { validateApiKey } from '../middlewares/apiKey.middleware';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { fetchCategory, fetchCountries, fetchStates } from '../controllers/metaData.controller';

const router = Router();

/**
 * @swagger
 * /metaData/category:
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
router.post('/category', validateApiKey, fetchCategory);

router.get('/countries', validateApiKey, fetchCountries);
router.post('/states', validateApiKey, fetchStates);


export default router;