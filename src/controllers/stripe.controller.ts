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
      return res
        .status(400)
        .json({
          success: false,
          message: "Please provide amount and currency",
        });
    }
    let data: IStripeBody = {
      ...req.body,
      email: req.user?.email || null,
    };

    let stripeService = new StripeService();

    let sessiondata = await stripeService.createSession(data);
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
    // console.log("webhook body", req.body);
    let data = req.body;
    if (data.type === "checkout.session.completed") {
      let client_reference_id = data.object.client_reference_id;
      console.log("Payment Success", {
        client_reference_id,
        status: "Success",
      });
      // TODO: Need to update the Payment Session status to Success
    }

    if (data.type === "checkout.session.expired") {
      let client_reference_id = data.object.client_reference_id;
      console.log("Payment Success", {
        client_reference_id,
        status: "Failed",
      });
      // TODO: Need to update the Payment Session status to Expired or Failed
    }
  } catch (error) {
    console.log("Webhook error", error);
    res.status(500).json({
      success: false,
      message: "Webhook failed",
    });
  }
};
