import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';

// Custom error class with status code
export class AppError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let message = 'Something went wrong';
  let errorDetails = null;

  // Log the error
  logger.error('Error occurred:', {
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name
    },
    request: {
      method: req.method,
      url: req.url,
      body: req.body,
      headers: req.headers,
      ip: req.ip
    },
    timestamp: new Date().toISOString()
  });

  // Handle custom AppError
  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
  }

  // Handle Mongoose validation errors
  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Invalid input data';
    errorDetails = error.message;
  }

  // Handle Mongoose duplicate key errors
  if (error.name === 'MongoError' && (error as any).code === 11000) {
    statusCode = 400;
    message = 'Duplicate field value';
    errorDetails = error.message;
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token. Please log in again.';
  }

  if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Your token has expired. Please log in again.';
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    status: statusCode >= 500 ? 'error' : 'fail',
    message,
    ...(process.env.NODE_ENV === 'development' && { 
      error: {
        details: errorDetails || error.message,
        stack: error.stack
      }
    }),
    timestamp: new Date().toISOString()
  });
}; 