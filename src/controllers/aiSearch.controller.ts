import { Request, Response } from 'express';
import { AISearchService } from '../services/aiSearch/aiSearch.service';
import { QuotaChecker } from '../services/aiSearch/quotaChecker';
import logger from '../config/logger';

interface AuthenticatedRequest extends Request {
  user?: {
    email: string;
    account_code: string;
    account_id: number;
    partner_id?: number;
    iat?: number;
    exp?: number;
  };
}

// Singleton instances — initialized once, reused across requests
let aiSearchService: AISearchService | null = null;
const quotaChecker = new QuotaChecker();

function getService(): AISearchService {
  if (!aiSearchService) {
    aiSearchService = new AISearchService();
  }
  return aiSearchService;
}

export const aiSearch = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { query, profile_id } = req.body;

    // Validate required fields
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required and must be a non-empty string',
      });
    }

    if (!profile_id || typeof profile_id !== 'number') {
      return res.status(400).json({
        success: false,
        message: 'profile_id is required and must be a number',
      });
    }

    // Enforce max query length
    if (query.trim().length > 500) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be under 500 characters',
      });
    }

    const accountId = req.user?.account_id;
    if (!accountId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    // Check monthly quota before calling AI
    const quota = await quotaChecker.check(accountId);

    if (!quota.allowed) {
      return res.status(429).json({
        success: false,
        message: `Monthly AI search limit reached. You have used all ${quota.monthly_limit} searches for this month. Please use standard filters to search, or upgrade your plan for more AI searches.`,
        data: {
          quota: {
            plan_name: quota.plan_name,
            monthly_limit: quota.monthly_limit,
            used_this_month: quota.used_this_month,
            remaining: quota.remaining,
            resets_at: quota.resets_at,
          },
          upgrade_url: '/plans',
        },
      });
    }

    const service = getService();
    const result = await service.search(query.trim(), profile_id, accountId);

    // Append quota info to response (increment used count since this search just happened)
    const updatedQuota = {
      plan_name: quota.plan_name,
      monthly_limit: quota.monthly_limit,
      used_this_month: quota.used_this_month + 1,
      remaining: quota.monthly_limit === -1 ? -1 : Math.max(0, quota.remaining - 1),
      resets_at: quota.resets_at,
    };

    if (result.data) {
      result.data.quota = { allowed: true, ...updatedQuota };
    }

    if (!result.success) {
      return res.status(422).json(result);
    }

    return res.status(200).json(result);
  } catch (error: any) {
    logger.error('[AISearch Controller] Search failed', {
      error: error.message,
      stack: error.stack,
    });

    // Differentiate timeout from other errors
    if (error.message?.includes('timed out')) {
      return res.status(504).json({
        success: false,
        message: 'AI service timed out. Please try again.',
      });
    }

    if (error.message?.includes('invalid JSON')) {
      return res.status(502).json({
        success: false,
        message: 'AI service returned an invalid response. Please try again.',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'AI search failed. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

export const aiSearchHistory = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const accountId = req.user?.account_id;
    if (!accountId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);

    const [rows] = await (await import('../config/database')).default.execute(
      `SELECT search_id, user_query, interpreted_query, result_count,
              confidence, ai_provider, ai_model, tokens_used,
              response_time_ms, error_message, created_at
       FROM ai_search_log
       WHERE account_id = ?
       ORDER BY created_at DESC
       LIMIT ?`,
      [accountId, limit]
    );

    return res.status(200).json({
      success: true,
      message: 'Search history retrieved',
      data: rows,
    });
  } catch (error: any) {
    logger.error('[AISearch Controller] History fetch failed', {
      error: error.message,
    });
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch search history',
    });
  }
};

export const aiSearchRefreshCache = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const service = getService();
    const result = await service.refreshCache();
    return res.status(200).json(result);
  } catch (error: any) {
    logger.error('[AISearch Controller] Cache refresh failed', {
      error: error.message,
    });
    return res.status(500).json({
      success: false,
      message: 'Failed to refresh cache',
    });
  }
};

export const aiSearchProviderInfo = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const service = getService();
    const info = service.getProviderInfo();
    return res.status(200).json({
      success: true,
      data: info,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to get provider info',
    });
  }
};
