import { PrismaClient } from '../../generated/prisma';
import { User, CreateUserRequest } from '../entities/User';

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>
  create(user: CreateUserRequest): Promise<User>;
  findById(id: number): Promise<User | null>;
}

export class UserRepository implements IUserRepository {
  constructor(private prisma: PrismaClient) { }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email }
    })
    return user;
  }

  async create(userData: CreateUserRequest): Promise<User> {
    const user = await this.prisma.user.create({
      data: {
        email: userData.email,
        passwordHash: userData.password // 実際はハッシュ化済み
      }
    });
    return user;
  }

  async findById(id: number): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id }
    });
    return user;
  }
}