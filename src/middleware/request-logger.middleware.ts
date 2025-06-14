/**
 * =================================
 * REQUEST LOGGER MIDDLEWARE
 * HTTP request logging with performance tracking
 * =================================
 */

import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { httpLogger } from '@/config/logger.config';
import { isDevelopment } from '@/config/app.config';

// Extend Request interface to include custom properties
declare global {
  namespace Express {
    interface Request {
      requestId: string;
      startTime: number;
    }
  }
}

// Sensitive headers to mask in logs
const SENSITIVE_HEADERS = [
  'authorization',
  'x-api-key',
  'cookie',
  'x-auth-token',
  'x-access-token',
];

// Sensitive body fields to mask in logs
const SENSITIVE_BODY_FIELDS = [
  'password',
  'confirmPassword',
  'currentPassword',
  'newPassword',
  'token',
  'refreshToken',
  'apiKey',
  'secret',
];

/**
 * Mask sensitive data in objects
 */
const maskSensitiveData = (obj: any): any => {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(maskSensitiveData);
  }

  const masked = { ...obj };
  
  for (const key in masked) {
    if (SENSITIVE_BODY_FIELDS.some(field => 
      key.toLowerCase().includes(field.toLowerCase())
    )) {
      masked[key] = '***MASKED***';
    } else if (typeof masked[key] === 'object') {
      masked[key] = maskSensitiveData(masked[key]);
    }
  }

  return masked;
};

/**
 * Mask sensitive headers
 */
const maskSensitiveHeaders = (headers: any): any => {
  const masked = { ...headers };
  
  SENSITIVE_HEADERS.forEach(header => {
    if (masked[header]) {
      masked[header] = '***MASKED***';
    }
  });

  return masked;
};

/**
 * Get client IP address
 */
const getClientIP = (req: Request): string => {
  return (
    req.ip ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    'unknown'
  );
};

/**
 * Get user agent
 */
const getUserAgent = (req: Request): string => {
  return req.get('User-Agent') || 'unknown';
};

/**
 * Request logger middleware
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  // Generate unique request ID
  req.requestId = uuidv4();
  req.startTime = Date.now();

  // Get request information
  const clientIP = getClientIP(req);
  const userAgent = getUserAgent(req);
  const method = req.method;
  const url = req.originalUrl || req.url;
  const protocol = req.protocol;
  const httpVersion = req.httpVersion;

  // Log incoming request
  httpLogger.info('Incoming request', {
    requestId: req.requestId,
    method,
    url,
    protocol,
    httpVersion,
    clientIP,
    userAgent,
    headers: isDevelopment() ? maskSensitiveHeaders(req.headers) : undefined,
    body: isDevelopment() && req.body ? maskSensitiveData(req.body) : undefined,
    query: req.query,
    params: req.params,
    timestamp: new Date().toISOString(),
  });

  // Store original response methods
  const originalSend = res.send;
  const originalJson = res.json;

  // Track response data
  let responseBody: any;
  let responseSize = 0;

  // Override res.send to capture response
  res.send = function(data: any) {
    if (data && typeof data === 'string') {
      responseSize = Buffer.byteLength(data);
      if (isDevelopment()) {
        try {
          responseBody = JSON.parse(data);
        } catch {
          responseBody = data.substring(0, 1000); // Limit response body size in logs
        }
      }
    }
    return originalSend.call(this, data);
  };

  // Override res.json to capture response
  res.json = function(data: any) {
    if (data) {
      responseSize = Buffer.byteLength(JSON.stringify(data));
      if (isDevelopment()) {
        responseBody = maskSensitiveData(data);
      }
    }
    return originalJson.call(this, data);
  };

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - req.startTime;
    const statusCode = res.statusCode;
    const statusMessage = res.statusMessage;
    const contentLength = res.get('Content-Length') || responseSize;

    // Determine log level based on status code
    let logLevel: 'info' | 'warn' | 'error' = 'info';
    if (statusCode >= 400 && statusCode < 500) {
      logLevel = 'warn';
    } else if (statusCode >= 500) {
      logLevel = 'error';
    }

    // Log response
    httpLogger[logLevel]('Request completed', {
      requestId: req.requestId,
      method,
      url,
      statusCode,
      statusMessage,
      duration: `${duration}ms`,
      contentLength: contentLength ? `${contentLength} bytes` : undefined,
      clientIP,
      userAgent,
      responseBody: isDevelopment() ? responseBody : undefined,
      timestamp: new Date().toISOString(),
    });

    // Log slow requests (>2000ms)
    if (duration > 2000) {
      httpLogger.warn('Slow request detected', {
        requestId: req.requestId,
        method,
        url,
        duration: `${duration}ms`,
        statusCode,
        clientIP,
      });
    }
  });

  // Log request errors
  res.on('error', (err) => {
    httpLogger.error('Request error', {
      requestId: req.requestId,
      method,
      url,
      error: err.message,
      stack: err.stack,
      clientIP,
      userAgent,
      timestamp: new Date().toISOString(),
    });
  });

  next();
}; 