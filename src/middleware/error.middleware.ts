import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
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

  res.status(500).json({
    success: false,
    message: 'Internal server error',
    errorCode: error.name,
    timestamp: new Date().toISOString()
  });
}; 