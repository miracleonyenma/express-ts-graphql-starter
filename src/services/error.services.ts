// ./src/services/error.services.ts

/**
 * Base API Error class that extends the native Error
 * Provides additional fields and functionality for API error handling
 */
export class ApiError extends Error {
  statusCode: number;
  errors?: any;
  isOperational: boolean;
  errorCode?: string;
  
  constructor(
    message: string,
    statusCode: number = 500,
    errors?: any,
    isOperational: boolean = true,
    errorCode?: string
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = isOperational;
    this.errorCode = errorCode;
    this.name = this.constructor.name;
    
    // Capture stack trace
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = new Error(message).stack;
    }
  }
}

/**
 * 400 Bad Request Error
 */
export class BadRequestError extends ApiError {
  constructor(message: string = 'Bad Request', errors?: any, errorCode?: string) {
    super(message, 400, errors, true, errorCode);
  }
}

/**
 * 401 Unauthorized Error
 */
export class UnauthorizedError extends ApiError {
  constructor(message: string = 'Unauthorized', errors?: any, errorCode?: string) {
    super(message, 401, errors, true, errorCode);
  }
}

/**
 * 403 Forbidden Error
 */
export class ForbiddenError extends ApiError {
  constructor(message: string = 'Forbidden', errors?: any, errorCode?: string) {
    super(message, 403, errors, true, errorCode);
  }
}

/**
 * 404 Not Found Error
 */
export class NotFoundError extends ApiError {
  constructor(message: string = 'Resource Not Found', errors?: any, errorCode?: string) {
    super(message, 404, errors, true, errorCode);
  }
}

/**
 * 409 Conflict Error
 */
export class ConflictError extends ApiError {
  constructor(message: string = 'Conflict', errors?: any, errorCode?: string) {
    super(message, 409, errors, true, errorCode);
  }
}

/**
 * 422 Validation Error
 */
export class ValidationError extends ApiError {
  constructor(message: string = 'Validation Failed', errors?: any, errorCode?: string) {
    super(message, 422, errors, true, errorCode);
  }
}

/**
 * 500 Internal Server Error
 */
export class InternalServerError extends ApiError {
  constructor(message: string = 'Internal Server Error', errors?: any, errorCode?: string) {
    super(message, 500, errors, false, errorCode);
  }
}

/**
 * 503 Service Unavailable Error
 */
export class ServiceUnavailableError extends ApiError {
  constructor(message: string = 'Service Unavailable', errors?: any, errorCode?: string) {
    super(message, 503, errors, false, errorCode);
  }
}

/**
 * Error handling utility methods
 */
export class ErrorHandler {
  /**
   * Handle different types of errors
   * @param error Error object to handle
   */
  static handleError(error: Error | ApiError): ApiError {
    if (error instanceof ApiError) {
      return error;
    }

    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      return new ValidationError('Validation Failed', error);
    }

    // Handle JWT errors
    if (error.name === 'JsonWebTokenError') {
      return new UnauthorizedError('Invalid Token');
    }

    if (error.name === 'TokenExpiredError') {
      return new UnauthorizedError('Token Expired');
    }

    // Handle Cast errors (Mongoose)
    if (error.name === 'CastError') {
      return new BadRequestError('Invalid ID format');
    }

    // Handle Duplicate Key errors (MongoDB)
    if ((error as any).code === 11000) {
      return new ConflictError('Duplicate key error');
    }

    // Default to Internal Server Error for unhandled errors
    console.error('Unhandled error:', error);
    return new InternalServerError(error.message, error);
  }

  /**
   * Check if error is trusted (operational)
   * @param error Error to check
   */
  static isTrustedError(error: Error | ApiError): boolean {
    if (error instanceof ApiError) {
      return error.isOperational;
    }
    return false;
  }

  /**
   * Log error details
   * @param error Error to log
   * @param request Optional request object for context
   */
  static logError(error: Error | ApiError, request?: any): void {
    const timestamp = new Date().toISOString();
    const errorDetails = {
      timestamp,
      name: error.name,
      message: error.message,
      stack: error.stack,
      ...(error instanceof ApiError && {
        statusCode: error.statusCode,
        errorCode: error.errorCode,
        isOperational: error.isOperational,
      }),
      ...(request && {
        method: request.method,
        url: request.url,
        ip: request.ip,
        userId: request.user?._id,
      }),
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[ERROR]', JSON.stringify(errorDetails, null, 2));
    } else {
      // In production, you might want to log to a file or error monitoring service
      console.error(
        `[ERROR] ${timestamp} - ${error.name}: ${error.message} - ${
          error instanceof ApiError ? `Status: ${error.statusCode}` : ''
        }`
      );
    }

    // Here you could implement additional logging to external services
    // like Sentry, Rollbar, or your own logging infrastructure
  }
}

/**
 * Convert error into a standardized response object
 * @param error Error to convert
 */
export function errorResponse(error: Error | ApiError) {
  const apiError = error instanceof ApiError ? error : ErrorHandler.handleError(error);
  
  return {
    success: false,
    message: apiError.message,
    statusCode: apiError.statusCode,
    ...(apiError.errorCode && { errorCode: apiError.errorCode }),
    ...(apiError.errors && { errors: apiError.errors }),
    ...(process.env.NODE_ENV === 'development' && { stack: apiError.stack }),
  };
}

/**
 * Global process uncaught exception handler
 */
export function setupUncaughtExceptionHandler() {
  process.on('uncaughtException', (error: Error) => {
    console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    ErrorHandler.logError(error);
    
    // Exit with failure code
    process.exit(1);
  });

  process.on('unhandledRejection', (reason: Error) => {
    console.error('UNHANDLED REJECTION! 💥 Shutting down...');
    ErrorHandler.logError(reason);
    
    // Exit with failure code
    process.exit(1);
  });
}