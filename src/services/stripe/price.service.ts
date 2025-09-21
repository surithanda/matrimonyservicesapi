import stripe from '../../config/stripe';
import { StripePriceRepository } from '../../repositories/stripe/price.repository';
import { StripeProductRepository } from '../../repositories/stripe/product.repository';
import pool from '../../config/database';

export class StripePriceService {
  private stripePriceRepository: StripePriceRepository;
  private stripeProductRepository: StripeProductRepository;

  constructor() {
    this.stripePriceRepository = new StripePriceRepository();
    this.stripeProductRepository = new StripeProductRepository();
  }

  async createPrice(priceData: {
    product: string;
    currency: string;
    unit_amount: number;
    nickname?: string;
    recurring?: {
      interval: 'day' | 'week' | 'month' | 'year';
      interval_count?: number;
    };
    metadata?: Record<string, string>;
  }): Promise<any> {
    const connection = await pool.getConnection();
    
    try {
      // Check if product exists
      const product = await this.stripeProductRepository.findById(priceData.product);
      
      if (!product) {
        // Try to get from Stripe
        try {
          const stripeProduct = await stripe.products.retrieve(priceData.product);
          await this.stripeProductRepository.create(stripeProduct);
        } catch (error) {
          return {
            success: false,
            message: 'Product not found'
          };
        }
      }

      // Create price in Stripe
      const price = await stripe.prices.create({
        product: priceData.product,
        currency: priceData.currency,
        unit_amount: priceData.unit_amount,
        nickname: priceData.nickname,
        recurring: priceData.recurring,
        metadata: priceData.metadata
      });

      // Save price to database
      await this.stripePriceRepository.create(price, connection);

      return {
        success: true,
        message: 'Price created successfully',
        data: price
      };
    } catch (error: any) {
      throw error;
    } finally {
      connection.release();
    }
  }

  async getPrice(priceId: string): Promise<any> {
    try {
      // Get from database first
      const localPrice = await this.stripePriceRepository.findById(priceId);
      
      if (!localPrice) {
        // If not in database, try to get from Stripe
        const stripePrice = await stripe.prices.retrieve(priceId);
        
        // Save to database
        await this.stripePriceRepository.create(stripePrice);
        
        return {
          success: true,
          message: 'Price retrieved from Stripe',
          data: stripePrice
        };
      }
      
      return {
        success: true,
        message: 'Price found',
        data: localPrice
      };
    } catch (error: any) {
      if (error.code === 'resource_missing') {
        return {
          success: false,
          message: 'Price not found in Stripe'
        };
      }
      throw error;
    }
  }

  async listPricesByProduct(productId: string, active?: boolean): Promise<any> {
    try {
      // Get from database
      const localPrices = await this.stripePriceRepository.findByProductId(productId, active);
      
      if (localPrices.length === 0) {
        // If none in database, get from Stripe
        const stripePrices = await stripe.prices.list({
          product: productId,
          active: active,
          limit: 100
        });
        
        // Save to database
        for (const price of stripePrices.data) {
          await this.stripePriceRepository.create(price);
        }
        
        return {
          success: true,
          message: 'Prices retrieved from Stripe',
          data: stripePrices.data
        };
      }
      
      return {
        success: true,
        message: 'Prices found',
        data: localPrices
      };
    } catch (error: any) {
      throw error;
    }
  }

  async updatePrice(priceId: string, updateData: { active?: boolean, metadata?: Record<string, string>, nickname?: string }): Promise<any> {
    try {
      // Update in Stripe (only limited fields can be updated)
      const price = await stripe.prices.update(priceId, updateData);
      
      // Update in database
      await this.stripePriceRepository.create(price);
      
      return {
        success: true,
        message: 'Price updated successfully',
        data: price
      };
    } catch (error: any) {
      throw error;
    }
  }

  async deactivatePrice(priceId: string): Promise<any> {
    try {
      // Deactivate in Stripe
      const price = await stripe.prices.update(priceId, { active: false });
      
      // Update in database
      await this.stripePriceRepository.create(price);
      
      return {
        success: true,
        message: 'Price deactivated successfully',
        data: price
      };
    } catch (error: any) {
      throw error;
    }
  }

  async syncPricesFromStripe(productId?: string): Promise<any> {
    try {
      let hasMore = true;
      let startingAfter: string | undefined = undefined;
      const allPrices: any[] = [];
      
      // Paginate through all prices
      while (hasMore) {
        const params: any = {
          limit: 100,
          starting_after: startingAfter,
          expand: ['data.product']
        };
        
        if (productId) {
          params.product = productId;
        }
        
        const prices = await stripe.prices.list(params);
        
        // Save each price to database
        for (const price of prices.data) {
          await this.stripePriceRepository.create(price);
          allPrices.push(price);
        }
        
        hasMore = prices.has_more;
        if (prices.data.length > 0) {
          startingAfter = prices.data[prices.data.length - 1].id;
        } else {
          hasMore = false;
        }
      }
      
      return {
        success: true,
        message: `Synced ${allPrices.length} prices successfully`,
        data: { count: allPrices.length }
      };
    } catch (error: any) {
      throw error;
    }
  }
}
