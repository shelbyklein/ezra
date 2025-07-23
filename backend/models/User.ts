// User model and database operations
import db from '../src/db';
import bcrypt from 'bcrypt';

export interface User {
  id?: number;
  email: string;
  username: string;
  password_hash?: string;
  full_name?: string;
  avatar_url?: string;
  is_active?: boolean;
  api_key?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface UserCreateInput {
  email: string;
  username: string;
  password: string;
  full_name?: string;
}

export class UserModel {
  static async create(userData: UserCreateInput): Promise<User> {
    const { password, ...data } = userData;
    const password_hash = await bcrypt.hash(password, 10);
    
    const [user] = await db('users')
      .insert({ ...data, password_hash })
      .returning('*');
    
    delete user.password_hash;
    return user;
  }

  static async findById(id: number): Promise<User | null> {
    const user = await db('users')
      .where({ id })
      .first();
    
    if (user) {
      delete user.password_hash;
    }
    return user || null;
  }

  static async findByEmail(email: string): Promise<User | null> {
    return db('users')
      .where({ email })
      .first();
  }

  static async findByUsername(username: string): Promise<User | null> {
    return db('users')
      .where({ username })
      .first();
  }

  static async verifyPassword(user: User, password: string): Promise<boolean> {
    if (!user.password_hash) return false;
    return bcrypt.compare(password, user.password_hash);
  }

  static async update(id: number, data: Partial<User>): Promise<User> {
    const [updatedUser] = await db('users')
      .where({ id })
      .update(data)
      .returning('*');
    
    delete updatedUser.password_hash;
    return updatedUser;
  }
}