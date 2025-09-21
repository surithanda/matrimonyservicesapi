import pool from '../../config/database';
import { PoolConnection } from 'mysql2/promise';
import Stripe from 'stripe';

export class StripeProductRepository {
  async create(product: Stripe.Product, connection?: PoolConnection): Promise<any> {
    const conn = connection || await pool.getConnection();
    try {
      const [result] = await conn.execute(
        `INSERT INTO stripe_products (
          id, name, description, active, images, url, metadata
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          name = VALUES(name),
          description = VALUES(description),
          active = VALUES(active),
          images = VALUES(images),
          url = VALUES(url),
          metadata = VALUES(metadata),
          updated_at = CURRENT_TIMESTAMP`,
        [
          product.id,
          product.name,
          product.description,
          product.active,
          JSON.stringify(product.images || []),
          product.url,
          JSON.stringify(product.metadata || {})
        ]
      );
      return result;
    } finally {
      if (!connection) conn.release();
    }
  }

  async findById(productId: string): Promise<any> {
    const [rows] = await pool.execute(
      `SELECT * FROM stripe_products WHERE id = ? AND deleted_at IS NULL`,
      [productId]
    );
    return (rows as any[])[0];
  }

  async findAll(active?: boolean): Promise<any[]> {
    let query = `SELECT * FROM stripe_products WHERE deleted_at IS NULL`;
    const params: any[] = [];
    
    if (active !== undefined) {
      query += ` AND active = ?`;
      params.push(active);
    }
    
    query += ` ORDER BY created_at DESC`;
    
    const [rows] = await pool.execute(query, params);
    return rows as any[];
  }

  async softDelete(productId: string): Promise<any> {
    const [result] = await pool.execute(
      `UPDATE stripe_products SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [productId]
    );
    return result;
  }
}
