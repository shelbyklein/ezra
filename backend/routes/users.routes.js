"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = __importDefault(require("../middleware/auth.middleware"));
const crypto = __importStar(require("crypto"));
const db_1 = __importDefault(require("../src/db"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const router = (0, express_1.Router)();
// Create avatars directory if it doesn't exist
const avatarsDir = path_1.default.join(__dirname, '../../uploads/avatars');
if (!fs_1.default.existsSync(avatarsDir)) {
    fs_1.default.mkdirSync(avatarsDir, { recursive: true });
}
// Configure multer for avatar uploads
const avatarStorage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, avatarsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path_1.default.extname(file.originalname);
        cb(null, `avatar-${req.user.userId}-${uniqueSuffix}${ext}`);
    }
});
const avatarUpload = (0, multer_1.default)({
    storage: avatarStorage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error(`File type ${file.mimetype} not allowed`));
        }
    }
});
// Simple encryption helpers for API key storage
const ENCRYPTION_KEY = process.env.JWT_SECRET || 'default-encryption-key';
const algorithm = 'aes-256-cbc';
function encrypt(text) {
    const iv = crypto.randomBytes(16);
    const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
}
function decrypt(text) {
    const [ivHex, encrypted] = text.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}
// Get current user profile
router.get('/me', auth_middleware_1.default, async (req, res) => {
    try {
        const user = await (0, db_1.default)('users')
            .where({ id: req.user.userId })
            .select('id', 'email', 'username', 'full_name', 'created_at', 'updated_at')
            .first();
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        // Check if user has API key set
        const hasApiKey = await (0, db_1.default)('users')
            .where({ id: req.user.userId })
            .whereNotNull('anthropic_api_key')
            .first();
        res.json({
            ...user,
            hasApiKey: !!hasApiKey
        });
    }
    catch (error) {
        console.error('Get user profile error:', error);
        res.status(500).json({ error: 'Failed to fetch user profile' });
    }
});
// Update API key
router.put('/api-key', auth_middleware_1.default, async (req, res) => {
    try {
        const { apiKey } = req.body;
        // Validate API key format (sk-ant-...)
        if (apiKey && !apiKey.startsWith('sk-ant-')) {
            return res.status(400).json({ error: 'Invalid API key format' });
        }
        // Encrypt the API key before storing
        const encryptedApiKey = apiKey ? encrypt(apiKey) : null;
        await (0, db_1.default)('users')
            .where({ id: req.user.userId })
            .update({
            anthropic_api_key: encryptedApiKey,
            updated_at: new Date()
        });
        res.json({ message: 'API key updated successfully', hasApiKey: !!apiKey });
    }
    catch (error) {
        console.error('Update API key error:', error);
        res.status(500).json({ error: 'Failed to update API key' });
    }
});
// Remove API key
router.delete('/api-key', auth_middleware_1.default, async (req, res) => {
    try {
        await (0, db_1.default)('users')
            .where({ id: req.user.userId })
            .update({
            anthropic_api_key: null,
            updated_at: new Date()
        });
        res.json({ message: 'API key removed successfully' });
    }
    catch (error) {
        console.error('Remove API key error:', error);
        res.status(500).json({ error: 'Failed to remove API key' });
    }
});
// Get user profile
router.get('/profile', auth_middleware_1.default, async (req, res) => {
    try {
        const user = await (0, db_1.default)('users')
            .where({ id: req.user.userId })
            .select('id', 'email', 'username', 'avatar_url', 'created_at')
            .first();
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    }
    catch (error) {
        console.error('Get user profile error:', error);
        res.status(500).json({ error: 'Failed to fetch user profile' });
    }
});
// Update user profile
router.put('/profile', auth_middleware_1.default, async (req, res) => {
    try {
        const { username } = req.body;
        if (!username) {
            return res.status(400).json({ error: 'Username is required' });
        }
        // Check if username is already taken
        const existingUser = await (0, db_1.default)('users')
            .where({ username })
            .whereNot({ id: req.user.userId })
            .first();
        if (existingUser) {
            return res.status(400).json({ error: 'Username already taken' });
        }
        await (0, db_1.default)('users')
            .where({ id: req.user.userId })
            .update({
            username,
            updated_at: new Date()
        });
        res.json({ message: 'Profile updated successfully' });
    }
    catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});
// Upload avatar
router.post('/avatar', auth_middleware_1.default, avatarUpload.single('avatar'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        // Get current user's avatar
        const user = await (0, db_1.default)('users')
            .where({ id: req.user.userId })
            .select('avatar_url')
            .first();
        // Delete old avatar if exists
        if (user?.avatar_url) {
            const oldAvatarPath = path_1.default.join(avatarsDir, path_1.default.basename(user.avatar_url));
            if (fs_1.default.existsSync(oldAvatarPath)) {
                fs_1.default.unlinkSync(oldAvatarPath);
            }
        }
        // Update user with new avatar URL
        const avatarUrl = `/api/users/avatar/${req.file.filename}`;
        await (0, db_1.default)('users')
            .where({ id: req.user.userId })
            .update({
            avatar_url: avatarUrl,
            updated_at: new Date()
        });
        res.json({ avatar_url: avatarUrl });
    }
    catch (error) {
        // Clean up uploaded file on error
        if (req.file && fs_1.default.existsSync(req.file.path)) {
            fs_1.default.unlinkSync(req.file.path);
        }
        console.error('Upload avatar error:', error);
        res.status(500).json({ error: 'Failed to upload avatar' });
    }
});
// Get avatar file
router.get('/avatar/:filename', async (req, res) => {
    try {
        const { filename } = req.params;
        const filePath = path_1.default.join(avatarsDir, filename);
        if (!fs_1.default.existsSync(filePath)) {
            return res.status(404).json({ error: 'Avatar not found' });
        }
        res.sendFile(filePath);
    }
    catch (error) {
        console.error('Get avatar error:', error);
        res.status(500).json({ error: 'Failed to get avatar' });
    }
});
// Delete avatar
router.delete('/avatar', auth_middleware_1.default, async (req, res) => {
    try {
        // Get current user's avatar
        const user = await (0, db_1.default)('users')
            .where({ id: req.user.userId })
            .select('avatar_url')
            .first();
        // Delete avatar file if exists
        if (user?.avatar_url) {
            const avatarPath = path_1.default.join(avatarsDir, path_1.default.basename(user.avatar_url));
            if (fs_1.default.existsSync(avatarPath)) {
                fs_1.default.unlinkSync(avatarPath);
            }
        }
        // Remove avatar URL from database
        await (0, db_1.default)('users')
            .where({ id: req.user.userId })
            .update({
            avatar_url: null,
            updated_at: new Date()
        });
        res.json({ message: 'Avatar removed successfully' });
    }
    catch (error) {
        console.error('Delete avatar error:', error);
        res.status(500).json({ error: 'Failed to delete avatar' });
    }
});
exports.default = router;
//# sourceMappingURL=users.routes.js.map