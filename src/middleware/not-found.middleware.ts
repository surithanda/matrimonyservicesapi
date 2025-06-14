/**
 * =================================
 * NOT FOUND MIDDLEWARE
 * Handle 404 errors for unmatched routes
 * =================================
 */

import { Request, Response, NextFunction } from 'express';
import { NotFoundError } from './error-handler.middleware';

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error = new NotFoundError(`Route ${req.method} ${req.originalUrl} not found`);
  next(error);
}; 