/**
 * =================================
 * RATE LIMITING CONFIGURATION
 * API rate limiting with different tiers
 * =================================
 */

import { RateLimitRequestHandler, Options } from 'express-rate-limit';
import { config } from './app.config';

// Default rate limit configuration
export const rateLimitConfig: Partial<Options> = {
  windowMs: config.RATE_LIMIT_WINDOW_MS, // 15 minutes
  max: config.RATE_LIMIT_MAX_REQUESTS, // 100 requests per window
  message: {
    error: 'Too many requests',
    message: 'You have exceeded the rate limit. Please try again later.',
    retryAfter: Math.ceil(config.RATE_LIMIT_WINDOW_MS / 1000 / 60), // minutes
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  
  // Custom key generator (by IP and user agent)
  keyGenerator: (req) => {
    return `${req.ip}-${req.get('User-Agent')}`;
  },
  
  // Skip successful requests
  skipSuccessfulRequests: false,
  
  // Skip failed requests
  skipFailedRequests: false,
  
  // Custom handler for rate limit exceeded
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests from this IP, please try again later.',
      retryAfter: Math.ceil(config.RATE_LIMIT_WINDOW_MS / 1000 / 60),
    });
  },
};

// Strict rate limit for auth endpoints
export const authRateLimitConfig: Partial<Options> = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: {
    error: 'Too many authentication attempts',
    message: 'Too many authentication attempts from this IP, please try again after 15 minutes.',
    retryAfter: 15,
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'AUTH_RATE_LIMIT_EXCEEDED',
      message: 'Too many authentication attempts. Please try again in 15 minutes.',
      retryAfter: 15,
    });
  },
};

// Lenient rate limit for file uploads
export const uploadRateLimitConfig: Partial<Options> = {
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // 50 uploads per hour
  message: {
    error: 'Too many file uploads',
    message: 'Upload limit exceeded. Please try again in an hour.',
    retryAfter: 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'UPLOAD_RATE_LIMIT_EXCEEDED',
      message: 'Too many file uploads. Please try again in an hour.',
      retryAfter: 60,
    });
  },
};

// Premium user rate limit (higher limits)
export const premiumRateLimitConfig: Partial<Options> = {
  windowMs: config.RATE_LIMIT_WINDOW_MS, // 15 minutes
  max: 500, // 500 requests per window for premium users
  message: {
    error: 'Premium rate limit exceeded',
    message: 'Premium rate limit exceeded. Please try again later.',
    retryAfter: Math.ceil(config.RATE_LIMIT_WINDOW_MS / 1000 / 60),
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'PREMIUM_RATE_LIMIT_EXCEEDED',
      message: 'Premium rate limit exceeded. Please try again later.',
      retryAfter: Math.ceil(config.RATE_LIMIT_WINDOW_MS / 1000 / 60),
    });
  },
};

// Public endpoints rate limit (more lenient)
export const publicRateLimitConfig: Partial<Options> = {
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 requests per minute
  message: {
    error: 'Public API rate limit exceeded',
    message: 'Too many requests to public endpoints. Please try again in a minute.',
    retryAfter: 1,
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'PUBLIC_RATE_LIMIT_EXCEEDED',
      message: 'Too many requests to public endpoints. Please try again in a minute.',
      retryAfter: 1,
    });
  },
}; 