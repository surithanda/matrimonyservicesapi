export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user?: {
    account_code: string;
    email: string;
    first_name: string;
    last_name: string;
  };
}

export interface User {
  id: number;
  email: string;
  password: string;
  [key: string]: any;
} 