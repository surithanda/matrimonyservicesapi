import pool from '../../config/database';
import logger from '../../config/logger';
import { IQuotaStatus } from '../../interfaces/aiSearch.interface';

export class QuotaChecker {

  async check(accountId: number): Promise<IQuotaStatus> {
    try {
      // Call SP — handles active subscription lookup + free plan fallback + usage count
      const [rows] = await pool.execute('CALL ai_search_get_quota(?)', [accountId]);

      const result = (rows as any[])[0]?.[0];

      if (!result || !result.plan_name) {
        logger.warn('[QuotaChecker] SP returned no data', { accountId });
        return this.failOpen();
      }

      const monthlyLimit: number = result.monthly_limit;
      const usedThisMonth: number = result.used_this_month;

      // Unlimited plan (-1)
      if (monthlyLimit === -1) {
        return {
          allowed: true,
          plan_name: result.plan_name,
          monthly_limit: -1,
          used_this_month: usedThisMonth,
          remaining: -1,
          resets_at: this.getNextMonthStart(),
        };
      }

      const remaining = Math.max(0, monthlyLimit - usedThisMonth);

      return {
        allowed: usedThisMonth < monthlyLimit,
        plan_name: result.plan_name,
        monthly_limit: monthlyLimit,
        used_this_month: usedThisMonth,
        remaining,
        resets_at: this.getNextMonthStart(),
      };
    } catch (error: any) {
      logger.error('[QuotaChecker] Failed to check quota', {
        accountId,
        error: error.message,
      });

      return this.failOpen();
    }
  }

  private failOpen(): IQuotaStatus {
    // On error, allow the search but log the issue
    return {
      allowed: true,
      plan_name: 'Unknown',
      monthly_limit: -1,
      used_this_month: 0,
      remaining: -1,
      resets_at: this.getNextMonthStart(),
    };
  }

  private getNextMonthStart(): string {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return nextMonth.toISOString();
  }
}
