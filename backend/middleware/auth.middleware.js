"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
exports.optionalAuth = optionalAuth;
const jwt_1 = require("../utils/jwt");
function authenticate(req, res, next) {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'NO_TOKEN',
                    message: 'No authentication token provided'
                }
            });
        }
        // Extract token
        const token = authHeader.substring(7);
        // Verify token
        try {
            const decoded = (0, jwt_1.verifyToken)(token);
            req.user = decoded;
            next();
        }
        catch (error) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'INVALID_TOKEN',
                    message: 'Invalid or expired token'
                }
            });
        }
    }
    catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'AUTH_ERROR',
                message: 'Authentication error'
            }
        });
    }
}
// Optional auth middleware - doesn't require token but adds user if present
function optionalAuth(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            try {
                const decoded = (0, jwt_1.verifyToken)(token);
                req.user = decoded;
            }
            catch {
                // Token invalid but that's okay for optional auth
            }
        }
        next();
    }
    catch (error) {
        next();
    }
}
// Default export
exports.default = authenticate;
//# sourceMappingURL=auth.middleware.js.map