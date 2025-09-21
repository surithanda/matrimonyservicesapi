import stripe from '../../config/stripe';
import Stripe from 'stripe';
import { StripeProductRepository } from '../../repositories/stripe/product.repository';
import { StripePriceRepository } from '../../repositories/stripe/price.repository';
import pool from '../../config/database';

export class StripeProductService {
  private stripeProductRepository: StripeProductRepository;
  private stripePriceRepository: StripePriceRepository;

  constructor() {
    this.stripeProductRepository = new StripeProductRepository();
    this.stripePriceRepository = new StripePriceRepository();
  }

  async createProduct(productData: {
    name: string;
    description?: string;
    images?: string[];
    metadata?: Record<string, string>;
  }): Promise<any> {
    const connection = await pool.getConnection();
    
    try {
      // Create product in Stripe
      const product = await stripe.products.create({
        name: productData.name,
        description: productData.description,
        images: productData.images,
        metadata: productData.metadata
      });

      // Save product to database
      await this.stripeProductRepository.create(product, connection);

      return {
        success: true,
        message: 'Product created successfully',
        data: product
      };
    } catch (error: any) {
      throw error;
    } finally {
      connection.release();
    }
  }

  async getProduct(productId: string): Promise<any> {
    try {
      // Get from database first
      const localProduct = await this.stripeProductRepository.findById(productId);
      
      if (!localProduct) {
        // If not in database, try to get from Stripe
        const stripeProduct = await stripe.products.retrieve(productId);
        
        // Save to database
        await this.stripeProductRepository.create(stripeProduct);
        
        return {
          success: true,
          message: 'Product retrieved from Stripe',
          data: stripeProduct
        };
      }
      
      return {
        success: true,
        message: 'Product found',
        data: localProduct
      };
    } catch (error: any) {
      if (error.code === 'resource_missing') {
        return {
          success: false,
          message: 'Product not found in Stripe'
        };
      }
      throw error;
    }
  }

  async listProducts(active?: boolean): Promise<any> {
    try {
      // Get from database
      const localProducts = await this.stripeProductRepository.findAll(active);
      
      if (localProducts.length === 0) {
        // If none in database, get from Stripe
        const stripeProducts = await stripe.products.list({
          active: active,
          limit: 100
        });
        
        // Save to database
        for (const product of stripeProducts.data) {
          await this.stripeProductRepository.create(product);
        }
        
        return {
          success: true,
          message: 'Products retrieved from Stripe',
          data: stripeProducts.data
        };
      }
      
      return {
        success: true,
        message: 'Products found',
        data: localProducts
      };
    } catch (error: any) {
      throw error;
    }
  }

  async updateProduct(productId: string, updateData: any): Promise<any> {
    try {
      // Update in Stripe
      const product = await stripe.products.update(productId, updateData);
      
      // Update in database
      await this.stripeProductRepository.create(product);
      
      return {
        success: true,
        message: 'Product updated successfully',
        data: product
      };
    } catch (error: any) {
      throw error;
    }
  }

  async deleteProduct(productId: string): Promise<any> {
    try {
      // Archive in Stripe (Stripe doesn't allow true deletion)
      const archived = await stripe.products.update(productId, { active: false });
      
      // Soft delete in database
      await this.stripeProductRepository.softDelete(productId);
      
      return {
        success: true,
        message: 'Product archived successfully',
        data: archived
      };
    } catch (error: any) {
      throw error;
    }
  }

  async syncProductsFromStripe(): Promise<any> {
    try {
      let hasMore = true;
      let startingAfter: string | undefined = undefined;
      const allProducts: any[] = [];
      
      // Paginate through all products
      while (hasMore) {
        const products: Stripe.Response<Stripe.ApiList<Stripe.Product>> = await stripe.products.list({
          limit: 100,
          starting_after: startingAfter
        });
        
        // Save each product to database
        for (const product of products.data) {
          await this.stripeProductRepository.create(product);
          allProducts.push(product);
        }
        
        hasMore = products.has_more;
        if (products.data.length > 0) {
          startingAfter = products.data[products.data.length - 1].id;
        } else {
          hasMore = false;
        }
      }
      
      return {
        success: true,
        message: `Synced ${allProducts.length} products successfully`,
        data: { count: allProducts.length }
      };
    } catch (error: any) {
      throw error;
    }
  }
}
