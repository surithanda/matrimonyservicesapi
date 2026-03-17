import pool from '../../config/database';
import logger from '../../config/logger';
import { ICreditStatus } from '../../interfaces/aiSearch.interface';

export class CreditChecker {

  /**
   * Check credit balance for an account.
   * Returns current balance and whether the user can perform a search.
   */
  async check(accountId: number): Promise<ICreditStatus> {
    try {
      const [rows] = await pool.execute('CALL ai_search_get_credits(?)', [accountId]);
      const result = (rows as any[])[0]?.[0];

      if (!result) {
        // No record — user has never been granted credits
        return {
          allowed: false,
          credits_remaining: 0,
          free_credits_granted: false,
        };
      }

      const balance: number = result.credit_balance ?? 0;
      const freeGranted: boolean = result.free_credits_granted === 1;

      return {
        allowed: balance > 0,
        credits_remaining: balance,
        free_credits_granted: freeGranted,
      };
    } catch (error: any) {
      logger.error('[CreditChecker] Failed to check credits', {
        accountId,
        error: error.message,
      });

      // Fail-open: allow the search on DB error
      return this.failOpen();
    }
  }

  /**
   * Deduct 1 credit after a successful AI search.
   * Returns the new balance or null if deduction failed.
   */
  async deduct(accountId: number): Promise<{ credit_balance: number; status: string } | null> {
    try {
      const [rows] = await pool.execute('CALL ai_search_use_credit(?)', [accountId]);
      const result = (rows as any[])[0]?.[0];

      if (!result) {
        logger.warn('[CreditChecker] use_credit SP returned no data', { accountId });
        return null;
      }

      return {
        credit_balance: result.credit_balance,
        status: result.status,
      };
    } catch (error: any) {
      logger.error('[CreditChecker] Failed to deduct credit', {
        accountId,
        error: error.message,
      });
      return null;
    }
  }

  /**
   * Grant 10 free credits on membership activation (idempotent).
   */
  async grantFreeCredits(accountId: number): Promise<{ credit_balance: number; credits_added: number; status: string } | null> {
    try {
      const [rows] = await pool.execute('CALL ai_search_grant_free_credits(?)', [accountId]);
      const result = (rows as any[])[0]?.[0];

      if (!result) {
        logger.warn('[CreditChecker] grant_free_credits SP returned no data', { accountId });
        return null;
      }

      return {
        credit_balance: result.credit_balance,
        credits_added: result.credits_added,
        status: result.status,
      };
    } catch (error: any) {
      logger.error('[CreditChecker] Failed to grant free credits', {
        accountId,
        error: error.message,
      });
      return null;
    }
  }

  /**
   * Add purchased credits to an account.
   */
  async addCredits(
    accountId: number,
    credits: number,
    description: string,
    stripeSessionId: string | null
  ): Promise<{ credit_balance: number; credits_added: number; status: string } | null> {
    try {
      const [rows] = await pool.execute(
        'CALL ai_search_add_credits(?, ?, ?, ?)',
        [accountId, credits, description, stripeSessionId]
      );
      const result = (rows as any[])[0]?.[0];

      if (!result) {
        logger.warn('[CreditChecker] add_credits SP returned no data', { accountId });
        return null;
      }

      return {
        credit_balance: result.credit_balance,
        credits_added: result.credits_added,
        status: result.status,
      };
    } catch (error: any) {
      logger.error('[CreditChecker] Failed to add credits', {
        accountId,
        credits,
        error: error.message,
      });
      return null;
    }
  }

  private failOpen(): ICreditStatus {
    return {
      allowed: true,
      credits_remaining: -1,  // -1 signals "unknown / fail-open"
      free_credits_granted: false,
    };
  }
}
