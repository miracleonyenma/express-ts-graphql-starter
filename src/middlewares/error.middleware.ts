// ./src/middlewares/error.middleware.ts

import { Request, Response, NextFunction } from 'express';
import { 
  ApiError, 
  ErrorHandler,
  errorResponse
} from '../services/error.services.js';

/**
 * Middleware to handle 404 Not Found errors
 */
export const notFoundMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const error = new ApiError(`Not Found - ${req.originalUrl}`, 404);
  next(error);
};

/**
 * Global error handling middleware
 * This should be the last middleware in your Express app
 */
export const errorMiddleware = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log the error
  ErrorHandler.logError(err, req);
  
  // Generate standardized error response
  const response = errorResponse(err);
  
  // Send response
  return res.status(response.statusCode || 500).json(response);
};