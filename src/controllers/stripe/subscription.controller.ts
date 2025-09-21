import { Request, Response } from 'express';
import { StripeSubscriptionService } from '../../services/stripe/subscription.service';

export class StripeSubscriptionController {
  private stripeSubscriptionService: StripeSubscriptionService;

  constructor() {
    this.stripeSubscriptionService = new StripeSubscriptionService();
  }

  async createSubscription(req: Request, res: Response): Promise<void> {
    try {
      const subscriptionData = req.body;

      if (!subscriptionData.customer || !subscriptionData.items || !Array.isArray(subscriptionData.items)) {
        res.status(400).json({
          success: false,
          message: 'Customer and items are required'
        });
        return;
      }

      const result = await this.stripeSubscriptionService.createSubscription(subscriptionData);
      
      if (result.success) {
        res.status(201).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error creating subscription',
        error: error.message
      });
    }
  }

  async getSubscription(req: Request, res: Response): Promise<void> {
    try {
      const { subscriptionId } = req.params;

      if (!subscriptionId) {
        res.status(400).json({
          success: false,
          message: 'Subscription ID is required'
        });
        return;
      }

      const result = await this.stripeSubscriptionService.getSubscription(subscriptionId);
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(404).json(result);
      }
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error retrieving subscription',
        error: error.message
      });
    }
  }

  async listSubscriptionsByCustomer(req: Request, res: Response): Promise<void> {
    try {
      const { customerId } = req.params;
      const { status } = req.query;

      if (!customerId) {
        res.status(400).json({
          success: false,
          message: 'Customer ID is required'
        });
        return;
      }

      const result = await this.stripeSubscriptionService.listSubscriptionsByCustomer(
        customerId, 
        status as string | undefined
      );
      
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error listing subscriptions',
        error: error.message
      });
    }
  }

  async updateSubscription(req: Request, res: Response): Promise<void> {
    try {
      const { subscriptionId } = req.params;
      const updateData = req.body;

      if (!subscriptionId) {
        res.status(400).json({
          success: false,
          message: 'Subscription ID is required'
        });
        return;
      }

      const result = await this.stripeSubscriptionService.updateSubscription(subscriptionId, updateData);
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error updating subscription',
        error: error.message
      });
    }
  }

  async cancelSubscription(req: Request, res: Response): Promise<void> {
    try {
      const { subscriptionId } = req.params;
      const { cancelAtPeriodEnd } = req.body;

      if (!subscriptionId) {
        res.status(400).json({
          success: false,
          message: 'Subscription ID is required'
        });
        return;
      }

      const result = await this.stripeSubscriptionService.cancelSubscription(
        subscriptionId, 
        !!cancelAtPeriodEnd
      );
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error canceling subscription',
        error: error.message
      });
    }
  }
}
