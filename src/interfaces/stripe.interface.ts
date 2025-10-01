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
  account_id?: number;
  created_user:string
}

export interface IStripeResponse {
  session_id: string;
  url: string | null;
}
export interface IPaymentCreateResult {
  status: "success" | "fail";      
  payment_id?: number;              
  error_type?: string | null;       
  error_code?: string | null;       
  error_message?: string | null;   
}

