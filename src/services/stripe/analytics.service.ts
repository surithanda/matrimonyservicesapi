import pool from '../../config/database';
import { PoolConnection } from 'mysql2/promise';

export class StripeAnalyticsService {
  /**
   * Get subscription metrics
   * @param startDate Start date for the report period
   * @param endDate End date for the report period
   */
  async getSubscriptionMetrics(startDate?: Date, endDate?: Date): Promise<any> {
    const conn = await pool.getConnection();
    try {
      let dateFilter = '';
      const params: any[] = [];
      
      if (startDate && endDate) {
        dateFilter = 'WHERE created_at BETWEEN ? AND ?';
        params.push(startDate, endDate);
      } else if (startDate) {
        dateFilter = 'WHERE created_at >= ?';
        params.push(startDate);
      } else if (endDate) {
        dateFilter = 'WHERE created_at <= ?';
        params.push(endDate);
      }

      // Get active subscriptions count by status
      const [statusCounts] = await conn.execute(`
        SELECT 
          status, 
          COUNT(*) as count 
        FROM stripe_subscriptions 
        ${dateFilter}
        GROUP BY status
      `, params);

      // Get subscription growth over time
      const [subscriptionGrowth] = await conn.execute(`
        SELECT 
          DATE_FORMAT(created_at, '%Y-%m-%d') as date,
          COUNT(*) as new_subscriptions
        FROM stripe_subscriptions
        ${dateFilter}
        GROUP BY DATE_FORMAT(created_at, '%Y-%m-%d')
        ORDER BY date
      `, params);

      // Get churn rate (canceled subscriptions)
      const [churnData] = await conn.execute(`
        SELECT 
          DATE_FORMAT(canceled_at, '%Y-%m') as month,
          COUNT(*) as canceled_count
        FROM stripe_subscriptions
        WHERE canceled_at IS NOT NULL
        ${dateFilter ? 'AND ' + dateFilter.substring(6) : ''}
        GROUP BY DATE_FORMAT(canceled_at, '%Y-%m')
        ORDER BY month
      `, params);

      return {
        success: true,
        message: 'Subscription metrics retrieved successfully',
        data: {
          statusCounts,
          subscriptionGrowth,
          churnData
        }
      };
    } catch (error: any) {
      throw error;
    } finally {
      conn.release();
    }
  }

  /**
   * Get revenue metrics
   * @param startDate Start date for the report period
   * @param endDate End date for the report period
   * @param groupBy Group by 'day', 'week', 'month', or 'year'
   */
  async getRevenueMetrics(startDate?: Date, endDate?: Date, groupBy: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<any> {
    const conn = await pool.getConnection();
    try {
      let dateFilter = '';
      const params: any[] = [];
      
      if (startDate && endDate) {
        dateFilter = 'WHERE created_at BETWEEN ? AND ?';
        params.push(startDate, endDate);
      } else if (startDate) {
        dateFilter = 'WHERE created_at >= ?';
        params.push(startDate);
      } else if (endDate) {
        dateFilter = 'WHERE created_at <= ?';
        params.push(endDate);
      }

      // Format string for grouping
      let dateFormat;
      switch (groupBy) {
        case 'day':
          dateFormat = '%Y-%m-%d';
          break;
        case 'week':
          dateFormat = '%Y-%u';
          break;
        case 'month':
          dateFormat = '%Y-%m';
          break;
        case 'year':
          dateFormat = '%Y';
          break;
        default:
          dateFormat = '%Y-%m';
      }

      // Get revenue by time period
      const [revenueByPeriod] = await conn.execute(`
        SELECT 
          DATE_FORMAT(created_at, '${dateFormat}') as period,
          SUM(amount) as total_amount,
          currency
        FROM stripe_payment_intents
        ${dateFilter}
        AND status = 'succeeded'
        GROUP BY DATE_FORMAT(created_at, '${dateFormat}'), currency
        ORDER BY period
      `, params);

      // Get revenue by product
      const [revenueByProduct] = await conn.execute(`
        SELECT 
          p.name as product_name,
          SUM(pi.amount) as total_amount,
          pi.currency
        FROM stripe_payment_intents pi
        JOIN stripe_invoices i ON pi.invoice_id = i.id
        JOIN stripe_subscriptions s ON i.subscription_id = s.id
        JOIN stripe_subscription_items si ON si.subscription_id = s.id
        JOIN stripe_prices pr ON si.price_id = pr.id
        JOIN stripe_products p ON pr.product_id = p.id
        ${dateFilter.replace('WHERE', 'WHERE pi.')}
        AND pi.status = 'succeeded'
        GROUP BY p.id, pi.currency
        ORDER BY total_amount DESC
      `, params);

      return {
        success: true,
        message: 'Revenue metrics retrieved successfully',
        data: {
          revenueByPeriod,
          revenueByProduct
        }
      };
    } catch (error: any) {
      throw error;
    } finally {
      conn.release();
    }
  }

  /**
   * Get customer metrics
   * @param startDate Start date for the report period
   * @param endDate End date for the report period
   */
  async getCustomerMetrics(startDate?: Date, endDate?: Date): Promise<any> {
    const conn = await pool.getConnection();
    try {
      let dateFilter = '';
      const params: any[] = [];
      
      if (startDate && endDate) {
        dateFilter = 'WHERE created_at BETWEEN ? AND ?';
        params.push(startDate, endDate);
      } else if (startDate) {
        dateFilter = 'WHERE created_at >= ?';
        params.push(startDate);
      } else if (endDate) {
        dateFilter = 'WHERE created_at <= ?';
        params.push(endDate);
      }

      // Get new customers over time
      const [newCustomers] = await conn.execute(`
        SELECT 
          DATE_FORMAT(created_at, '%Y-%m-%d') as date,
          COUNT(*) as count
        FROM stripe_customers
        ${dateFilter}
        GROUP BY DATE_FORMAT(created_at, '%Y-%m-%d')
        ORDER BY date
      `, params);

      // Get customer lifetime value
      const [customerLTV] = await conn.execute(`
        SELECT 
          c.id as customer_id,
          c.email,
          SUM(pi.amount) as total_spent,
          pi.currency,
          COUNT(DISTINCT pi.id) as payment_count
        FROM stripe_customers c
        JOIN stripe_payment_intents pi ON c.id = pi.customer_id
        WHERE pi.status = 'succeeded'
        ${dateFilter.replace('WHERE', 'AND')}
        GROUP BY c.id, pi.currency
        ORDER BY total_spent DESC
        LIMIT 100
      `, params);

      return {
        success: true,
        message: 'Customer metrics retrieved successfully',
        data: {
          newCustomers,
          customerLTV
        }
      };
    } catch (error: any) {
      throw error;
    } finally {
      conn.release();
    }
  }

  /**
   * Get payment metrics
   * @param startDate Start date for the report period
   * @param endDate End date for the report period
   */
  async getPaymentMetrics(startDate?: Date, endDate?: Date): Promise<any> {
    const conn = await pool.getConnection();
    try {
      let dateFilter = '';
      const params: any[] = [];
      
      if (startDate && endDate) {
        dateFilter = 'WHERE created_at BETWEEN ? AND ?';
        params.push(startDate, endDate);
      } else if (startDate) {
        dateFilter = 'WHERE created_at >= ?';
        params.push(startDate);
      } else if (endDate) {
        dateFilter = 'WHERE created_at <= ?';
        params.push(endDate);
      }

      // Get payment success/failure rates
      const [paymentStatusCounts] = await conn.execute(`
        SELECT 
          status,
          COUNT(*) as count
        FROM stripe_payment_intents
        ${dateFilter}
        GROUP BY status
      `, params);

      // Get payment methods distribution
      const [paymentMethods] = await conn.execute(`
        SELECT 
          JSON_EXTRACT(pm.metadata, '$.type') as payment_method_type,
          COUNT(*) as count
        FROM stripe_payment_intents pi
        JOIN stripe_payment_methods pm ON pi.payment_method_id = pm.id
        ${dateFilter.replace('WHERE', 'WHERE pi.')}
        AND pi.status = 'succeeded'
        GROUP BY JSON_EXTRACT(pm.metadata, '$.type')
        ORDER BY count DESC
      `, params);

      return {
        success: true,
        message: 'Payment metrics retrieved successfully',
        data: {
          paymentStatusCounts,
          paymentMethods
        }
      };
    } catch (error: any) {
      throw error;
    } finally {
      conn.release();
    }
  }
}
