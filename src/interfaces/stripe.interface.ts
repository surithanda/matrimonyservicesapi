export interface IStripeBody {
  name: string;
  address: string;
  country: string;
  state: string;
  city: string;
  zip_code: string;
  amount: number;
  plan: string;
  front_end_success_uri: string;
  front_end_failed_uri: string;
  currency: string;
  email?: string;
}

export interface IStripeResponse {
  session_id: string;
  url: string | null;
}
