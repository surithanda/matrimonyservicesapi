/**
 * =================================
 * CORS CONFIGURATION
 * Cross-Origin Resource Sharing settings
 * =================================
 */

import { CorsOptions } from 'cors';
import { config, getCorsOrigins, isDevelopment } from './app.config';

export const corsConfig: CorsOptions = {
  // Allowed origins
  origin: (origin, callback) => {
    const allowedOrigins = getCorsOrigins();
    
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) {
      return callback(null, true);
    }
    
    // In development, allow all origins
    if (isDevelopment()) {
      return callback(null, true);
    }
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Allow localhost for development
    if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
      return callback(null, true);
    }
    
    return callback(new Error('Not allowed by CORS'));
  },
  
  // Allowed methods
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  
  // Allowed headers
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-API-Key',
    'X-User-Agent',
    'X-Forwarded-For',
    'X-Real-IP',
  ],
  
  // Exposed headers
  exposedHeaders: [
    'X-Total-Count',
    'X-Page-Count',
    'X-Per-Page',
    'X-Rate-Limit-Limit',
    'X-Rate-Limit-Remaining',
    'X-Rate-Limit-Reset',
  ],
  
  // Allow credentials
  credentials: true,
  
  // Preflight cache duration (24 hours)
  maxAge: 86400,
  
  // Continue on preflight
  preflightContinue: false,
  
  // Successful preflight status
  optionsSuccessStatus: 204,
}; 