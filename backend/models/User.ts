// User model and database operations
import db from '../src/db';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

export interface User {
  id?: number;
  email: string;
  username: string;
  password_hash?: string;
  full_name?: string;
  avatar_url?: string;
  is_active?: boolean;
  api_key?: string;
  reset_token?: string;
  reset_token_expires?: Date;
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

  static async getAllUsers(): Promise<User[]> {
    const users = await db('users')
      .select('*')
      .orderBy('created_at', 'desc');
    
    return users.map(user => {
      delete user.password_hash;
      delete user.api_key;
      return user;
    });
  }

  static async generateResetToken(email: string): Promise<string | null> {
    const user = await this.findByEmail(email);
    if (!user) return null;

    // Generate a secure random token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    
    // Token expires in 1 hour
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await db('users')
      .where({ id: user.id })
      .update({
        reset_token: hashedToken,
        reset_token_expires: expiresAt
      });

    return resetToken;
  }

  static async resetPasswordWithToken(token: string, newPassword: string): Promise<boolean> {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    
    const user = await db('users')
      .where('reset_token', hashedToken)
      .where('reset_token_expires', '>', new Date())
      .first();

    if (!user) return false;

    const password_hash = await bcrypt.hash(newPassword, 10);

    await db('users')
      .where({ id: user.id })
      .update({
        password_hash,
        reset_token: null,
        reset_token_expires: null
      });

    return true;
  }
}