import { Request, Response } from 'express';
import { StripeCustomerService } from '../../services/stripe/customer.service';

export class StripeCustomerController {
  private stripeCustomerService: StripeCustomerService;

  constructor() {
    this.stripeCustomerService = new StripeCustomerService();
  }

  async createCustomer(req: Request, res: Response): Promise<void> {
    try {
      const { accountId } = req.body;

      if (!accountId) {
        res.status(400).json({
          success: false,
          message: 'Account ID is required'
        });
        return;
      }

      const result = await this.stripeCustomerService.createCustomer(accountId);
      
      if (result.success) {
        res.status(201).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error creating customer',
        error: error.message
      });
    }
  }

  async getCustomer(req: Request, res: Response): Promise<void> {
    try {
      const { customerId } = req.params;

      if (!customerId) {
        res.status(400).json({
          success: false,
          message: 'Customer ID is required'
        });
        return;
      }

      const result = await this.stripeCustomerService.getCustomer(customerId);
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(404).json(result);
      }
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error retrieving customer',
        error: error.message
      });
    }
  }

  async updateCustomer(req: Request, res: Response): Promise<void> {
    try {
      const { customerId } = req.params;
      const updateData = req.body;

      if (!customerId) {
        res.status(400).json({
          success: false,
          message: 'Customer ID is required'
        });
        return;
      }

      const result = await this.stripeCustomerService.updateCustomer(customerId, updateData);
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error updating customer',
        error: error.message
      });
    }
  }

  async deleteCustomer(req: Request, res: Response): Promise<void> {
    try {
      const { customerId } = req.params;

      if (!customerId) {
        res.status(400).json({
          success: false,
          message: 'Customer ID is required'
        });
        return;
      }

      const result = await this.stripeCustomerService.deleteCustomer(customerId);
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error deleting customer',
        error: error.message
      });
    }
  }
}
