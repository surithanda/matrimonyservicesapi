import { Router } from 'express';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { validateApiKey } from '../middlewares/apiKey.middleware';
import { aiSearch, aiSearchHistory, aiSearchRefreshCache, aiSearchProviderInfo } from '../controllers/aiSearch.controller';
import rateLimit from 'express-rate-limit';

const router = Router();

// Rate limiter: 10 AI searches per minute per IP
const aiSearchRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many AI search requests. Please wait a minute before trying again.',
  },
});

/**
 * @swagger
 * /ai-search:
 *   post:
 *     summary: AI-powered natural language profile search
 *     description: >
 *       Takes a natural language query, uses AI to extract structured search filters,
 *       resolves them against the database, and returns matching profiles.
 *       This is a premium feature.
 *     tags: [AI Search]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - query
 *               - profile_id
 *             properties:
 *               query:
 *                 type: string
 *                 maxLength: 500
 *                 description: Natural language search query
 *                 example: "Find Hindu women between 25-30, MBA, from Hyderabad, vegetarian"
 *               profile_id:
 *                 type: integer
 *                 description: Current user's profile ID (to exclude self from results)
 *                 example: 42
 *     responses:
 *       200:
 *         description: Profiles retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     profiles:
 *                       type: array
 *                       items:
 *                         type: object
 *                     interpretation:
 *                       type: string
 *                       description: AI's human-readable interpretation of the query
 *                     filters_applied:
 *                       type: object
 *                       description: Structured filters extracted by AI
 *                     resolved_ids:
 *                       type: object
 *                       description: Numeric IDs resolved from text filters
 *                     confidence:
 *                       type: number
 *                       description: AI confidence score (0-1)
 *                     result_count:
 *                       type: integer
 *                     ai_provider:
 *                       type: string
 *                     ai_model:
 *                       type: string
 *                     tokens_used:
 *                       type: integer
 *                     response_time_ms:
 *                       type: integer
 *                     quota:
 *                       type: object
 *                       description: Monthly quota usage for the current user
 *                       properties:
 *                         allowed:
 *                           type: boolean
 *                         plan_name:
 *                           type: string
 *                           example: "Bronze Plan"
 *                         monthly_limit:
 *                           type: integer
 *                           description: "-1 = unlimited"
 *                           example: 50
 *                         used_this_month:
 *                           type: integer
 *                           example: 12
 *                         remaining:
 *                           type: integer
 *                           description: "-1 = unlimited"
 *                           example: 38
 *                         resets_at:
 *                           type: string
 *                           format: date-time
 *                           example: "2026-04-01T00:00:00.000Z"
 *       400:
 *         description: Invalid request (missing query or profile_id)
 *       401:
 *         description: Unauthorized
 *       422:
 *         description: AI could not interpret the query (quota info still included)
 *       429:
 *         description: Monthly quota exceeded or rate limit hit. Returns quota details and upgrade_url.
 *       500:
 *         description: Server error
 *       502:
 *         description: AI provider returned invalid response
 *       504:
 *         description: AI provider timed out
 */
router.post(
  '/',
  validateApiKey,
  authenticateJWT,
  aiSearchRateLimiter,
  aiSearch
);

/**
 * @swagger
 * /ai-search/history:
 *   get:
 *     summary: Get AI search history for the current user
 *     tags: [AI Search]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           maximum: 50
 *         description: Number of history entries to return
 *     responses:
 *       200:
 *         description: Search history retrieved
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get(
  '/history',
  validateApiKey,
  authenticateJWT,
  aiSearchHistory
);

/**
 * @swagger
 * /ai-search/refresh-cache:
 *   post:
 *     summary: Refresh the AI search schema context cache
 *     description: Reloads all lookup values from the database into memory. Admin use only.
 *     tags: [AI Search]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Cache refreshed successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post(
  '/refresh-cache',
  validateApiKey,
  authenticateJWT,
  aiSearchRefreshCache
);

/**
 * @swagger
 * /ai-search/provider-info:
 *   get:
 *     summary: Get current AI provider information
 *     tags: [AI Search]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Provider info retrieved
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/provider-info',
  validateApiKey,
  authenticateJWT,
  aiSearchProviderInfo
);

export default router;
