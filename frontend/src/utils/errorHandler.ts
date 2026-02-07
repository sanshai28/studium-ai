import { AxiosError } from 'axios';

interface ApiErrorResponse {
  error?: string;
  message?: string;
  details?: Array<{ field: string; message: string }>;
}

/**
 * Extract error message from API error response
 */
export const getErrorMessage = (error: unknown, fallbackMessage = 'An error occurred'): string => {
  // Handle Axios errors
  if (isAxiosError(error)) {
    const data = error.response?.data as ApiErrorResponse | undefined;
    if (data?.error) return data.error;
    if (data?.message) return data.message;
    if (error.response?.status === 401) return 'Please sign in to continue';
    if (error.response?.status === 403) return 'You do not have permission to perform this action';
    if (error.response?.status === 404) return 'Resource not found';
    if (error.response?.status === 500) return 'Server error. Please try again later';
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    return error.message;
  }

  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }

  return fallbackMessage;
};

/**
 * Type guard for Axios errors
 */
function isAxiosError(error: unknown): error is AxiosError {
  return (
    error !== null &&
    typeof error === 'object' &&
    'isAxiosError' in error &&
    (error as AxiosError).isAxiosError === true
  );
}

/**
 * Extract validation error details from API response
 */
export const getValidationErrors = (
  error: unknown
): Array<{ field: string; message: string }> | null => {
  if (!isAxiosError(error)) return null;

  const data = error.response?.data as ApiErrorResponse | undefined;
  if (data?.details && Array.isArray(data.details)) {
    return data.details;
  }
  return null;
};
