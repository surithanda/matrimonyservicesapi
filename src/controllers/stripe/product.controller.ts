import { Request, Response } from 'express';
import { StripeProductService } from '../../services/stripe/product.service';

export class StripeProductController {
  private stripeProductService: StripeProductService;

  constructor() {
    this.stripeProductService = new StripeProductService();
  }

  async createProduct(req: Request, res: Response): Promise<void> {
    try {
      const productData = req.body;

      if (!productData.name) {
        res.status(400).json({
          success: false,
          message: 'Product name is required'
        });
        return;
      }

      const result = await this.stripeProductService.createProduct(productData);
      
      if (result.success) {
        res.status(201).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error creating product',
        error: error.message
      });
    }
  }

  async getProduct(req: Request, res: Response): Promise<void> {
    try {
      const { productId } = req.params;

      if (!productId) {
        res.status(400).json({
          success: false,
          message: 'Product ID is required'
        });
        return;
      }

      const result = await this.stripeProductService.getProduct(productId);
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(404).json(result);
      }
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error retrieving product',
        error: error.message
      });
    }
  }

  async listProducts(req: Request, res: Response): Promise<void> {
    try {
      const { active } = req.query;
      const isActive = active === 'true' ? true : active === 'false' ? false : undefined;

      const result = await this.stripeProductService.listProducts(isActive);
      
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error listing products',
        error: error.message
      });
    }
  }

  async updateProduct(req: Request, res: Response): Promise<void> {
    try {
      const { productId } = req.params;
      const updateData = req.body;

      if (!productId) {
        res.status(400).json({
          success: false,
          message: 'Product ID is required'
        });
        return;
      }

      const result = await this.stripeProductService.updateProduct(productId, updateData);
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error updating product',
        error: error.message
      });
    }
  }

  async deleteProduct(req: Request, res: Response): Promise<void> {
    try {
      const { productId } = req.params;

      if (!productId) {
        res.status(400).json({
          success: false,
          message: 'Product ID is required'
        });
        return;
      }

      const result = await this.stripeProductService.deleteProduct(productId);
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error deleting product',
        error: error.message
      });
    }
  }

  async syncProductsFromStripe(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.stripeProductService.syncProductsFromStripe();
      
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error syncing products from Stripe',
        error: error.message
      });
    }
  }
}
