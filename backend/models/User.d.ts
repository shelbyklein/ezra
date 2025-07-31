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
export declare class UserModel {
    static create(userData: UserCreateInput): Promise<User>;
    static findById(id: number): Promise<User | null>;
    static findByEmail(email: string): Promise<User | null>;
    static findByUsername(username: string): Promise<User | null>;
    static verifyPassword(user: User, password: string): Promise<boolean>;
    static update(id: number, data: Partial<User>): Promise<User>;
    static getAllUsers(): Promise<User[]>;
    static generateResetToken(email: string): Promise<string | null>;
    static resetPasswordWithToken(token: string, newPassword: string): Promise<boolean>;
}
//# sourceMappingURL=User.d.ts.map