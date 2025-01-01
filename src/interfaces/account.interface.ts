export interface IAccount {
  account_code: string;
  email: string;
  primary_phone: string;
  primary_phone_country: string;
  primary_phone_type: number;
  secondary_phone?: string;
  secondary_phone_country?: string;
  secondary_phone_type?: number;
  first_name: string;
  last_name: string;
  middle_name?: string;
  birth_date: Date;
  gender: number;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  photo?: string;
  secret_question?: string;
  secret_answer?: string;
  driving_license?: string;
} 