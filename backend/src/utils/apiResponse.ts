import { Response } from 'express';

interface ApiSuccessResponse<T = any> {
  success: true;
  message?: string;
  data: T;
  meta?: {
    timestamp: string;
    version: string;
    platform?: string;
  };
}

interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    timestamp: string;
    version: string;
    platform?: string;
  };
}

export class ApiResponse {
  /**
   * Send success response
   * @param res Express response object
   * @param data Response data
   * @param message Optional success message
   * @param statusCode HTTP status code (default: 200)
   */
  static success<T>(
    res: Response,
    data: T,
    message?: string,
    statusCode: number = 200
  ): void {
    const response: ApiSuccessResponse<T> = {
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      },
    };

    if (message) {
      response.message = message;
    }

    res.status(statusCode).json(response);
  }

  /**
   * Send error response
   * @param res Express response object
   * @param message Error message
   * @param code Error code
   * @param statusCode HTTP status code (default: 400)
   * @param details Additional error details
   */
  static error(
    res: Response,
    message: string,
    code: string = 'ERROR',
    statusCode: number = 400,
    details?: any
  ): void {
    const response: ApiErrorResponse = {
      success: false,
      error: {
        code,
        message,
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      },
    };

    if (details && process.env.NODE_ENV === 'development') {
      response.error.details = details;
    }

    res.status(statusCode).json(response);
  }

  /**
   * Send validation error response
   */
  static validationError(res: Response, errors: any): void {
    this.error(res, 'Validation failed', 'VALIDATION_ERROR', 422, errors);
  }

  /**
   * Send unauthorized error response
   */
  static unauthorized(res: Response, message: string = 'Unauthorized'): void {
    this.error(res, message, 'UNAUTHORIZED', 401);
  }

  /**
   * Send forbidden error response
   */
  static forbidden(res: Response, message: string = 'Forbidden'): void {
    this.error(res, message, 'FORBIDDEN', 403);
  }

  /**
   * Send not found error response
   */
  static notFound(res: Response, message: string = 'Resource not found'): void {
    this.error(res, message, 'NOT_FOUND', 404);
  }

  /**
   * Send server error response
   */
  static serverError(
    res: Response,
    message: string = 'Internal server error',
    details?: any
  ): void {
    this.error(res, message, 'SERVER_ERROR', 500, details);
  }
}

export default ApiResponse;
