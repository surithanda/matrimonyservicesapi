import crypto from "crypto";
import {
  IPaymentCreateResult,
  IStripeBody,
} from "../interfaces/stripe.interface";
import Stripe from "stripe";
let stripeKey = process.env.STRIPE_SECRET_KEY as string;
import pool from "../config/database";

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

      // IN p_account_id INT,
      // IN p_client_reference_id VARCHAR(100),
      // IN p_session_id VARCHAR(100),
      // IN p_email VARCHAR(100),
      // IN p_name VARCHAR(100),
      // IN p_address VARCHAR(256),
      // IN p_country VARCHAR(100),
      // IN p_state VARCHAR(100),
      // IN p_city VARCHAR(100),
      // IN p_zip_code VARCHAR(100),
      // IN p_amount DECIMAL(10,2),
      // IN p_currency VARCHAR(10),
      // IN p_payment_status VARCHAR(50),
      // IN p_payment_mode VARCHAR(50),
      // IN p_created_user VARCHAR(45)
      if (session && session.id) {
        const query = `
          CALL eb_payment_create(
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
          )
        `;
        console.log("payment data",paymentData)
        const params = [
          paymentData.account_id,
          referenceId,
          session.id,
          paymentData.email || null,
          paymentData.name || null,
          paymentData.address || null,
          paymentData.country || null,
          paymentData.state || null,
          paymentData.city || null,
          paymentData.zip_code || null,
          paymentData.amount,
          paymentData.currency,
          session.payment_status || "unpaid",
          session.payment_method_types[0] || "card",
          paymentData.name,
        ];

        const [result]: any = await pool.execute(query, params);

        console.log("result from the database", result);

        const extractedResponse = (result as any[])[0][0];
        if (extractedResponse && extractedResponse.status !== "success") {
          throw new Error(
            extractedResponse.error_message || "Error While Creating payment"
          );
        }

        return session;
      }
    } catch (error) {
      console.error("Error Creating a Checkout session : ", error);
      throw error;
    }
  }

  async handleWebhookEvent(event: any) {
    if (!event || !event.type) {
      throw new Error("Event or Event Type is required");
    }
    const client_reference_id = event.data.object.client_reference_id;
    try {
      let response: any = null;

      switch (event.type) {
        case "checkout.session.completed": {
          console.log("Payment Success:", {
            client_reference_id,
            status: "Success",
          });

          const [res] = await pool.execute(
            `CALL eb_payment_update_status(?, ?,?)`,
            [client_reference_id, "paid", "webhook"]
          );

          console.log("database result", res);
          const extractedResponse = (res as any[])[0][0];
          response = {
            status: extractedResponse?.status || "success",
          };
          break;
        }

        case "checkout.session.expired": {
          console.log("Payment Failed/Expired:", {
            client_reference_id,
            status: "Failed",
          });

          const [res] = await pool.execute(
            `CALL eb_payment_update_status(?, ?,?)`,
            [client_reference_id, "failed", "webhook"]
          );

          console.log("database result", res);

          const extractedResponse = (res as any[])[0][0];
          response = {
            status: extractedResponse?.status || "failed",
          };
          break;
        }

        default:
          console.log("Unhandled webhook event type:", event.type);
          throw new Error(`Unhandled webhook Event: ${event.type}`);
      }

      return response;
    } catch (error) {
      console.error("Error updating the payment status", error);
      throw error;
    }
  }
}
