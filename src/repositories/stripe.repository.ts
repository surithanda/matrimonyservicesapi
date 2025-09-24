import crypto from "crypto";
import { IStripeBody } from "../interfaces/stripe.interface";
import Stripe from "stripe";
let stripeKey = process.env.STRIPE_SECRET_KEY as string;

export class StripeRepository {
  private stripe;
  constructor() {
    this.stripe = new Stripe(stripeKey);
  }
  async createCheckoutSession(paymentData: IStripeBody) {
    try {
      let data = paymentData;
      let referenceId = crypto.randomBytes(32).toString("hex");
      //TODO: Need to create a Payment session in the database and then we need to send the client_reference_id
      //  payment status needs to pending - initially
      const session = await this.stripe.checkout.sessions.create({
        client_reference_id: referenceId,
        line_items: [
          {
            price_data: {
              currency: data.currency,
              product_data: {
                name: data.plan,
              },
              unit_amount: data.amount * 100,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        ...(data.email ? { customer_email: data.email } : {}),
        success_url: `${data.front_end_success_uri}`,
        cancel_url: `${data.front_end_failed_uri}`,
      });
      return session;
    } catch (error) {
      console.error("Error Creating a Checkout session : ", error);
      throw error;
    }
  }

  async handleWebhookEvent(data: any) {}
}
