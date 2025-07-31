"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Authentication routes
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const User_1 = require("../models/User");
const jwt_1 = require("../utils/jwt");
const auth_middleware_1 = require("../middleware/auth.middleware");
const bcrypt_1 = __importDefault(require("bcrypt"));
const email_1 = require("../utils/email");
const router = (0, express_1.Router)();
// Validation middleware
const registerValidation = [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail(),
    (0, express_validator_1.body)('username').isLength({ min: 3, max: 20 }).trim(),
    (0, express_validator_1.body)('password').isLength({ min: 6 }),
    (0, express_validator_1.body)('full_name').optional().trim()
];
const loginValidation = [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail(),
    (0, express_validator_1.body)('password').notEmpty()
];
const resetPasswordValidation = [
    (0, express_validator_1.body)('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
];
const forgotPasswordValidation = [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail()
];
const resetWithTokenValidation = [
    (0, express_validator_1.body)('token').notEmpty(),
    (0, express_validator_1.body)('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
];
// Register endpoint
router.post('/register', registerValidation, async (req, res) => {
    try {
        // Check validation errors
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        const { email, username, password, full_name } = req.body;
        // Check if user already exists
        const existingEmail = await User_1.UserModel.findByEmail(email);
        if (existingEmail) {
            return res.status(409).json({
                success: false,
                error: {
                    code: 'EMAIL_EXISTS',
                    message: 'Email already registered'
                }
            });
        }
        const existingUsername = await User_1.UserModel.findByUsername(username);
        if (existingUsername) {
            return res.status(409).json({
                success: false,
                error: {
                    code: 'USERNAME_EXISTS',
                    message: 'Username already taken'
                }
            });
        }
        // Create new user
        const userData = {
            email,
            username,
            password,
            full_name
        };
        const user = await User_1.UserModel.create(userData);
        const token = (0, jwt_1.generateToken)(user);
        res.status(201).json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    username: user.username,
                    full_name: user.full_name
                },
                token
            }
        });
    }
    catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'REGISTRATION_FAILED',
                message: 'Failed to register user'
            }
        });
    }
});
// Login endpoint
router.post('/login', loginValidation, async (req, res) => {
    try {
        // Check validation errors
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        const { email, password } = req.body;
        // Find user by email
        const user = await User_1.UserModel.findByEmail(email);
        if (!user) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'INVALID_CREDENTIALS',
                    message: 'Invalid email or password'
                }
            });
        }
        // Verify password
        const isValidPassword = await User_1.UserModel.verifyPassword(user, password);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'INVALID_CREDENTIALS',
                    message: 'Invalid email or password'
                }
            });
        }
        // Check if user is active
        if (!user.is_active) {
            return res.status(403).json({
                success: false,
                error: {
                    code: 'ACCOUNT_INACTIVE',
                    message: 'Account is not active'
                }
            });
        }
        // Generate token
        const token = (0, jwt_1.generateToken)(user);
        res.json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    username: user.username,
                    full_name: user.full_name
                },
                token
            }
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'LOGIN_FAILED',
                message: 'Failed to login'
            }
        });
    }
});
// Reset password endpoint (requires authentication)
router.post('/reset-password', auth_middleware_1.authenticate, resetPasswordValidation, async (req, res) => {
    try {
        // Check validation errors
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        const { newPassword } = req.body;
        const userId = req.user.userId;
        // Hash the new password
        const password_hash = await bcrypt_1.default.hash(newPassword, 10);
        // Update user's password
        await User_1.UserModel.update(userId, { password_hash });
        res.json({
            success: true,
            message: 'Password updated successfully'
        });
    }
    catch (error) {
        console.error('Password reset error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'PASSWORD_RESET_FAILED',
                message: 'Failed to reset password'
            }
        });
    }
});
// Forgot password endpoint (no auth required)
router.post('/forgot-password', forgotPasswordValidation, async (req, res) => {
    try {
        // Check validation errors
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        const { email } = req.body;
        // Generate reset token
        const resetToken = await User_1.UserModel.generateResetToken(email);
        if (resetToken) {
            // Generate reset URL
            const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
            // Prepare email
            const emailOptions = (0, email_1.generatePasswordResetEmail)(resetUrl);
            emailOptions.to = email;
            try {
                // Send email (in development, this just logs)
                await (0, email_1.sendEmail)(emailOptions);
                console.log(`Password reset token for ${email}: ${resetToken}`);
            }
            catch (error) {
                console.error('Failed to send password reset email:', error);
            }
            // Return response
            res.json({
                success: true,
                message: 'If an account exists with this email, a password reset link has been sent.',
                // Remove this in production - only for development
                ...(process.env.NODE_ENV === 'development' && { resetToken })
            });
        }
        else {
            // Don't reveal whether the email exists or not
            res.json({
                success: true,
                message: 'If an account exists with this email, a password reset link has been sent.'
            });
        }
    }
    catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'FORGOT_PASSWORD_FAILED',
                message: 'Failed to process password reset request'
            }
        });
    }
});
// Reset password with token endpoint (no auth required)
router.post('/reset-password-token', resetWithTokenValidation, async (req, res) => {
    try {
        // Check validation errors
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        const { token, newPassword } = req.body;
        // Reset password using token
        const success = await User_1.UserModel.resetPasswordWithToken(token, newPassword);
        if (success) {
            res.json({
                success: true,
                message: 'Password has been reset successfully'
            });
        }
        else {
            res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_TOKEN',
                    message: 'Invalid or expired reset token'
                }
            });
        }
    }
    catch (error) {
        console.error('Reset password with token error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'RESET_PASSWORD_FAILED',
                message: 'Failed to reset password'
            }
        });
    }
});
// Debug endpoint to check environment
router.get('/debug-env', (req, res) => {
    res.json({
        NODE_ENV: process.env.NODE_ENV,
        ADMIN_SECRET_EXISTS: !!process.env.ADMIN_SECRET,
        ADMIN_SECRET_LENGTH: process.env.ADMIN_SECRET?.length || 0
    });
});
// Admin override endpoints (development only)
if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === undefined) {
    // Get list of all users (dev only)
    router.get('/users-list', async (req, res) => {
        try {
            // Check admin secret
            const adminSecret = req.headers['x-admin-secret'];
            if (adminSecret !== process.env.ADMIN_SECRET) {
                return res.status(401).json({
                    success: false,
                    error: {
                        code: 'UNAUTHORIZED',
                        message: 'Invalid admin secret'
                    }
                });
            }
            // Get all users
            const users = await User_1.UserModel.getAllUsers();
            res.json({
                success: true,
                data: {
                    users: users.map(user => ({
                        id: user.id,
                        email: user.email,
                        username: user.username,
                        full_name: user.full_name
                    }))
                }
            });
        }
        catch (error) {
            console.error('Users list error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'FETCH_FAILED',
                    message: 'Failed to fetch users'
                }
            });
        }
    });
    // Admin login as any user (dev only)
    router.post('/admin-login', async (req, res) => {
        try {
            // Check admin secret
            const adminSecret = req.headers['x-admin-secret'];
            if (adminSecret !== process.env.ADMIN_SECRET) {
                return res.status(401).json({
                    success: false,
                    error: {
                        code: 'UNAUTHORIZED',
                        message: 'Invalid admin secret'
                    }
                });
            }
            const { userId } = req.body;
            if (!userId) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'MISSING_USER_ID',
                        message: 'User ID is required'
                    }
                });
            }
            // Find user by ID
            const user = await User_1.UserModel.findById(userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    error: {
                        code: 'USER_NOT_FOUND',
                        message: 'User not found'
                    }
                });
            }
            // Generate token
            const token = (0, jwt_1.generateToken)(user);
            res.json({
                success: true,
                data: {
                    user: {
                        id: user.id,
                        email: user.email,
                        username: user.username,
                        full_name: user.full_name
                    },
                    token,
                    adminOverride: true
                }
            });
        }
        catch (error) {
            console.error('Admin login error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'ADMIN_LOGIN_FAILED',
                    message: 'Failed to login as user'
                }
            });
        }
    });
}
exports.default = router;
//# sourceMappingURL=auth.routes.js.map