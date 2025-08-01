/**
 * Rate limiting middleware for API endpoints
 */

import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';

// Create different rate limiters for different endpoints

// Strict rate limit for authentication endpoints
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many authentication attempts, please try again later'
    }
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skipSuccessfulRequests: false, // Count successful requests
});

// Moderate rate limit for password reset
export const passwordResetRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 password reset requests per hour
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many password reset requests, please try again later'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// General API rate limiter (already configured in main app)
export const apiRateLimiter = rateLimit({
  windowMs: parseInt(process.env.API_RATE_LIMIT_WINDOW_MS || '900000'), // Default 15 minutes
  max: parseInt(process.env.API_RATE_LIMIT_MAX || '100'), // Default 100 requests
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many requests from this IP, please try again later'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Per-user rate limiter (requires authentication)
const userRateLimiters = new Map<string, Map<string, number[]>>();

export function createUserRateLimiter(
  windowMs: number,
  maxRequests: number,
  keyPrefix: string = 'default'
) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Skip if no user
    if (!req.user?.userId) {
      return next();
    }

    const userId = req.user.userId.toString();
    const key = `${keyPrefix}:${userId}`;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Get or create user's rate limit map
    if (!userRateLimiters.has(key)) {
      userRateLimiters.set(key, new Map());
    }

    const userLimits = userRateLimiters.get(key)!;
    
    // Get or create endpoint limit array
    const endpoint = req.path;
    if (!userLimits.has(endpoint)) {
      userLimits.set(endpoint, []);
    }

    const requests = userLimits.get(endpoint)!;
    
    // Remove old requests outside the window
    const validRequests = requests.filter(timestamp => timestamp > windowStart);
    
    // Check if limit exceeded
    if (validRequests.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        error: {
          code: 'TOO_MANY_REQUESTS',
          message: `Rate limit exceeded. Max ${maxRequests} requests per ${windowMs / 1000} seconds`
        }
      });
    }

    // Add current request
    validRequests.push(now);
    userLimits.set(endpoint, validRequests);

    next();
  };
}

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now();
  const maxAge = 60 * 60 * 1000; // 1 hour

  userRateLimiters.forEach((userLimits, userId) => {
    userLimits.forEach((requests, endpoint) => {
      const validRequests = requests.filter(timestamp => timestamp > now - maxAge);
      if (validRequests.length === 0) {
        userLimits.delete(endpoint);
      } else {
        userLimits.set(endpoint, validRequests);
      }
    });

    if (userLimits.size === 0) {
      userRateLimiters.delete(userId);
    }
  });
}, 5 * 60 * 1000); // Clean up every 5 minutes