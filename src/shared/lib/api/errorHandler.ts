import { toast } from 'react-toastify';

// Common error structure that both ErrorCodeList and ErrorDetails follow
export interface ApiErrorItem {
  ErrorCode: string;
  ErrorDesc: string;
}

// API response structure that may contain errors
export interface ApiResponseWithErrors {
  ErrorCodeList?: ApiErrorItem[];
  ErrorDetails?: ApiErrorItem[];
  SuccessCode?: string;
  ServiceStatus?: string;
  [key: string]: any;
}

// Special error codes that need special handling
export const SPECIAL_ERROR_CODES = {
  TOKEN_EXPIRED: 'ERR001',
  SESSION_EXPIRED: 'ERR002',
  UNAUTHORIZED: 'ERR003',
} as const;

// Error codes that should not be shown to users
export const SUPPRESSED_ERROR_CODES = [
  'ER1081',
  'ER3008',
  'ER1068',
  'ER1032',
  'ER1033',
  'ER1034',
  'ER1035',
  'ER1036',
  'ER1037',
  'ER1038',
  'ER1039',
  'ER1040',
  'ER1058',
  'ER1067',
  'ER1069',
  'ER1070',
  'ER1071',
  'ER1072',
  'ER1073',
  'ER1074',
  'ER1075',
  'ER1076',
  'ER1077',
  'ER1089',
  'ER1091',
  'ER1103',
  'ER1104',
  'ER1105',
  'ER1116',
  'ER1122',
  'ER1124',
  'ER1132',
  'ER1136',
  'ER1144',
  'ER3001',
  'ER3002',
  'ER3003',
  'ER3004',
  'ER3005',
  'ER3007',
  'ER3009',
  'ER3010',
  'ER3012',
  'ER3103',
  'ER3104',
  'ER3801',
  'ER3802',
  'ER4012',
  'ER4013',
  'ER4014',
  'ER4015',
  'ERR001',
  'ERR002',
  'ER2016'
] as const;

// Error handling configuration
export interface ErrorHandlerConfig {
  showToasts?: boolean;
  redirectOnTokenExpired?: boolean;
  customErrorMessages?: Record<string, string>;
  suppressErrorCodes?: string[]; // Additional error codes to suppress
}

/**
 * Extracts all errors from an API response, handling both ErrorCodeList and ErrorDetails
 */
export function extractApiErrors(response: ApiResponseWithErrors): ApiErrorItem[] {
  const errors: ApiErrorItem[] = [];

  // Handle ErrorCodeList
  if (response?.ErrorCodeList && Array.isArray(response.ErrorCodeList)) {
    errors.push(...response.ErrorCodeList.filter(error =>
      error &&
      (error.ErrorCode || error.ErrorDesc) &&
      !(error.ErrorCode === "" && error.ErrorDesc === "")
    ));
  }

  // Handle ErrorDetails
  if (response?.ErrorDetails && Array.isArray(response.ErrorDetails)) {
    // Group ErrorCode and ErrorDesc objects that belong together
    const groupedErrors: ApiErrorItem[] = [];
    const errorCodeMap = new Map<string, string>();
    const errorDescMap = new Map<string, string>();

    response.ErrorDetails.forEach((item, index) => {
      if (item.ErrorCode) {
        errorCodeMap.set(index.toString(), item.ErrorCode);
      }
      if (item.ErrorDesc) {
        errorDescMap.set(index.toString(), item.ErrorDesc);
      }
    });

    // Combine ErrorCode and ErrorDesc into single error items
    const maxIndex = Math.max(
      ...Array.from(errorCodeMap.keys()).map(k => parseInt(k)),
      ...Array.from(errorDescMap.keys()).map(k => parseInt(k))
    );

    for (let i = 0; i <= maxIndex; i++) {
      const errorCode = errorCodeMap.get(i.toString());
      const errorDesc = errorDescMap.get(i.toString());

      if (errorCode || errorDesc) {
        groupedErrors.push({
          ErrorCode: errorCode || "",
          ErrorDesc: errorDesc || ""
        });
      }
    }

    errors.push(...groupedErrors.filter(error =>
      error &&
      (error.ErrorCode || error.ErrorDesc) &&
      !(error.ErrorCode === "" && error.ErrorDesc === "")
    ));
  }

  return errors;
}

/**
 * Checks if an API response has any errors
 */
export function hasApiErrors(response: ApiResponseWithErrors): boolean {
  return extractApiErrors(response).length > 0;
}

/**
 * Handles API errors by displaying appropriate messages and taking actions
 */
export function handleApiErrors(
  response: ApiResponseWithErrors,
  config: ErrorHandlerConfig = {}
): void {
  const {
    showToasts = true,
    redirectOnTokenExpired = true,
    customErrorMessages = {},
    suppressErrorCodes = []
  } = config;

  const errors = extractApiErrors(response);

  console.log('handleApiErrors called with:', { response, errors, config }); // Debug log

  if (errors.length === 0) {
    return;
  }

  errors.forEach((error) => {
    const { ErrorCode, ErrorDesc } = error;

    // Check if this error code should be suppressed
    const isSuppressed = SUPPRESSED_ERROR_CODES.includes(ErrorCode as any) ||
      suppressErrorCodes.includes(ErrorCode);

    console.log('Processing error:', { ErrorCode, ErrorDesc, isSuppressed }); // Debug log

    // Handle special error codes
    if (ErrorCode === SPECIAL_ERROR_CODES.TOKEN_EXPIRED && redirectOnTokenExpired) {
      if (showToasts && !isSuppressed) {
        toast.error("The Token Is Expired");
      }

      setTimeout(() => {
        if (process.env.VITE_LOGIN_SWITCH === "true") {
          window.location.href = `${process.env.VITE_REDIRECT_URL_LOCAL}`;
        } else {
          window.location.href = `${process.env.VITE_REDIRECT_URL}`;
        }
      }, 2000);
      return;
    }

    // Use custom error message if available
    const errorMessage = customErrorMessages[ErrorCode] || ErrorDesc;

    // Only show toast if not suppressed and showToasts is true
    if (errorMessage && showToasts && !isSuppressed) {
      console.log('Showing toast for error:', errorMessage); // Debug log
      toast.error(errorMessage);
    } else {
      console.log('Suppressing error:', { ErrorCode, ErrorDesc }); // Debug log
    }
  });
}

/**
 * Validates if an API response is successful
 */
export function isApiResponseSuccessful(response: ApiResponseWithErrors): boolean {
  // Check for explicit success indicators
  const hasSuccessCode = response?.SuccessCode === "200";
  const hasSuccessStatus = response?.ServiceStatus === "Success";

  // Check for absence of errors
  const hasNoErrors = !hasApiErrors(response);

  return (hasSuccessCode || hasSuccessStatus) && hasNoErrors;
}

/**
 * Creates a standardized error response object
 */
export function createErrorResponse(
  errorCode: string,
  errorDesc: string,
  additionalData: Record<string, any> = {}
): ApiResponseWithErrors {
  return {
    ServiceStatus: "Error",
    SuccessCode: "500",
    ErrorCodeList: [{
      ErrorCode: errorCode,
      ErrorDesc: errorDesc
    }],
    ...additionalData
  };
}

/**
 * Handles API response with automatic error detection and handling
 */
export function handleApiResponse(
  response: ApiResponseWithErrors,
  config: ErrorHandlerConfig = {}
): boolean {
  // Handle errors if any exist
  if (hasApiErrors(response)) {
    handleApiErrors(response, config);
    return false;
  }

  // Check if response is successful
  return isApiResponseSuccessful(response);
} 