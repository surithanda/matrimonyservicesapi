export interface LoginCredentials {
  email: string;
  password: string;
}

export interface User {
  login_id: number;
  account_code: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone: string;
  date_of_birth: string;
  age: number;
  address: string;
  city: string;
  state: string;
  country: string;
  zip_code: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user?: {
    history_id: number;
    login_id?: number;
    account_code: string;
    email: string;
    first_name: string;
    last_name: string;
  };
}

export interface OTPVerificationResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: {
    full_name: string;
    email: string;
    phone: string;
    date_of_birth: string;
    age: number;
    address: string;
    city: string;
    state: string;
    country: string;
    zip_code: string;
    account_code: string;
  };
}

export interface VerifyOTPResult {
  success: boolean;
  message?: string;
  user?: {
    login_id: number;
    account_code: string;
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone: string;
    date_of_birth: string;
    age: number;
    address: string;
    city: string;
    state: string;
    country: string;
    zip_code: string;
  };
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
  confirm_new_password: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
} 