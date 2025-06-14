/**
 * =================================
 * AUTHENTICATION MIDDLEWARE
 * API key validation and JWT authentication
 * =================================
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '@/config/app.config';
import { AuthenticationError, AuthorizationError } from './error-handler.middleware';
import { logSecurity } from '@/config/logger.config';
import prisma from '@/config/database.config';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
        subscription?: {
          planId: string;
          status: string;
        };
      };
      apiKey?: string;
    }
  }
}

/**
 * Validate API Key
 */
export const validateApiKey = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.header('X-API-Key') || req.query.api_key as string;

  if (!apiKey) {
    return next(new AuthenticationError('API key is required'));
  }

  // Check against configured API keys
  const validApiKeys = [config.API_KEY];
  if (config.MASTER_API_KEY) {
    validApiKeys.push(config.MASTER_API_KEY);
  }

  if (!validApiKeys.includes(apiKey)) {
    logSecurity('Invalid API key used', 'high', {
      apiKey: apiKey.substring(0, 8) + '***',
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.originalUrl,
    });
    
    return next(new AuthenticationError('Invalid API key'));
  }

  req.apiKey = apiKey;
  next();
};

/**
 * Verify JWT Token
 */
export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new AuthenticationError('Bearer token is required'));
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify JWT token
    const decoded = jwt.verify(token, config.JWT_SECRET) as any;

    if (!decoded || !decoded.id) {
      return next(new AuthenticationError('Invalid token payload'));
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        subscription: {
          include: {
            plan: true,
          },
        },
      },
    });

    if (!user) {
      return next(new AuthenticationError('User not found'));
    }

    // Check if user account is active
    if (user.deletedAt) {
      return next(new AuthenticationError('Account is deactivated'));
    }

    // Check for account lockout
    if (user.lockUntil && user.lockUntil > new Date()) {
      const lockDuration = Math.ceil((user.lockUntil.getTime() - Date.now()) / 1000 / 60);
      return next(new AuthenticationError(`Account is locked for ${lockDuration} minutes`));
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Set user in request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      subscription: user.subscription ? {
        planId: user.subscription.planId,
        status: user.subscription.status,
      } : undefined,
    };

    next();
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      return next(new AuthenticationError('Invalid token'));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new AuthenticationError('Token expired'));
    }
    if (error.name === 'NotBeforeError') {
      return next(new AuthenticationError('Token not active'));
    }
    
    return next(new AuthenticationError('Token verification failed'));
  }
};

/**
 * Optional authentication - doesn't fail if no token provided
 */
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // Continue without authentication
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, config.JWT_SECRET) as any;

    if (decoded && decoded.id) {
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        include: {
          subscription: {
            include: {
              plan: true,
            },
          },
        },
      });

      if (user && !user.deletedAt) {
        req.user = {
          id: user.id,
          email: user.email,
          role: user.role,
          subscription: user.subscription ? {
            planId: user.subscription.planId,
            status: user.subscription.status,
          } : undefined,
        };
      }
    }
  } catch (error) {
    // Ignore token errors for optional auth
  }

  next();
};

/**
 * Require specific role
 */
export const requireRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AuthenticationError('Authentication required'));
    }

    if (!roles.includes(req.user.role)) {
      logSecurity('Unauthorized role access attempt', 'medium', {
        userId: req.user.id,
        userRole: req.user.role,
        requiredRoles: roles,
        url: req.originalUrl,
        ip: req.ip,
      });
      
      return next(new AuthorizationError('Insufficient permissions'));
    }

    next();
  };
};

/**
 * Require admin role
 */
export const requireAdmin = requireRole('ADMIN');

/**
 * Require moderator or admin role
 */
export const requireModerator = requireRole('MODERATOR', 'ADMIN');

/**
 * Check if user owns resource or is admin
 */
export const requireOwnership = (getUserId: (req: Request) => string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AuthenticationError('Authentication required'));
    }

    const resourceUserId = getUserId(req);
    
    if (req.user.id !== resourceUserId && req.user.role !== 'ADMIN') {
      logSecurity('Unauthorized resource access attempt', 'medium', {
        userId: req.user.id,
        resourceUserId,
        url: req.originalUrl,
        ip: req.ip,
      });
      
      return next(new AuthorizationError('Access denied to this resource'));
    }

    next();
  };
};

/**
 * Check subscription status
 */
export const requireActiveSubscription = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new AuthenticationError('Authentication required'));
  }

  if (!req.user.subscription || req.user.subscription.status !== 'ACTIVE') {
    return next(new AuthorizationError('Active subscription required'));
  }

  next();
};

/**
 * Check premium subscription
 */
export const requirePremiumSubscription = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new AuthenticationError('Authentication required'));
  }

  if (!req.user.subscription || req.user.subscription.status !== 'ACTIVE') {
    return next(new AuthorizationError('Premium subscription required'));
  }

  // Check if it's a premium plan (you can adjust this logic based on your plan structure)
  const premiumPlans = ['premium', 'gold', 'platinum']; // Adjust based on your plan names
  
  // This is a simplified check - you might want to query the actual plan details
  if (!premiumPlans.some(plan => req.user!.subscription!.planId.toLowerCase().includes(plan))) {
    return next(new AuthorizationError('Premium subscription required'));
  }

  next();
}; 