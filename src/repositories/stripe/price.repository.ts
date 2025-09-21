import pool from '../../config/database';
import { PoolConnection } from 'mysql2/promise';
import Stripe from 'stripe';

export class StripePriceRepository {
  async create(price: Stripe.Price, connection?: PoolConnection): Promise<any> {
    const conn = connection || await pool.getConnection();
    try {
      const [result] = await conn.execute(
        `INSERT INTO stripe_prices (
          id, product_id, active, currency, unit_amount, nickname, type,
          recurring_interval, recurring_interval_count, recurring_usage_type,
          billing_scheme, tax_behavior, tiers, metadata
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          active = VALUES(active),
          nickname = VALUES(nickname),
          metadata = VALUES(metadata),
          updated_at = CURRENT_TIMESTAMP`,
        [
          price.id,
          price.product,
          price.active,
          price.currency,
          price.unit_amount,
          price.nickname,
          price.type,
          price.recurring?.interval || null,
          price.recurring?.interval_count || null,
          price.recurring?.usage_type || null,
          price.billing_scheme,
          price.tax_behavior,
          JSON.stringify(price.tiers || []),
          JSON.stringify(price.metadata || {})
        ]
      );
      return result;
    } finally {
      if (!connection) conn.release();
    }
  }

  async findById(priceId: string): Promise<any> {
    const [rows] = await pool.execute(
      `SELECT * FROM stripe_prices WHERE id = ? AND deleted_at IS NULL`,
      [priceId]
    );
    return (rows as any[])[0];
  }

  async findByProductId(productId: string, active?: boolean): Promise<any[]> {
    let query = `SELECT * FROM stripe_prices WHERE product_id = ? AND deleted_at IS NULL`;
    const params: any[] = [productId];
    
    if (active !== undefined) {
      query += ` AND active = ?`;
      params.push(active);
    }
    
    query += ` ORDER BY created_at DESC`;
    
    const [rows] = await pool.execute(query, params);
    return rows as any[];
  }

  async softDelete(priceId: string): Promise<any> {
    const [result] = await pool.execute(
      `UPDATE stripe_prices SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [priceId]
    );
    return result;
  }
}
