import { User } from '../models/User';
export interface JWTPayload {
    userId: number;
    email: string;
    username: string;
}
export declare function generateToken(user: User): string;
export declare function verifyToken(token: string): JWTPayload;
export declare function decodeToken(token: string): JWTPayload | null;
//# sourceMappingURL=jwt.d.ts.map