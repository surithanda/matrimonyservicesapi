import { Request, Response } from 'express';
import { StripePaymentService } from '../../services/stripe/payment.service';

export class StripePaymentController {
  private stripePaymentService: StripePaymentService;

  constructor() {
    this.stripePaymentService = new StripePaymentService();
  }

  async createPaymentIntent(req: Request, res: Response): Promise<void> {
    try {
      const paymentData = req.body;

      if (!paymentData.amount || !paymentData.currency) {
        res.status(400).json({
          success: false,
          message: 'Amount and currency are required'
        });
        return;
      }

      const result = await this.stripePaymentService.createPaymentIntent(paymentData);
      
      if (result.success) {
        res.status(201).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error creating payment intent',
        error: error.message
      });
    }
  }

  async getPaymentIntent(req: Request, res: Response): Promise<void> {
    try {
      const { paymentIntentId } = req.params;

      if (!paymentIntentId) {
        res.status(400).json({
          success: false,
          message: 'Payment Intent ID is required'
        });
        return;
      }

      const result = await this.stripePaymentService.getPaymentIntent(paymentIntentId);
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(404).json(result);
      }
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error retrieving payment intent',
        error: error.message
      });
    }
  }

  async confirmPaymentIntent(req: Request, res: Response): Promise<void> {
    try {
      const { paymentIntentId } = req.params;
      const { paymentMethodId } = req.body;

      if (!paymentIntentId) {
        res.status(400).json({
          success: false,
          message: 'Payment Intent ID is required'
        });
        return;
      }

      const result = await this.stripePaymentService.confirmPaymentIntent(paymentIntentId, paymentMethodId);
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error confirming payment intent',
        error: error.message
      });
    }
  }

  async cancelPaymentIntent(req: Request, res: Response): Promise<void> {
    try {
      const { paymentIntentId } = req.params;
      const { cancellationReason } = req.body;

      if (!paymentIntentId) {
        res.status(400).json({
          success: false,
          message: 'Payment Intent ID is required'
        });
        return;
      }

      const result = await this.stripePaymentService.cancelPaymentIntent(paymentIntentId, cancellationReason);
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error canceling payment intent',
        error: error.message
      });
    }
  }

  async capturePaymentIntent(req: Request, res: Response): Promise<void> {
    try {
      const { paymentIntentId } = req.params;
      const { amountToCapture } = req.body;

      if (!paymentIntentId) {
        res.status(400).json({
          success: false,
          message: 'Payment Intent ID is required'
        });
        return;
      }

      const result = await this.stripePaymentService.capturePaymentIntent(paymentIntentId, amountToCapture);
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error capturing payment intent',
        error: error.message
      });
    }
  }

  async getCharge(req: Request, res: Response): Promise<void> {
    try {
      const { chargeId } = req.params;

      if (!chargeId) {
        res.status(400).json({
          success: false,
          message: 'Charge ID is required'
        });
        return;
      }

      const result = await this.stripePaymentService.getCharge(chargeId);
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(404).json(result);
      }
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error retrieving charge',
        error: error.message
      });
    }
  }

  async listChargesByCustomer(req: Request, res: Response): Promise<void> {
    try {
      const { customerId } = req.params;

      if (!customerId) {
        res.status(400).json({
          success: false,
          message: 'Customer ID is required'
        });
        return;
      }

      const result = await this.stripePaymentService.listChargesByCustomer(customerId);
      
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error listing charges',
        error: error.message
      });
    }
  }
}
