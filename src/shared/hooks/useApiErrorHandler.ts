import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  handleApiResponse, 
  hasApiErrors, 
  extractApiErrors, 
  createErrorResponse,
  ApiResponseWithErrors,
  ErrorHandlerConfig 
} from '@/shared/lib/api/errorHandler';

/**
 * React hook for handling API responses with consistent error handling
 */
export const useApiErrorHandler = () => {
  const { t } = useTranslation();

  /**
   * Handles an API response and returns whether it was successful
   */
  const handleResponse = useCallback((
    response: ApiResponseWithErrors,
    config: ErrorHandlerConfig = {}
  ): boolean => {
    return handleApiResponse(response, config);
  }, []);

  /**
   * Checks if a response has any errors
   */
  const hasErrors = useCallback((response: ApiResponseWithErrors): boolean => {
    return hasApiErrors(response);
  }, []);

  /**
   * Extracts all errors from a response
   */
  const getErrors = useCallback((response: ApiResponseWithErrors) => {
    return extractApiErrors(response);
  }, []);

  /**
   * Creates a standardized error response
   */
  const createError = useCallback((
    errorCode: string,
    errorDesc: string,
    additionalData: Record<string, any> = {}
  ): ApiResponseWithErrors => {
    return createErrorResponse(errorCode, errorDesc, additionalData);
  }, []);

  /**
   * Handles API errors with translation support
   */
  const handleErrorsWithTranslation = useCallback((
    response: ApiResponseWithErrors,
    config: ErrorHandlerConfig = {}
  ): void => {
    const errors = extractApiErrors(response);
    
    if (errors.length === 0) return;

    // Add translation support for common error messages
    const translatedConfig: ErrorHandlerConfig = {
      ...config,
      customErrorMessages: {
        ...config.customErrorMessages,
        // Add common error translations
        'API_ERROR': t('api_error_generic') || 'An API error occurred',
        'VALIDATION_ERROR': t('validation_error') || 'Validation error',
        'NETWORK_ERROR': t('network_error') || 'Network error',
        'UNAUTHORIZED': t('unauthorized') || 'Unauthorized access',
        'NOT_FOUND': t('not_found') || 'Resource not found',
      }
    };

    handleApiResponse(response, translatedConfig);
  }, [t]);

  /**
   * Wraps an async API call with error handling
   */
  const withErrorHandling = useCallback(async <T>(
    apiCall: () => Promise<T>,
    config: ErrorHandlerConfig = {}
  ): Promise<T | null> => {
    try {
      const result = await apiCall();
      
      // If the result is an API response with errors, handle them
      if (result && typeof result === 'object' && ('ErrorCodeList' in result || 'ErrorDetails' in result)) {
        const success = handleApiResponse(result as ApiResponseWithErrors, config);
        return success ? result : null;
      }
      
      return result;
    } catch (error) {
      // Handle unexpected errors
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      const errorResponse = createErrorResponse('UNEXPECTED_ERROR', errorMessage);
      handleApiResponse(errorResponse, config);
      return null;
    }
  }, []);

  return {
    handleResponse,
    hasErrors,
    getErrors,
    createError,
    handleErrorsWithTranslation,
    withErrorHandling
  };
}; 