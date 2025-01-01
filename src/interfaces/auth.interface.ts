export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user?: {
    id: number;
    email: string;
    [key: string]: any; // For any additional user properties
  };
}

export interface User {
  id: number;
  email: string;
  password: string;
  [key: string]: any;
} 