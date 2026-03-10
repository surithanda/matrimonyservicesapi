import rateLimit from 'express-rate-limit';

/**
 * General API rate limiter — 100 requests per 15 minutes per IP.
 * Apply to non-sensitive routes.
 */
export const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please try again later.',
  },
});

/**
 * Auth-specific rate limiter — 5 attempts per 15 minutes per IP.
 * Apply to: login, verify-otp, forgot-password, reset-password, resend-otp.
 * Prevents brute-force attacks on OTP (6-digit = 1M combos) and passwords.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // only count failed/error responses toward limit
  message: {
    success: false,
    message: 'Too many attempts. Please wait 15 minutes before trying again.',
  },
});
