"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Authentication routes
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const User_1 = require("../models/User");
const jwt_1 = require("../utils/jwt");
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
exports.default = router;
//# sourceMappingURL=auth.routes.js.map