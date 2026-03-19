import { QuotaChecker } from '../../services/aiSearch/quotaChecker';

// Mock the database pool
jest.mock('../../config/database', () => {
  const mockExecute = jest.fn();
  return {
    __esModule: true,
    default: { execute: mockExecute },
    __mockExecute: mockExecute,
  };
});

// Mock logger
jest.mock('../../config/logger', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

// Helper: wrap SP result in the nested array format that CALL returns
// pool.execute('CALL ...') returns [[ [row], metadata ]], destructured as rows = [[row], metadata]
// so rows[0][0] = row
function spResult(row: { plan_name: string; monthly_limit: number; used_this_month: number }) {
  return [[[row]]];
}

describe('QuotaChecker', () => {
  let checker: QuotaChecker;
  let mockExecute: jest.Mock;

  beforeEach(() => {
    checker = new QuotaChecker();
    const db = require('../../config/database');
    mockExecute = db.__mockExecute;
    mockExecute.mockReset();
  });

  describe('check() — uses SP ai_search_get_quota', () => {
    it('should allow search when user has active subscription with remaining quota', async () => {
      mockExecute.mockResolvedValueOnce(
        spResult({ plan_name: 'Bronze Plan', monthly_limit: 50, used_this_month: 12 })
      );

      const result = await checker.check(2);

      expect(mockExecute).toHaveBeenCalledWith('CALL ai_search_get_quota(?)', [2]);
      expect(result.allowed).toBe(true);
      expect(result.plan_name).toBe('Bronze Plan');
      expect(result.monthly_limit).toBe(50);
      expect(result.used_this_month).toBe(12);
      expect(result.remaining).toBe(38);
      expect(result.resets_at).toBeDefined();
    });

    it('should deny search when monthly quota is exhausted', async () => {
      mockExecute.mockResolvedValueOnce(
        spResult({ plan_name: 'Free Plan', monthly_limit: 5, used_this_month: 5 })
      );

      const result = await checker.check(2);

      expect(result.allowed).toBe(false);
      expect(result.plan_name).toBe('Free Plan');
      expect(result.monthly_limit).toBe(5);
      expect(result.used_this_month).toBe(5);
      expect(result.remaining).toBe(0);
    });

    it('should always allow unlimited plans (monthly_limit = -1)', async () => {
      mockExecute.mockResolvedValueOnce(
        spResult({ plan_name: 'Gold Plan', monthly_limit: -1, used_this_month: 999 })
      );

      const result = await checker.check(2);

      expect(result.allowed).toBe(true);
      expect(result.plan_name).toBe('Gold Plan');
      expect(result.monthly_limit).toBe(-1);
      expect(result.used_this_month).toBe(999);
      expect(result.remaining).toBe(-1);
    });

    it('should use free plan values from SP when no active subscription exists', async () => {
      // SP handles the fallback internally — still returns free plan data
      mockExecute.mockResolvedValueOnce(
        spResult({ plan_name: 'Free Plan', monthly_limit: 5, used_this_month: 3 })
      );

      const result = await checker.check(99);

      expect(result.allowed).toBe(true);
      expect(result.plan_name).toBe('Free Plan');
      expect(result.monthly_limit).toBe(5);
      expect(result.used_this_month).toBe(3);
      expect(result.remaining).toBe(2);
    });

    it('should deny free plan user when quota exhausted', async () => {
      mockExecute.mockResolvedValueOnce(
        spResult({ plan_name: 'Free Plan', monthly_limit: 5, used_this_month: 5 })
      );

      const result = await checker.check(99);

      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('should calculate correct resets_at (first of next month)', async () => {
      mockExecute.mockResolvedValueOnce(
        spResult({ plan_name: 'Bronze Plan', monthly_limit: 50, used_this_month: 0 })
      );

      const result = await checker.check(2);

      const resetsAt = new Date(result.resets_at);
      const now = new Date();
      const expectedMonth = now.getMonth() === 11 ? 0 : now.getMonth() + 1;
      expect(resetsAt.getDate()).toBe(1);
      expect(resetsAt.getMonth()).toBe(expectedMonth);
    });

    it('should fail-open on database error (allow the search)', async () => {
      mockExecute.mockRejectedValueOnce(new Error('Connection refused'));

      const result = await checker.check(2);

      expect(result.allowed).toBe(true);
      expect(result.plan_name).toBe('Unknown');
      expect(result.monthly_limit).toBe(-1);
    });

    it('should fail-open when SP returns empty result', async () => {
      mockExecute.mockResolvedValueOnce([[]]);

      const result = await checker.check(2);

      expect(result.allowed).toBe(true);
      expect(result.plan_name).toBe('Unknown');
    });

    it('should handle zero usage on fresh month', async () => {
      mockExecute.mockResolvedValueOnce(
        spResult({ plan_name: 'Silver Plan', monthly_limit: 250, used_this_month: 0 })
      );

      const result = await checker.check(2);

      expect(result.allowed).toBe(true);
      expect(result.used_this_month).toBe(0);
      expect(result.remaining).toBe(250);
    });

    it('should deny when used exceeds limit (edge case: limit lowered after usage)', async () => {
      mockExecute.mockResolvedValueOnce(
        spResult({ plan_name: 'Free Plan', monthly_limit: 5, used_this_month: 7 })
      );

      const result = await checker.check(2);

      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0); // clamped to 0, not -2
    });
  });
});
