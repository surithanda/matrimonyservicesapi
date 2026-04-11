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
  created_user: string;
  // AI Search credit pack metadata
  purchase_type?: 'membership' | 'ai_credits' | 'donation';
  credits?: number;  // number of credits in the pack (50, 250, 1000)
}

export interface IStripeResponse {
  session_id: string;
  url: string | null;
}
export interface IPaymentHistoryItem {
  id: number;
  name: string | null;
  amount: number;
  currency: string;
  payment_status: string | null;
  created_at: string;
  // Derived on the frontend for display purposes
  purchase_type?: 'membership' | 'ai_credits' | 'donation';
}

export interface IPaymentCreateResult {
  status: "success" | "fail";      
  payment_id?: number;              
  error_type?: string | null;       
  error_code?: string | null;       
  error_message?: string | null;   
}

