export interface IAccount {
  account_code: string;
  email: string;
  password: string;
  primary_phone: string;
  primary_phone_country: string;
  primary_phone_type: string;
  secondary_phone?: string;
  secondary_phone_country?: string;
  secondary_phone_type?: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  birth_date: string;
  gender: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  photo?: string;
  secret_question?: string;
  secret_answer?: string;
  // driving_license?: string;
  is_active?: boolean;
} 