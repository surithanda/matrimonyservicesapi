import pool from '../../config/database';
import { PoolConnection } from 'mysql2/promise';
import Stripe from 'stripe';

export class StripeCustomerRepository {
  async create(customer: Stripe.Customer, connection?: PoolConnection): Promise<any> {
    const conn = connection || await pool.getConnection();
    try {
      const [result] = await conn.execute(
        `INSERT INTO stripe_customers (
          id, account_id, email, name, description, default_payment_method_id,
          invoice_prefix, phone, address_line1, address_line2, address_city,
          address_state, address_postal_code, address_country, tax_exempt,
          tax_ids, preferred_locales, cash_balance, metadata
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          email = VALUES(email),
          name = VALUES(name),
          description = VALUES(description),
          default_payment_method_id = VALUES(default_payment_method_id),
          invoice_prefix = VALUES(invoice_prefix),
          phone = VALUES(phone),
          address_line1 = VALUES(address_line1),
          address_line2 = VALUES(address_line2),
          address_city = VALUES(address_city),
          address_state = VALUES(address_state),
          address_postal_code = VALUES(address_postal_code),
          address_country = VALUES(address_country),
          tax_exempt = VALUES(tax_exempt),
          tax_ids = VALUES(tax_ids),
          preferred_locales = VALUES(preferred_locales),
          cash_balance = VALUES(cash_balance),
          metadata = VALUES(metadata),
          updated_at = CURRENT_TIMESTAMP`,
        [
          customer.id,
          customer.metadata?.account_id || null,
          customer.email,
          customer.name,
          customer.description,
          customer.invoice_settings?.default_payment_method || null,
          customer.invoice_prefix,
          customer.phone,
          customer.address?.line1 || null,
          customer.address?.line2 || null,
          customer.address?.city || null,
          customer.address?.state || null,
          customer.address?.postal_code || null,
          customer.address?.country || null,
          customer.tax_exempt,
          JSON.stringify(customer.tax_ids?.data || []),
          JSON.stringify(customer.preferred_locales || []),
          JSON.stringify(customer.cash_balance || {}),
          JSON.stringify(customer.metadata || {})
        ]
      );
      return result;
    } finally {
      if (!connection) conn.release();
    }
  }

  async findById(customerId: string): Promise<any> {
    const [rows] = await pool.execute(
      `SELECT * FROM stripe_customers WHERE id = ? AND deleted_at IS NULL`,
      [customerId]
    );
    return (rows as any[])[0];
  }

  async findByAccountId(accountId: number): Promise<any> {
    const [rows] = await pool.execute(
      `SELECT * FROM stripe_customers WHERE account_id = ? AND deleted_at IS NULL`,
      [accountId]
    );
    return (rows as any[])[0];
  }

  async softDelete(customerId: string): Promise<any> {
    const [result] = await pool.execute(
      `UPDATE stripe_customers SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [customerId]
    );
    return result;
  }
}
