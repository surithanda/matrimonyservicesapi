import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// S-1 Guard: fail fast at startup if JWT_SECRET is not configured.
// Without this, jwt.verify() would throw at request time with a cryptic error
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('[FATAL] JWT_SECRET environment variable is not set. Server cannot start securely.');
  process.exit(1);
}

interface AuthenticatedRequest extends Request {
  user?: {
    email: string;
    account_code: string;
    account_id: number;
    partner_id?: number;
    iat?: number;
    exp?: number;
  };
}

export const authenticateJWT = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {

  // Phase 3: Cookie-only auth. Bearer header fallback removed.
  // All clients use HttpOnly cookie set by backend on login.
  const token = req.cookies?.['matrimony-token'];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required: no token provided'
    });
  }


  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      email: string;
      iat: number;
      exp: number;
      account_code: string;
      account_id: number;
      partner_id?: number;
    };

    req.user = {
      account_code: decoded.account_code,
      account_id: decoded.account_id,
      partner_id: decoded.partner_id || 1, // default to 1 if missing for backwards compatibility
      email: decoded.email,
      iat: decoded.iat,
      exp: decoded.exp
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};
