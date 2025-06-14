/**
 * =================================
 * ERROR HANDLER MIDDLEWARE
 * Global error handling with proper logging and responses
 * =================================
 */

import { Request, Response, NextFunction } from 'express';
import { PrismaClientKnownRequestError, PrismaClientValidationError } from '@prisma/client/runtime/library';
import { ZodError } from 'zod';
import { logger, logError, logSecurity } from '@/config/logger.config';
import { isDevelopment } from '@/config/app.config';

// Custom error types
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly errorCode?: string;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    errorCode?: string
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errorCode = errorCode;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, field?: string) {
    super(message, 400, true, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401, true, 'AUTHENTICATION_ERROR');
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied') {
    super(message, 403, true, 'AUTHORIZATION_ERROR');
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, true, 'NOT_FOUND_ERROR');
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource already exists') {
    super(message, 409, true, 'CONFLICT_ERROR');
    this.name = 'ConflictError';
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 429, true, 'RATE_LIMIT_ERROR');
    this.name = 'RateLimitError';
  }
}

// Error response interface
interface ErrorResponse {
  success: false;
  error: string;
  message: string;
  statusCode: number;
  timestamp: string;
  requestId?: string;
  details?: any;
  stack?: string;
}

/**
 * Handle Prisma errors
 */
const handlePrismaError = (error: any): AppError => {
  if (error instanceof PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        return new ConflictError(`Duplicate entry for ${error.meta?.target || 'field'}`);
      case 'P2025':
        return new NotFoundError('Record not found');
      case 'P2003':
        return new ValidationError('Foreign key constraint failed');
      case 'P2011':
        return new ValidationError('Null constraint violation');
      case 'P2012':
        return new ValidationError('Missing required value');
      case 'P2013':
        return new ValidationError('Missing required argument');
      case 'P2014':
        return new ValidationError('Invalid relation');
      default:
        return new AppError(`Database error: ${error.message}`, 500, true, 'DATABASE_ERROR');
    }
  }

  if (error instanceof PrismaClientValidationError) {
    return new ValidationError('Invalid data provided');
  }

  return new AppError('Database error occurred', 500, true, 'DATABASE_ERROR');
};

/**
 * Handle Zod validation errors
 */
const handleZodError = (error: ZodError): ValidationError => {
  const errors = error.errors.map(err => ({
    field: err.path.join('.'),
    message: err.message,
    code: err.code,
  }));

  const message = `Validation failed: ${errors.map(e => `${e.field}: ${e.message}`).join(', ')}`;
  const validationError = new ValidationError(message);
  (validationError as any).details = errors;
  
  return validationError;
};

/**
 * Handle JWT errors
 */
const handleJWTError = (error: any): AppError => {
  if (error.name === 'JsonWebTokenError') {
    return new AuthenticationError('Invalid token');
  }
  if (error.name === 'TokenExpiredError') {
    return new AuthenticationError('Token expired');
  }
  if (error.name === 'NotBeforeError') {
    return new AuthenticationError('Token not active');
  }
  
  return new AuthenticationError('Authentication failed');
};

/**
 * Determine if error should be logged as security incident
 */
const isSecurityRelated = (error: any, req: Request): boolean => {
  // Authentication/Authorization errors
  if (error instanceof AuthenticationError || error instanceof AuthorizationError) {
    return true;
  }

  // Multiple failed login attempts
  if (error.message?.toLowerCase().includes('login') && error.statusCode === 401) {
    return true;
  }

  // SQL injection attempts (basic detection)
  const suspiciousPatterns = [
    /union\s+select/i,
    /drop\s+table/i,
    /delete\s+from/i,
    /insert\s+into/i,
    /update\s+set/i,
    /';\s*drop/i,
    /or\s+1=1/i,
  ];

  const requestStr = JSON.stringify(req.body) + JSON.stringify(req.query) + req.url;
  
  return suspiciousPatterns.some(pattern => pattern.test(requestStr));
};

/**
 * Main error handler middleware
 */
export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let appError: AppError;

  // Handle known error types
  if (error instanceof AppError) {
    appError = error;
  } else if (error.name === 'PrismaClientKnownRequestError' || error.name === 'PrismaClientValidationError') {
    appError = handlePrismaError(error);
  } else if (error instanceof ZodError) {
    appError = handleZodError(error);
  } else if (error.name?.includes('JsonWebToken') || error.name?.includes('Token')) {
    appError = handleJWTError(error);
  } else if (error.name === 'MulterError') {
    appError = new ValidationError(`File upload error: ${error.message}`);
  } else if (error.code === 'ENOENT') {
    appError = new NotFoundError('File not found');
  } else if (error.code === 'EACCES') {
    appError = new AuthorizationError('Access denied');
  } else {
    // Unknown error
    appError = new AppError(
      isDevelopment() ? error.message : 'Internal server error',
      500,
      false,
      'INTERNAL_ERROR'
    );
  }

  // Log error with appropriate level
  const logContext = {
    requestId: req.requestId,
    method: req.method,
    url: req.url,
    statusCode: appError.statusCode,
    errorCode: appError.errorCode,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    userId: (req as any).user?.id,
    timestamp: new Date().toISOString(),
  };

  if (appError.statusCode >= 500) {
    logError(appError, logContext);
  } else if (appError.statusCode >= 400) {
    logger.warn(`Client error: ${appError.message}`, logContext);
  }

  // Log security incidents
  if (isSecurityRelated(appError, req)) {
    const severity = appError.statusCode === 401 ? 'medium' : 'high';
    logSecurity(`Security incident: ${appError.message}`, severity, logContext);
  }

  // Build error response
  const errorResponse: ErrorResponse = {
    success: false,
    error: appError.errorCode || 'ERROR',
    message: appError.message,
    statusCode: appError.statusCode,
    timestamp: new Date().toISOString(),
    requestId: req.requestId,
  };

  // Add details for validation errors
  if (appError instanceof ValidationError && (appError as any).details) {
    errorResponse.details = (appError as any).details;
  }

  // Add stack trace in development
  if (isDevelopment() && appError.stack) {
    errorResponse.stack = appError.stack;
  }

  // Send error response
  res.status(appError.statusCode).json(errorResponse);
};

/**
 * Async error wrapper
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * 404 handler
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error = new NotFoundError(`Route ${req.method} ${req.originalUrl} not found`);
  next(error);
}; 