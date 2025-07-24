import { Router, Request, Response } from 'express';
import authenticate from '../middleware/auth.middleware';
import * as crypto from 'crypto';
import db from '../src/db';

const router = Router();

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

export default router;