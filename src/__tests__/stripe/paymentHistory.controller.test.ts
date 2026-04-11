import { Request, Response } from 'express';
import { getPaymentHistory } from '../../controllers/stripe.controller';

// ── Mock StripeService ──────────────────────────────────────────────────────
const mockGetPaymentHistory = jest.fn();

jest.mock('../../services/stripe.service', () => ({
  StripeService: jest.fn().mockImplementation(() => ({
    createSession: jest.fn(),
    verifySession: jest.fn(),
    handleWebhookEvent: jest.fn(),
    getPaymentHistory: (...args: any[]) => mockGetPaymentHistory(...args),
  })),
}));

// ── Helpers ──────────────────────────────────────────────────────────────────
function createMockReq(user: any = null): Partial<Request> {
  return {
    user: user ?? { account_id: 42, email: 'test@mata.com', account_code: 'ACC001' },
  } as any;
}

function createMockRes(): Partial<Response> & { _status: number; _json: any } {
  const res: any = {
    _status: 0,
    _json: null,
    status(code: number) { res._status = code; return res; },
    json(data: any) { res._json = data; return res; },
  };
  return res;
}

const sampleHistoryItems = [
  {
    id: 1,
    name: 'John Doe',
    amount: 100,
    currency: 'usd',
    payment_status: 'paid',
    created_at: '2026-03-01T10:00:00.000Z',
  },
  {
    id: 2,
    name: 'John Doe',
    amount: 25,
    currency: 'usd',
    payment_status: 'paid',
    created_at: '2026-03-10T14:30:00.000Z',
  },
  {
    id: 3,
    name: 'John Doe',
    amount: 50,
    currency: 'usd',
    payment_status: 'unpaid',
    created_at: '2026-03-15T09:00:00.000Z',
  },
];

// ── Tests ────────────────────────────────────────────────────────────────────
describe('getPaymentHistory Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── Happy path ──────────────────────────────────────────────────────────
  describe('GET /stripe/payment-history', () => {
    it('PH-01 — returns 200 with payment history for authenticated user', async () => {
      mockGetPaymentHistory.mockResolvedValue({
        success: true,
        data: sampleHistoryItems,
        message: 'Payment history retrieved successfully',
      });

      const req = createMockReq();
      const res = createMockRes();

      await getPaymentHistory(req as any, res as any);

      expect(res._status).toBe(200);
      expect(res._json.success).toBe(true);
      expect(res._json.data).toHaveLength(3);
      expect(res._json.data[0].amount).toBe(100);
      expect(res._json.data[1].payment_status).toBe('paid');
    });

    it('PH-02 — returns 200 with empty array when no payments exist', async () => {
      mockGetPaymentHistory.mockResolvedValue({
        success: true,
        data: [],
        message: 'Payment history retrieved successfully',
      });

      const req = createMockReq();
      const res = createMockRes();

      await getPaymentHistory(req as any, res as any);

      expect(res._status).toBe(200);
      expect(res._json.success).toBe(true);
      expect(res._json.data).toEqual([]);
    });

    it('PH-03 — calls service with the correct account_id from JWT', async () => {
      mockGetPaymentHistory.mockResolvedValue({ success: true, data: [], message: 'ok' });

      const req = createMockReq({ account_id: 99, email: 'other@mata.com' });
      const res = createMockRes();

      await getPaymentHistory(req as any, res as any);

      expect(mockGetPaymentHistory).toHaveBeenCalledWith(99);
    });

    it('PH-04 — returns 201 when history items include varying statuses', async () => {
      mockGetPaymentHistory.mockResolvedValue({
        success: true,
        data: sampleHistoryItems,
        message: 'ok',
      });

      const req = createMockReq();
      const res = createMockRes();

      await getPaymentHistory(req as any, res as any);

      const statuses = res._json.data.map((item: any) => item.payment_status);
      expect(statuses).toContain('paid');
      expect(statuses).toContain('unpaid');
    });
  });

  // ── Auth / missing user ────────────────────────────────────────────────
  describe('Authentication guard', () => {
    it('PH-05 — returns 401 when no user is attached (no JWT)', async () => {
      const req = createMockReq({});  // empty user — no account_id
      const res = createMockRes();

      await getPaymentHistory(req as any, res as any);

      expect(res._status).toBe(401);
      expect(res._json.success).toBe(false);
      expect(res._json.message).toBe('Unauthorized');
    });

    it('PH-06 — does not call service when account_id is missing', async () => {
      const req = createMockReq({});
      const res = createMockRes();

      await getPaymentHistory(req as any, res as any);

      expect(mockGetPaymentHistory).not.toHaveBeenCalled();
    });
  });

  // ── Error handling ─────────────────────────────────────────────────────
  describe('Error handling', () => {
    it('PH-07 — returns 500 when service throws an unexpected error', async () => {
      mockGetPaymentHistory.mockRejectedValue(new Error('DB connection lost'));

      const req = createMockReq();
      const res = createMockRes();

      await getPaymentHistory(req as any, res as any);

      expect(res._status).toBe(500);
      expect(res._json.success).toBe(false);
      expect(res._json.message).toBe('Failed to retrieve payment history');
      expect(res._json.error).toBe('DB connection lost');
    });

    it('PH-08 — returns 500 with empty data array on error', async () => {
      mockGetPaymentHistory.mockRejectedValue(new Error('Timeout'));

      const req = createMockReq();
      const res = createMockRes();

      await getPaymentHistory(req as any, res as any);

      expect(res._status).toBe(500);
      expect(res._json.data).toEqual([]);
    });
  });
});
