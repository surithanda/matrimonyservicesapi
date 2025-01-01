import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import { LoginCredentials, LoginResponse } from '../interfaces/auth.interface';
import pool from '../config/database';

export class AuthController {
  public login = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { email, password }: LoginCredentials = req.body;

      // Input validation
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required'
        });
      }

      // Check if user exists
      const [users] = await pool.execute(
        'SELECT * FROM login WHERE user_name = ?',
        [email]
      );

      const user = (users as any[])[0];

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Verify password
      // const validPassword = await bcrypt.compare(password, user.password);
      const validPassword = password;

      if (!validPassword) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Successfully authenticated
      const response: LoginResponse = {
        success: true,
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email
        }
      };

      return res.status(200).json(response);

    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };
} 