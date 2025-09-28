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
    let session = await this.stripeRepository.createCheckoutSession(data);
    return {
      success: true,
      message: "Session Created Successfully",
      data: {
        session_id: session.id,
        url:session.url
      },
    };
  }
}
