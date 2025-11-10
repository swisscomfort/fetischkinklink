// Centralized Error Handling Middleware
// Custom error classes and error handler

import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger.js';

// ============================================================================
// CUSTOM ERROR CLASSES
// ============================================================================

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  details?: any;

  constructor(message: string, statusCode: number = 500, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, details);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 403);
    this.name = 'ForbiddenError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource already exists') {
    super(message, 409);
    this.name = 'ConflictError';
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(message, 429);
    this.name = 'RateLimitError';
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = 'Database operation failed', details?: any) {
    super(message, 500, details);
    this.name = 'DatabaseError';
  }
}

// ============================================================================
// ERROR HANDLER MIDDLEWARE
// ============================================================================

export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Default to 500 server error
  let statusCode = 500;
  let message = 'Internal Server Error';
  let details: any = {};

  // Handle known error types
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    details = err.details || {};
  }

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid data format';
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // Log error
  const errorLog = {
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
    statusCode,
    message: err.message,
    stack: err.stack,
    requestId: req.headers['x-request-id'],
    userId: (req as any).user?.id,
  };

  if (statusCode >= 500) {
    logger.error(`${statusCode} - ${err.message}`, errorLog);
  } else {
    logger.warn(`${statusCode} - ${err.message}`, errorLog);
  }

  // Don't leak error details in production
  const isProduction = process.env.NODE_ENV === 'production';
  const response: any = {
    error: err.name || 'Error',
    message: isProduction && statusCode >= 500 ? 'Internal Server Error' : message,
    timestamp: new Date().toISOString(),
    requestId: req.headers['x-request-id'],
  };

  // Include details only in non-production or for client errors
  if (!isProduction || statusCode < 500) {
    if (Object.keys(details).length > 0) {
      response.details = details;
    }
    if (!isProduction && err.stack) {
      response.stack = err.stack;
    }
  }

  res.status(statusCode).json(response);
}

// ============================================================================
// NOT FOUND HANDLER
// ============================================================================

export function notFoundHandler(req: Request, res: Response, next: NextFunction) {
  const error = new NotFoundError(`Route ${req.method} ${req.path} not found`);
  next(error);
}

// ============================================================================
// ASYNC HANDLER WRAPPER
// ============================================================================

type AsyncFunction = (req: Request, res: Response, next: NextFunction) => Promise<any>;

export function asyncHandler(fn: AsyncFunction) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
