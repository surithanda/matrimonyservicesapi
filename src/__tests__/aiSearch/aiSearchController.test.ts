import { Request, Response } from 'express';
import { aiSearch } from '../../controllers/aiSearch.controller';

// Mock the QuotaChecker
const mockQuotaCheck = jest.fn();
jest.mock('../../services/aiSearch/quotaChecker', () => {
  return {
    QuotaChecker: jest.fn().mockImplementation(() => ({
      check: (...args: any[]) => mockQuotaCheck(...args),
    })),
  };
});

// Mock the AISearchService
jest.mock('../../services/aiSearch/aiSearch.service', () => {
  const mockSearch = jest.fn();
  const mockRefreshCache = jest.fn();
  const mockGetProviderInfo = jest.fn();
  const mockInitialize = jest.fn();

  return {
    AISearchService: jest.fn().mockImplementation(() => ({
      search: mockSearch,
      refreshCache: mockRefreshCache,
      getProviderInfo: mockGetProviderInfo,
      initialize: mockInitialize,
    })),
    __mockSearch: mockSearch,
    __mockRefreshCache: mockRefreshCache,
    __mockGetProviderInfo: mockGetProviderInfo,
  };
});

// Mock logger (default export)
jest.mock('../../config/logger', () => {
  return {
    __esModule: true,
    default: {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
    },
  };
});

// Default quota response (allowed)
const allowedQuota = {
  allowed: true,
  plan_name: 'Bronze Plan',
  monthly_limit: 50,
  used_this_month: 10,
  remaining: 40,
  resets_at: '2026-04-01T00:00:00.000Z',
};

// Helper to create mock req/res
function createMockReq(body: any = {}, user: any = null): Partial<Request> {
  return {
    body,
    user: user || { account_id: 1, email: 'test@test.com', account_code: 'ACC001' },
  } as any;
}

function createMockRes(): Partial<Response> & { _status: number; _json: any } {
  const res: any = {
    _status: 0,
    _json: null,
    status(code: number) {
      res._status = code;
      return res;
    },
    json(data: any) {
      res._json = data;
      return res;
    },
  };
  return res;
}

describe('AISearch Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default: quota is allowed
    mockQuotaCheck.mockResolvedValue({ ...allowedQuota });
  });

  describe('POST /ai-search', () => {
    it('should return 400 when query is missing', async () => {
      const req = createMockReq({ profile_id: 1 });
      const res = createMockRes();

      await aiSearch(req as any, res as any);

      expect(res._status).toBe(400);
      expect(res._json.success).toBe(false);
      expect(res._json.message).toContain('query is required');
    });

    it('should return 400 when query is empty string', async () => {
      const req = createMockReq({ query: '', profile_id: 1 });
      const res = createMockRes();

      await aiSearch(req as any, res as any);

      expect(res._status).toBe(400);
      expect(res._json.success).toBe(false);
    });

    it('should return 400 when query is not a string', async () => {
      const req = createMockReq({ query: 123, profile_id: 1 });
      const res = createMockRes();

      await aiSearch(req as any, res as any);

      expect(res._status).toBe(400);
    });

    it('should return 400 when profile_id is missing', async () => {
      const req = createMockReq({ query: 'Find me a match' });
      const res = createMockRes();

      await aiSearch(req as any, res as any);

      expect(res._status).toBe(400);
      expect(res._json.message).toContain('profile_id is required');
    });

    it('should return 400 when profile_id is not a number', async () => {
      const req = createMockReq({ query: 'Find me a match', profile_id: 'abc' });
      const res = createMockRes();

      await aiSearch(req as any, res as any);

      expect(res._status).toBe(400);
    });

    it('should return 400 when query exceeds 500 chars', async () => {
      const req = createMockReq({
        query: 'A'.repeat(501),
        profile_id: 1,
      });
      const res = createMockRes();

      await aiSearch(req as any, res as any);

      expect(res._status).toBe(400);
      expect(res._json.message).toContain('500 characters');
    });

    it('should return 401 when user is not authenticated', async () => {
      const req = createMockReq(
        { query: 'Find Hindu women', profile_id: 1 },
        {} // no account_id
      );
      const res = createMockRes();

      await aiSearch(req as any, res as any);

      expect(res._status).toBe(401);
    });

    it('should return 200 on successful search', async () => {
      const { __mockSearch } = require('../../services/aiSearch/aiSearch.service');
      __mockSearch.mockResolvedValue({
        success: true,
        message: 'Profiles fetched successfully',
        data: {
          profiles: [{ profile_id: 10, first_name: 'Priya' }],
          interpretation: 'Hindu women, 25-30, Hyderabad',
          filters_applied: { gender: 'Female', religion: 'Hindu' },
          resolved_ids: { gender: 10, religion: 131 },
          confidence: 0.95,
          result_count: 1,
          ai_provider: 'openai',
          ai_model: 'gpt-4o-mini',
          tokens_used: 150,
          response_time_ms: 800,
        },
      });

      const req = createMockReq({
        query: 'Find Hindu women aged 25-30 in Hyderabad',
        profile_id: 1,
      });
      const res = createMockRes();

      await aiSearch(req as any, res as any);

      expect(res._status).toBe(200);
      expect(res._json.success).toBe(true);
      expect(res._json.data.profiles).toHaveLength(1);
      expect(res._json.data.confidence).toBe(0.95);
    });

    it('should return 422 when AI cannot interpret query', async () => {
      const { __mockSearch } = require('../../services/aiSearch/aiSearch.service');
      __mockSearch.mockResolvedValue({
        success: false,
        message: 'Could not understand the search query.',
        data: {
          profiles: [],
          interpretation: 'Query not related to profile search',
          filters_applied: {},
          resolved_ids: {},
          confidence: 0.1,
          result_count: 0,
          ai_provider: 'openai',
          ai_model: 'gpt-4o-mini',
          tokens_used: 50,
          response_time_ms: 400,
        },
      });

      const req = createMockReq({
        query: 'What is the weather today?',
        profile_id: 1,
      });
      const res = createMockRes();

      await aiSearch(req as any, res as any);

      expect(res._status).toBe(422);
      expect(res._json.success).toBe(false);
    });

    it('should return 504 when AI provider times out', async () => {
      const { __mockSearch } = require('../../services/aiSearch/aiSearch.service');
      __mockSearch.mockRejectedValue(new Error('AI provider timed out. Please try again.'));

      const req = createMockReq({
        query: 'Find Hindu women',
        profile_id: 1,
      });
      const res = createMockRes();

      await aiSearch(req as any, res as any);

      expect(res._status).toBe(504);
      expect(res._json.message).toContain('timed out');
    });

    it('should return 502 when AI returns invalid JSON', async () => {
      const { __mockSearch } = require('../../services/aiSearch/aiSearch.service');
      __mockSearch.mockRejectedValue(new Error('AI returned invalid JSON response'));

      const req = createMockReq({
        query: 'Find Hindu women',
        profile_id: 1,
      });
      const res = createMockRes();

      await aiSearch(req as any, res as any);

      expect(res._status).toBe(502);
      expect(res._json.message).toContain('invalid response');
    });

    it('should return 500 on unexpected error', async () => {
      const { __mockSearch } = require('../../services/aiSearch/aiSearch.service');
      __mockSearch.mockRejectedValue(new Error('Unexpected DB error'));

      const req = createMockReq({
        query: 'Find Hindu women',
        profile_id: 1,
      });
      const res = createMockRes();

      await aiSearch(req as any, res as any);

      expect(res._status).toBe(500);
    });

    it('should trim whitespace from query', async () => {
      const { __mockSearch } = require('../../services/aiSearch/aiSearch.service');
      __mockSearch.mockResolvedValue({
        success: true,
        message: 'ok',
        data: { profiles: [], interpretation: '', filters_applied: {}, resolved_ids: {}, confidence: 0.5, result_count: 0, ai_provider: 'openai', ai_model: 'gpt-4o-mini', tokens_used: 10, response_time_ms: 100 },
      });

      const req = createMockReq({
        query: '  Find Hindu women  ',
        profile_id: 1,
      });
      const res = createMockRes();

      await aiSearch(req as any, res as any);

      expect(__mockSearch).toHaveBeenCalledWith('Find Hindu women', 1, 1);
    });
  });

  describe('Quota Enforcement', () => {
    it('should return 429 when monthly quota is exceeded', async () => {
      mockQuotaCheck.mockResolvedValue({
        allowed: false,
        plan_name: 'Free Plan',
        monthly_limit: 5,
        used_this_month: 5,
        remaining: 0,
        resets_at: '2026-04-01T00:00:00.000Z',
      });

      const req = createMockReq({
        query: 'Find Hindu women',
        profile_id: 1,
      });
      const res = createMockRes();

      await aiSearch(req as any, res as any);

      expect(res._status).toBe(429);
      expect(res._json.success).toBe(false);
      expect(res._json.message).toContain('Monthly AI search limit reached');
      expect(res._json.message).toContain('standard filters');
      expect(res._json.data.quota.plan_name).toBe('Free Plan');
      expect(res._json.data.quota.remaining).toBe(0);
      expect(res._json.data.upgrade_url).toBe('/plans');
    });

    it('should include quota in successful 200 response', async () => {
      const { __mockSearch } = require('../../services/aiSearch/aiSearch.service');
      __mockSearch.mockResolvedValue({
        success: true,
        message: 'Profiles fetched successfully',
        data: {
          profiles: [{ profile_id: 10 }],
          interpretation: 'test',
          filters_applied: { gender: 'Female' },
          resolved_ids: { gender: 10 },
          confidence: 0.9,
          result_count: 1,
          ai_provider: 'openai',
          ai_model: 'gpt-4o-mini',
          tokens_used: 150,
          response_time_ms: 800,
        },
      });

      const req = createMockReq({
        query: 'Find Hindu women',
        profile_id: 1,
      });
      const res = createMockRes();

      await aiSearch(req as any, res as any);

      expect(res._status).toBe(200);
      expect(res._json.data.quota).toBeDefined();
      expect(res._json.data.quota.plan_name).toBe('Bronze Plan');
      expect(res._json.data.quota.used_this_month).toBe(11); // 10 + 1
      expect(res._json.data.quota.remaining).toBe(39); // 40 - 1
    });

    it('should include quota in 422 response (low confidence)', async () => {
      const { __mockSearch } = require('../../services/aiSearch/aiSearch.service');
      __mockSearch.mockResolvedValue({
        success: false,
        message: 'Could not understand the search query.',
        data: {
          profiles: [],
          interpretation: 'Unclear query',
          filters_applied: {},
          resolved_ids: {},
          confidence: 0.1,
          result_count: 0,
          ai_provider: 'openai',
          ai_model: 'gpt-4o-mini',
          tokens_used: 50,
          response_time_ms: 400,
        },
      });

      const req = createMockReq({
        query: 'What is weather?',
        profile_id: 1,
      });
      const res = createMockRes();

      await aiSearch(req as any, res as any);

      expect(res._status).toBe(422);
      expect(res._json.data.quota).toBeDefined();
      expect(res._json.data.quota.plan_name).toBe('Bronze Plan');
    });

    it('should show remaining=-1 for unlimited plans', async () => {
      mockQuotaCheck.mockResolvedValue({
        allowed: true,
        plan_name: 'Gold Plan',
        monthly_limit: -1,
        used_this_month: 500,
        remaining: -1,
        resets_at: '2026-04-01T00:00:00.000Z',
      });

      const { __mockSearch } = require('../../services/aiSearch/aiSearch.service');
      __mockSearch.mockResolvedValue({
        success: true,
        message: 'ok',
        data: { profiles: [], interpretation: '', filters_applied: {}, resolved_ids: {}, confidence: 0.5, result_count: 0, ai_provider: 'openai', ai_model: 'gpt-4o-mini', tokens_used: 10, response_time_ms: 100 },
      });

      const req = createMockReq({
        query: 'Find Hindu women',
        profile_id: 1,
      });
      const res = createMockRes();

      await aiSearch(req as any, res as any);

      expect(res._status).toBe(200);
      expect(res._json.data.quota.monthly_limit).toBe(-1);
      expect(res._json.data.quota.remaining).toBe(-1);
    });

    it('should not call AI service when quota is exceeded', async () => {
      mockQuotaCheck.mockResolvedValue({
        allowed: false,
        plan_name: 'Free Plan',
        monthly_limit: 5,
        used_this_month: 5,
        remaining: 0,
        resets_at: '2026-04-01T00:00:00.000Z',
      });

      const { __mockSearch } = require('../../services/aiSearch/aiSearch.service');

      const req = createMockReq({
        query: 'Find Hindu women',
        profile_id: 1,
      });
      const res = createMockRes();

      await aiSearch(req as any, res as any);

      expect(res._status).toBe(429);
      expect(__mockSearch).not.toHaveBeenCalled();
    });
  });
});
