import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { IUserRepository, UserRepository } from '../repositories/UserRepository';
import { User, CreateUserRequest, LoginRequest, AuthResponse } from '../entities/User';

export class AuthUsecase {
  constructor(private userRepository: IUserRepository) { }

  async register(request: CreateUserRequest): Promise<AuthResponse> {
    // 既存ユーザーのチェック
    const existingUser = await this.userRepository.findByEmail(request.email);
    if (existingUser) {
      throw new Error('このメールアドレスは使用されています');
    }

    // パスワードハッシュ化
    const hashedPassword = await bcrypt.hash(request.password, 10);

    // ユーザー作成
    const user = await this.userRepository.create({
      email: request.email,
      password: hashedPassword
    });

    // JWT作成
    const token = this.generateToken(user.id);

    return {
      token,
      user: {
        id: user.id,
        email: user.email
      }
    };
  }

  async login(request: LoginRequest): Promise<AuthResponse> {
    // ユーザー存在確認
    const user = await this.userRepository.findByEmail(request.email);
    if (!user) {
      throw new Error('メールアドレスまたはパスワードが間違っています');
    }

    // パスワード検証
    const isPasswordValid = await bcrypt.compare(request.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('メールアドレスまたはパスワードが間違っています');
    }

    // JWT生成
    const token = this.generateToken(user.id);

    return {
      token,
      user: {
        id: user.id,
        email: user.email
      }
    };
  }

  async verifyToken(token: string): Promise<User | null> {
    try {
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        throw new Error('JWT_SECRET is not defined');
      }

      const decoded = jwt.verify(token, secret) as { userId: number };
      const user = await this.userRepository.findById(decoded.userId);
      return user;
    } catch (error) {
      return null;
    };
  }

  private generateToken(userId: number): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not defined');
    }

    return jwt.sign(
      { userId },
      secret,
      { expiresIn: '24h' }
    );
  }
}