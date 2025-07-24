import { Request, Response, NextFunction } from 'express';
import { JWTPayload } from '../utils/jwt';
declare global {
    namespace Express {
        interface Request {
            user?: JWTPayload;
        }
    }
}
export declare function authenticate(req: Request, res: Response, next: NextFunction): Response<any, Record<string, any>> | undefined;
export declare function optionalAuth(req: Request, res: Response, next: NextFunction): void;
export default authenticate;
//# sourceMappingURL=auth.middleware.d.ts.map