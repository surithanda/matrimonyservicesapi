import crypto from "crypto";
import {
  IStripeBody,
} from "../interfaces/stripe.interface";
import Stripe from "stripe";
import pool from "../config/database";
let stripeKey = process.env.STRIPE_SECRET_KEY as string;
let webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

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

      if (session && session.id) {
        const query = `
          CALL eb_payment_create(
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
          )
        `;
        console.log("payment data", paymentData);
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

  /**
   * Retrieve a Checkout session from Stripe and — if paid — update the DB.
   *
   * WHY: In local dev the Stripe webhook cannot reach localhost, so
   * eb_payment_update_status is never called via the webhook path.
   * This method acts as a fallback: when the frontend calls /stripe/verify-session
   * after a successful redirect, we update the DB directly using the session_id.
   *
   * In production the webhook fires first (and is faster), but calling this
   * endpoint is still safe — the stored procedure is idempotent.
   */
  async retrieveSession(sessionId: string): Promise<{
    id: string;
    payment_status: Stripe.Checkout.Session.PaymentStatus | null;
    customer_email: string | null;
    amount_total: number | null;
  }> {
    try {
      const session = await this.stripe.checkout.sessions.retrieve(sessionId);

      // If Stripe confirms the payment is paid, update the DB immediately.
      // This is the fallback for when the webhook hasn't fired yet (local dev).
      if (session.payment_status === "paid") {
        try {
          const [res] = await pool.execute(
            `CALL eb_payment_update_status(?, ?, ?)`,
            [session.client_reference_id, "paid", "verify-session"]
          );
          const extractedResponse = (res as any[])[0][0];
          console.log("verify-session DB update:", extractedResponse);
        } catch (dbErr) {
          // Log but don't throw — we still return the Stripe status to the frontend
          console.error("verify-session: DB update failed:", dbErr);
        }
      }

      return {
        id: session.id,
        payment_status: session.payment_status,
        customer_email: session.customer_email,
        amount_total: session.amount_total,
      };
    } catch (error) {
      console.error("Error retrieving Stripe session:", error);
      throw error;
    }
  }

  async handleWebhookEvent(request: any) {
    let event: any;
    let signature = request.headers["stripe-signature"];
    let payload = request.body;

    if (!signature) {
      throw new Error("Signature is required");
    }

    if (!payload) {
      throw new Error("Payload is required");
    }

    if (!webhookSecret) {
      throw new Error("Webhook Secret is required");
    }

    event = this.stripe.webhooks.constructEvent(
      payload,
      signature,
      webhookSecret
    );

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

        case "checkout.session.async_payment_succeeded": {
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
        case "checkout.session.async_payment_failed": {
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