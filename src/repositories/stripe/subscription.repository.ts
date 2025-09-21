import pool from '../../config/database';
import { PoolConnection } from 'mysql2/promise';
import Stripe from 'stripe';

// Extended interface for Stripe Subscription with timestamp properties
interface ExtendedSubscription extends Omit<Stripe.Subscription, 
  'current_period_start' | 'current_period_end' | 'start_date' | 
  'ended_at' | 'cancel_at' | 'canceled_at' | 'trial_start' | 'trial_end'> {
  current_period_start: number;
  current_period_end: number;
  start_date?: number | null;
  ended_at?: number | null;
  cancel_at?: number | null;
  canceled_at?: number | null;
  trial_start?: number | null;
  trial_end?: number | null;
}

export class StripeSubscriptionRepository {
  async create(subscription: ExtendedSubscription, connection?: PoolConnection): Promise<any> {
    const conn = connection || await pool.getConnection();
    try {
      const [result] = await conn.execute(
        `INSERT INTO stripe_subscriptions (
          id, customer_id, status, cancel_at_period_end, current_period_start, 
          current_period_end, start_date, ended_at, cancel_at, canceled_at, 
          trial_start, trial_end, application_fee_percent, default_payment_method_id, 
          latest_invoice_id, collection_method, days_until_due, pause_collection, 
          automatic_tax, metadata
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          status = VALUES(status),
          cancel_at_period_end = VALUES(cancel_at_period_end),
          current_period_start = VALUES(current_period_start),
          current_period_end = VALUES(current_period_end),
          ended_at = VALUES(ended_at),
          cancel_at = VALUES(cancel_at),
          canceled_at = VALUES(canceled_at),
          trial_end = VALUES(trial_end),
          default_payment_method_id = VALUES(default_payment_method_id),
          latest_invoice_id = VALUES(latest_invoice_id),
          collection_method = VALUES(collection_method),
          days_until_due = VALUES(days_until_due),
          pause_collection = VALUES(pause_collection),
          automatic_tax = VALUES(automatic_tax),
          metadata = VALUES(metadata),
          updated_at = CURRENT_TIMESTAMP`,
        [
          subscription.id,
          subscription.customer,
          subscription.status,
          subscription.cancel_at_period_end,
          subscription.current_period_start ? new Date(subscription.current_period_start * 1000) : null,
          subscription.current_period_end ? new Date(subscription.current_period_end * 1000) : null,
          subscription.start_date ? new Date(subscription.start_date * 1000) : null,
          subscription.ended_at ? new Date(subscription.ended_at * 1000) : null,
          subscription.cancel_at ? new Date(subscription.cancel_at * 1000) : null,
          subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
          subscription.trial_start ? new Date(subscription.trial_start * 1000) : null,
          subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
          subscription.application_fee_percent,
          subscription.default_payment_method,
          subscription.latest_invoice,
          subscription.collection_method,
          subscription.days_until_due,
          JSON.stringify(subscription.pause_collection || {}),
          JSON.stringify(subscription.automatic_tax || {}),
          JSON.stringify(subscription.metadata || {})
        ]
      );
      return result;
    } finally {
      if (!connection) conn.release();
    }
  }

  async findById(subscriptionId: string): Promise<any> {
    const [rows] = await pool.execute(
      `SELECT * FROM stripe_subscriptions WHERE id = ? AND deleted_at IS NULL`,
      [subscriptionId]
    );
    return (rows as any[])[0];
  }

  async findByCustomerId(customerId: string, status?: string): Promise<any[]> {
    let query = `SELECT * FROM stripe_subscriptions WHERE customer_id = ? AND deleted_at IS NULL`;
    const params: any[] = [customerId];
    
    if (status) {
      query += ` AND status = ?`;
      params.push(status);
    }
    
    query += ` ORDER BY created_at DESC`;
    
    const [rows] = await pool.execute(query, params);
    return rows as any[];
  }

  async softDelete(subscriptionId: string): Promise<any> {
    const [result] = await pool.execute(
      `UPDATE stripe_subscriptions SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [subscriptionId]
    );
    return result;
  }
}
