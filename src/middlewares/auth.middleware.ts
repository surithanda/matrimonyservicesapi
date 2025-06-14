import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    role: string;
    subscription?: {
      planId: string;
      status: string;
    };
  };
}

export const authenticateJWT = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: 'Authorization header is missing'
    });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Token is missing'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'Abhishek@123') as {
      email: string;
      iat: number;
      exp: number;
      account_code: string;
      account_id: number;
    };

    req.user = {
      account_code: decoded.account_code,
      account_id: decoded.account_id,
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