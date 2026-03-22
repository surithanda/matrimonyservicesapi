import Stripe from "stripe";
import { IStripeBody, IStripeResponse, IPaymentHistoryItem } from "../interfaces/stripe.interface";
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

  async verifySession(sessionId: string): Promise<{
    success: boolean;
    verified: boolean;
    payment_status: string | null;
    message: string;
  }> {
    try {
      const result = await this.stripeRepository.retrieveSession(sessionId);
      return {
        success: true,
        verified: result.payment_status === "paid",
        payment_status: result.payment_status,
        message: result.payment_status === "paid"
          ? "Payment verified successfully"
          : "Payment not yet completed",
      };
    } catch (error: any) {
      return {
        success: false,
        verified: false,
        payment_status: null,
        message: error.message || "Failed to verify payment session",
      };
    }
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

  async getPaymentHistory(accountId: number): Promise<{
    success: boolean;
    data: IPaymentHistoryItem[];
    message: string;
  }> {
    try {
      const history = await this.stripeRepository.getPaymentHistory(accountId);
      return {
        success: true,
        data: history,
        message: "Payment history retrieved successfully",
      };
    } catch (error: any) {
      return {
        success: false,
        data: [],
        message: error.message || "Failed to retrieve payment history",
      };
    }
  }
}
