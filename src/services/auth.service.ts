import bcrypt from 'bcrypt';
import { LoginCredentials, LoginResponse } from '../interfaces/auth.interface';
import { AuthRepository } from '../repositories/auth.repository';

export class AuthService {
  private authRepository: AuthRepository;

  constructor() {
    this.authRepository = new AuthRepository();
  }

  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const user = await this.authRepository.findUserByEmail(credentials.email);

    if (!user) {
      return {
        success: false,
        message: 'Invalid email or password'
      };
    }

    const validPassword = await bcrypt.compare(credentials.password, user.password);

    if (!validPassword) {
      return {
        success: false,
        message: 'Invalid email or password'
      };
    }

    return {
      success: true,
      message: 'Login successful',
      user: {
        account_code: user.account_code,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name
      }
    };
  }
} 