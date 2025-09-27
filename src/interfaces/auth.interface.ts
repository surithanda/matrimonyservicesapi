import { Request } from 'express';

export interface LoginCredentials {
  email: string;
  password: string;
  clientInfo: {
    ipAddress: string;
    userAgent: string;
    systemName: string;
    location: string;
  };
}

export interface User {
  account_id: string;
  account_code: string;
  email: string;
  login_id?: number;
  password?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  date_of_birth?: string;
  age?: number;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zip_code?: string;

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
    account_id: number;
  };
}

export interface VerifyOTPResult {
  success: boolean;
  message?: string;
  user: User;
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

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
  history_id?: number;
}

export interface ResetPasswordRequest {
  history_id: number;
  otp: string;
  new_password: string;
  confirm_new_password: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

export interface AuthenticatedRequest extends Request {
  user?: {
    account_code: string;
    email: string;
    first_name: string;
    last_name: string;
    account_id: number;
  };
} 