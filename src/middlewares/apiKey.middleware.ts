import { Request, Response, NextFunction } from 'express';
import  pool  from '../config/database';

export const validateApiKey = async (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.header('X-API-Key');

  if (!apiKey) {
    return res.status(401).json({
      success: false,
      message: 'API key is missing'
    });
  }

  try {
    const connection = await pool.getConnection();
    
    try {
      const [clients] = await connection.execute(
        'SELECT * FROM api_clients WHERE api_key = ? AND is_active = true',
        [apiKey]
      );

      if (!Array.isArray(clients) || clients.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'Invalid API key'
        });
      }
      // Attach client info to request for later use if needed
      (req as any).clientId = (clients as any)[0].id;
      next();
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('API key validation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error validating API key'
    });
  }
}; 