import * as crypto from 'crypto';
import pool from '../config/database';

export const generateApiKey = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

export const createNewClient = async (clientName: string): Promise<string> => {
  const apiKey = generateApiKey();
  const connection = await pool.getConnection();
  
  try {
    await connection.execute(
      'INSERT INTO api_clients (client_name, api_key) VALUES (?, ?)',
      [clientName, apiKey]
    );
    
    return apiKey;
  } finally {
    connection.release();
  }
}; 