import Stripe from "stripe";
import { IStripeBody, IStripeResponse } from "../interfaces/stripe.interface";
import { StripeRepository } from "../repositories/stripe.repository";

export class StripeService {
  private stripeRepository;

  constructor() {
    this.stripeRepository = new StripeRepository();
  }

  async createSession(data: IStripeBody): Promise<{
    success: boolean;
    message: string;
    data?: IStripeResponse;
  }> {
    let session: any = await this.stripeRepository.createCheckoutSession(data);

    return {
      success: true,
      message: "Session Created Successfully",
      data: {
        session_id: session.id,
        url: session.url,
      },
    };
  }

  async handleWebhookEvent(data: any) {
    try {
      let res = await this.stripeRepository.handleWebhookEvent(data);
      if (res.status === "success") {
        return {
          success: true,
          message: "Payment success",
        };
      } else {
        return {
          success: true,
          message: "Payment Failed",
        };
      }
    } catch (error) {
      throw error;
    }
  }
}
