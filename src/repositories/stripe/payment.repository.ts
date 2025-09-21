import pool from '../../config/database';
import { PoolConnection } from 'mysql2/promise';
import Stripe from 'stripe';

// Extended interfaces for Stripe types with additional properties
interface ExtendedPaymentIntent extends Stripe.PaymentIntent {
  invoice?: string;
}

interface ExtendedCharge extends Stripe.Charge {
  invoice?: string;
}

export class StripePaymentIntentRepository {
  async create(paymentIntent: ExtendedPaymentIntent, connection?: PoolConnection): Promise<any> {
    const conn = connection || await pool.getConnection();
    try {
      const [result] = await conn.execute(
        `INSERT INTO stripe_payment_intents (
          id, customer_id, amount, currency, payment_method_id, status,
          setup_future_usage, capture_method, confirmation_method, description,
          receipt_email, statement_descriptor, statement_descriptor_suffix,
          next_action, last_payment_error, invoice_id, canceled_at,
          cancellation_reason, automatic_payment_methods, payment_method_options, metadata
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          status = VALUES(status),
          payment_method_id = VALUES(payment_method_id),
          next_action = VALUES(next_action),
          last_payment_error = VALUES(last_payment_error),
          canceled_at = VALUES(canceled_at),
          cancellation_reason = VALUES(cancellation_reason),
          metadata = VALUES(metadata),
          updated_at = CURRENT_TIMESTAMP`,
        [
          paymentIntent.id,
          paymentIntent.customer,
          paymentIntent.amount,
          paymentIntent.currency,
          paymentIntent.payment_method,
          paymentIntent.status,
          paymentIntent.setup_future_usage,
          paymentIntent.capture_method,
          paymentIntent.confirmation_method,
          paymentIntent.description,
          paymentIntent.receipt_email,
          paymentIntent.statement_descriptor,
          paymentIntent.statement_descriptor_suffix,
          JSON.stringify(paymentIntent.next_action || {}),
          JSON.stringify(paymentIntent.last_payment_error || {}),
          paymentIntent.invoice,
          paymentIntent.canceled_at ? new Date(paymentIntent.canceled_at * 1000) : null,
          paymentIntent.cancellation_reason,
          JSON.stringify(paymentIntent.automatic_payment_methods || {}),
          JSON.stringify(paymentIntent.payment_method_options || {}),
          JSON.stringify(paymentIntent.metadata || {})
        ]
      );
      return result;
    } finally {
      if (!connection) conn.release();
    }
  }

  async findById(paymentIntentId: string): Promise<any> {
    const [rows] = await pool.execute(
      `SELECT * FROM stripe_payment_intents WHERE id = ? AND deleted_at IS NULL`,
      [paymentIntentId]
    );
    return (rows as any[])[0];
  }

  async findByCustomerId(customerId: string): Promise<any[]> {
    const [rows] = await pool.execute(
      `SELECT * FROM stripe_payment_intents WHERE customer_id = ? AND deleted_at IS NULL ORDER BY created_at DESC`,
      [customerId]
    );
    return rows as any[];
  }

  async softDelete(paymentIntentId: string): Promise<any> {
    const [result] = await pool.execute(
      `UPDATE stripe_payment_intents SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [paymentIntentId]
    );
    return result;
  }
}

export class StripeChargeRepository {
  async create(charge: ExtendedCharge, connection?: PoolConnection): Promise<any> {
    const conn = connection || await pool.getConnection();
    try {
      const [result] = await conn.execute(
        `INSERT INTO stripe_charges (
          id, payment_intent_id, customer_id, amount, amount_refunded, currency,
          payment_method_id, status, description, receipt_email, receipt_url,
          statement_descriptor, statement_descriptor_suffix, failure_code,
          failure_message, fraud_details, invoice_id, metadata
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          amount_refunded = VALUES(amount_refunded),
          status = VALUES(status),
          failure_code = VALUES(failure_code),
          failure_message = VALUES(failure_message),
          fraud_details = VALUES(fraud_details),
          metadata = VALUES(metadata),
          updated_at = CURRENT_TIMESTAMP`,
        [
          charge.id,
          charge.payment_intent,
          charge.customer,
          charge.amount,
          charge.amount_refunded,
          charge.currency,
          charge.payment_method,
          charge.status,
          charge.description,
          charge.receipt_email,
          charge.receipt_url,
          charge.statement_descriptor,
          charge.statement_descriptor_suffix,
          charge.failure_code,
          charge.failure_message,
          JSON.stringify(charge.fraud_details || {}),
          charge.invoice,
          JSON.stringify(charge.metadata || {})
        ]
      );
      return result;
    } finally {
      if (!connection) conn.release();
    }
  }

  async findById(chargeId: string): Promise<any> {
    const [rows] = await pool.execute(
      `SELECT * FROM stripe_charges WHERE id = ? AND deleted_at IS NULL`,
      [chargeId]
    );
    return (rows as any[])[0];
  }

  async findByCustomerId(customerId: string): Promise<any[]> {
    const [rows] = await pool.execute(
      `SELECT * FROM stripe_charges WHERE customer_id = ? AND deleted_at IS NULL ORDER BY created_at DESC`,
      [customerId]
    );
    return rows as any[];
  }

  async findByPaymentIntentId(paymentIntentId: string): Promise<any[]> {
    const [rows] = await pool.execute(
      `SELECT * FROM stripe_charges WHERE payment_intent_id = ? AND deleted_at IS NULL ORDER BY created_at DESC`,
      [paymentIntentId]
    );
    return rows as any[];
  }
}
