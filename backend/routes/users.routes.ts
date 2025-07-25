import { Router, Request, Response } from 'express';
import authenticate from '../middleware/auth.middleware';
import * as crypto from 'crypto';
import db from '../src/db';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

// Create avatars directory if it doesn't exist
const avatarsDir = path.join(__dirname, '../../uploads/avatars');
if (!fs.existsSync(avatarsDir)) {
  fs.mkdirSync(avatarsDir, { recursive: true });
}

// Configure multer for avatar uploads
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, avatarsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `avatar-${req.user!.userId}-${uniqueSuffix}${ext}`);
  }
});

const avatarUpload = multer({
  storage: avatarStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} not allowed`));
    }
  }
});

// Simple encryption helpers for API key storage
const ENCRYPTION_KEY = process.env.JWT_SECRET || 'default-encryption-key';
const algorithm = 'aes-256-cbc';

function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

function decrypt(text: string): string {
  const [ivHex, encrypted] = text.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// Get current user profile
router.get('/me', authenticate, async (req: Request, res: Response) => {
  try {
    const user = await db('users')
      .where({ id: req.user!.userId })
      .select('id', 'email', 'username', 'full_name', 'created_at', 'updated_at')
      .first();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user has API key set
    const hasApiKey = await db('users')
      .where({ id: req.user!.userId })
      .whereNotNull('anthropic_api_key')
      .first();

    res.json({
      ...user,
      hasApiKey: !!hasApiKey
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// Update API key
router.put('/api-key', authenticate, async (req: Request, res: Response) => {
  try {
    const { apiKey } = req.body;

    // Validate API key format (sk-ant-...)
    if (apiKey && !apiKey.startsWith('sk-ant-')) {
      return res.status(400).json({ error: 'Invalid API key format' });
    }

    // Encrypt the API key before storing
    const encryptedApiKey = apiKey ? encrypt(apiKey) : null;

    await db('users')
      .where({ id: req.user!.userId })
      .update({
        anthropic_api_key: encryptedApiKey,
        updated_at: new Date()
      });

    res.json({ message: 'API key updated successfully', hasApiKey: !!apiKey });
  } catch (error) {
    console.error('Update API key error:', error);
    res.status(500).json({ error: 'Failed to update API key' });
  }
});

// Remove API key
router.delete('/api-key', authenticate, async (req: Request, res: Response) => {
  try {
    await db('users')
      .where({ id: req.user!.userId })
      .update({
        anthropic_api_key: null,
        updated_at: new Date()
      });

    res.json({ message: 'API key removed successfully' });
  } catch (error) {
    console.error('Remove API key error:', error);
    res.status(500).json({ error: 'Failed to remove API key' });
  }
});

// Get user profile
router.get('/profile', authenticate, async (req: Request, res: Response) => {
  try {
    const user = await db('users')
      .where({ id: req.user!.userId })
      .select('id', 'email', 'username', 'avatar_url', 'created_at')
      .first();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// Update user profile
router.put('/profile', authenticate, async (req: Request, res: Response) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    // Check if username is already taken
    const existingUser = await db('users')
      .where({ username })
      .whereNot({ id: req.user!.userId })
      .first();

    if (existingUser) {
      return res.status(400).json({ error: 'Username already taken' });
    }

    await db('users')
      .where({ id: req.user!.userId })
      .update({
        username,
        updated_at: new Date()
      });

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Upload avatar
router.post('/avatar', authenticate, avatarUpload.single('avatar'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Get current user's avatar
    const user = await db('users')
      .where({ id: req.user!.userId })
      .select('avatar_url')
      .first();

    // Delete old avatar if exists
    if (user?.avatar_url) {
      const oldAvatarPath = path.join(avatarsDir, path.basename(user.avatar_url));
      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath);
      }
    }

    // Update user with new avatar URL
    const avatarUrl = `/api/users/avatar/${req.file.filename}`;
    await db('users')
      .where({ id: req.user!.userId })
      .update({
        avatar_url: avatarUrl,
        updated_at: new Date()
      });

    res.json({ avatar_url: avatarUrl });
  } catch (error) {
    // Clean up uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error('Upload avatar error:', error);
    res.status(500).json({ error: 'Failed to upload avatar' });
  }
});

// Get avatar file
router.get('/avatar/:filename', async (req: Request, res: Response) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(avatarsDir, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Avatar not found' });
    }

    res.sendFile(filePath);
  } catch (error) {
    console.error('Get avatar error:', error);
    res.status(500).json({ error: 'Failed to get avatar' });
  }
});

// Delete avatar
router.delete('/avatar', authenticate, async (req: Request, res: Response) => {
  try {
    // Get current user's avatar
    const user = await db('users')
      .where({ id: req.user!.userId })
      .select('avatar_url')
      .first();

    // Delete avatar file if exists
    if (user?.avatar_url) {
      const avatarPath = path.join(avatarsDir, path.basename(user.avatar_url));
      if (fs.existsSync(avatarPath)) {
        fs.unlinkSync(avatarPath);
      }
    }

    // Remove avatar URL from database
    await db('users')
      .where({ id: req.user!.userId })
      .update({
        avatar_url: null,
        updated_at: new Date()
      });

    res.json({ message: 'Avatar removed successfully' });
  } catch (error) {
    console.error('Delete avatar error:', error);
    res.status(500).json({ error: 'Failed to delete avatar' });
  }
});

export default router;