// Security Middleware Configuration
// Helmet, Rate Limiting, CORS

import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

// ============================================================================
// HELMET SECURITY HEADERS
// ============================================================================

export const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
});

// ============================================================================
// RATE LIMITERS
// ============================================================================

// General API rate limiter
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too Many Requests',
    message: 'You have exceeded the 100 requests in 15 minutes limit!',
    retryAfter: '15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Character generation rate limiter (more restrictive)
export const characterGenerationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit to 10 character generations per hour
  message: {
    error: 'Rate Limit Exceeded',
    message: 'Character generation limit exceeded. Maximum 10 per hour.',
    retryAfter: '1 hour',
  },
  skipSuccessfulRequests: false,
});

// Matching rate limiter
export const matchingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // 50 matches per hour
  message: {
    error: 'Rate Limit Exceeded',
    message: 'Matching limit exceeded. Maximum 50 calculations per hour.',
    retryAfter: '1 hour',
  },
});

// Taxonomy search rate limiter
export const taxonomyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50,
  message: {
    error: 'Rate Limit Exceeded',
    message: 'Taxonomy search limit exceeded. Maximum 50 searches per 15 minutes.',
  },
});

// ============================================================================
// CORS CONFIGURATION
// ============================================================================

export const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    const allowedOrigins = [
      'http://localhost:5173', // Vite dev
      'http://localhost:3000', // Next.js dev
      'https://spiegelmatch.com',
      'https://www.spiegelmatch.com',
      'https://app.spiegelmatch.com',
    ];

    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  exposedHeaders: ['X-Request-ID', 'X-Rate-Limit-Remaining'],
};

// ============================================================================
// REQUEST ID MIDDLEWARE
// ============================================================================

export function requestId(req: Request, res: Response, next: NextFunction) {
  const id = req.headers['x-request-id'] || 
    `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  req.headers['x-request-id'] = id as string;
  res.setHeader('X-Request-ID', id);
  next();
}

// ============================================================================
// REQUEST TIMING MIDDLEWARE
// ============================================================================

export function requestTiming(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    res.setHeader('X-Response-Time', `${duration}ms`);
  });
  
  next();
}

// ============================================================================
// SANITIZE INPUT MIDDLEWARE
// ============================================================================

export function sanitizeInput(req: Request, res: Response, next: NextFunction) {
  // Remove potential XSS vectors from string inputs
  const sanitize = (obj: any): any => {
    if (typeof obj === 'string') {
      return obj
        .replace(/<script[^>]*>.*?<\/script>/gi, '')
        .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '');
    }
    if (Array.isArray(obj)) {
      return obj.map(sanitize);
    }
    if (typeof obj === 'object' && obj !== null) {
      const sanitized: any = {};
      for (const key in obj) {
        sanitized[key] = sanitize(obj[key]);
      }
      return sanitized;
    }
    return obj;
  };

  if (req.body) {
    req.body = sanitize(req.body);
  }
  if (req.query) {
    req.query = sanitize(req.query);
  }
  if (req.params) {
    req.params = sanitize(req.params);
  }

  next();
}
