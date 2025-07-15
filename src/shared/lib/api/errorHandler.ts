import { toast } from 'react-toastify';

export interface ApiErrorItem {
  ErrorCode: string;
  ErrorDesc: string;
}

export interface ApiResponseWithErrors {
  ErrorCodeList?: ApiErrorItem[];
  ErrorDetails?: ApiErrorItem[];
  SuccessCode?: string;
  ServiceStatus?: string;
  [key: string]: any;
}

export const SPECIAL_ERROR_CODES = {
  TOKEN_EXPIRED: 'ERR001',
  SESSION_EXPIRED: 'ERR002',
  UNAUTHORIZED: 'ERR003',
} as const;

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

export interface ErrorHandlerConfig {
  showToasts?: boolean;
  redirectOnTokenExpired?: boolean;
  customErrorMessages?: Record<string, string>;
  suppressErrorCodes?: string[];
}

export function extractApiErrors(response: ApiResponseWithErrors): ApiErrorItem[] {
  const errors: ApiErrorItem[] = [];

  if (response?.ErrorCodeList && Array.isArray(response.ErrorCodeList)) {
    errors.push(...response.ErrorCodeList.filter(error =>
      error &&
      (error.ErrorCode || error.ErrorDesc) &&
      !(error.ErrorCode === "" && error.ErrorDesc === "")
    ));
  }

  if (response?.ErrorDetails && Array.isArray(response.ErrorDetails)) {
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

export function hasApiErrors(response: ApiResponseWithErrors): boolean {
  return extractApiErrors(response).length > 0;
}

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

  if (errors.length === 0) {
    return;
  }

  // Deduplicate error messages by ErrorDesc (and ErrorCode for safety)
  const shownMessages = new Set<string>();
  errors.forEach((error) => {
    const { ErrorCode, ErrorDesc } = error;

    const isSuppressed = SUPPRESSED_ERROR_CODES.includes(ErrorCode as any) ||
      suppressErrorCodes.includes(ErrorCode);

    if (ErrorCode === SPECIAL_ERROR_CODES.TOKEN_EXPIRED && redirectOnTokenExpired) {
      if (showToasts && !isSuppressed && !shownMessages.has("TOKEN_EXPIRED")) {
        console.log("[handleApiErrors] Showing toast for TOKEN_EXPIRED");
        toast.error("The Token Is Expired");
        shownMessages.add("TOKEN_EXPIRED");
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

    const errorMessage = customErrorMessages[ErrorCode] || ErrorDesc;
    const dedupKey = (errorMessage || "") + "::" + (ErrorCode || "");
    if (errorMessage && showToasts && !isSuppressed && !shownMessages.has(dedupKey)) {
      console.log(`[handleApiErrors] Showing toast for error:`, { errorMessage, ErrorCode });
      toast.error(errorMessage);
      shownMessages.add(dedupKey);
    }
  });
}

export function isApiResponseSuccessful(response: ApiResponseWithErrors): boolean {
  const hasSuccessCode = response?.SuccessCode === "200";
  const hasSuccessStatus = response?.ServiceStatus === "Success";

  const hasNoErrors = !hasApiErrors(response);

  return (hasSuccessCode || hasSuccessStatus) && hasNoErrors;
}

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

export function handleApiResponse(
  response: ApiResponseWithErrors,
  config: ErrorHandlerConfig = {}
): boolean {
  if (hasApiErrors(response)) {
    handleApiErrors(response, config);
    return false;
  }

  return isApiResponseSuccessful(response);
} 