import { Request, Response } from "express";
import { StripeService } from "../services/stripe.service";
import { AuthenticatedRequest } from "../interfaces/auth.interface";
import { IStripeBody } from "../interfaces/stripe.interface";

export const createCheckoutSession = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.body.amount || !req.body.currency) {
      return res.status(400).json({
        success: false,
        message: "Please provide amount and currency",
      });
    }

    let data: IStripeBody = {
      ...req.body,
      email: req.user?.email || null,
      account_id: req.user?.account_id,
      created_user: req.user?.first_name + " " + req.user?.last_name,
    };

    let stripeService = new StripeService();

    let sessiondata = await stripeService.createSession(data);

    console.log("sessiondata", sessiondata);
    if (!sessiondata) {
      return res.status(400).json({
        success: false,
        message: "Failed to create session",
      });
    }
    return res.status(201).json(sessiondata);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to create checkout session",
      error: error.message,
    });
  }
};

export const handleWebhookEvent = async (req: Request, res: Response) => {
  try {
    let data = req.body;
    let stripeService = new StripeService();
    let result = await stripeService.handleWebhookEvent(req);
    return res.status(200).json(result);
  } catch (error) {
    console.log("Webhook error", error);
    res.status(500).json({
      success: false,
      message: "Webhook failed",
    });
  }
};