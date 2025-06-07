import { TokenClaims } from '@/features/login/components/AuthProvider';
import { APIError } from '@/features/manage-hearings/types';
import { createApi, fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError, FetchBaseQueryMeta } from '@reduxjs/toolkit/query/react';
import cookie from "react-cookies";
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { startLoading, stopLoading } from '@/redux/slices/loadingSlice';

const customBaseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError, {}, FetchBaseQueryMeta> = async (args, api, extraOptions) => {
  // Start loading
  api.dispatch(startLoading());

  try {
    const result = await fetchBaseQuery({
      baseUrl: process.env.VITE_API_URL,
      prepareHeaders: (headers) => {
        const username = process.env.VITE_API_USERNAME;
        const password = process.env.VITE_API_PASSWORD;
        const encodedCredentials = btoa(`${username}:${password}`);

        // Token Should Be Send In The Header
        headers.set('Content-Type', 'application/json');
        if (encodedCredentials) {
          headers.set('Authorization', `Basic ${encodedCredentials}`);
        }
        // Token Should Be Send In The Header
        const token = cookie.load("token");
        if (token) {
          headers.set('accesstoken', `${token}`);
        }

        return headers;
      },
    })(args, api, extraOptions);

    handleAuthTokenError(result);
    if (result.error) {
      try {
        handleApiError(result.error);
      } catch (error) {
        // Dispatch the error to your global error state if needed
        api.dispatch({
          type: 'api/globalError',
          payload: error,
        });
        throw error;
      }
    }

    return result;
  } finally {
    // Stop loading regardless of success or failure
    api.dispatch(stopLoading());
  }
};

const transformRequest = (args: FetchArgs): FetchArgs => {
  const userClaims = cookie.load("userClaims") as TokenClaims;
  const isNICDetailsRequest = args.url?.includes('GetNICDetails');
  const isIncompleteCaseRequest = args.url?.includes('GetIncompleteCase');
  const userType = userClaims?.UserType?.toLowerCase();

  // Skip incomplete case request if userClaims is not available
  if (isIncompleteCaseRequest && !userClaims?.UserID) {
    throw new Error("User claims not available");
  }

  // For NIC details API, add LoggedInUserID while preserving original IDNumber
  if (isNICDetailsRequest) {
    if (args.params) {
      args.params = {
        ...args.params,
        LoggedInUserID: userClaims?.UserID,
        SourceSystem: "E-Services",
        AcceptedLanguage: userClaims?.AcceptedLanguage?.toUpperCase() || 'EN',
      };
    }
    return args;
  }

  // For all other requests, add common parameters
  if (args.method === 'POST' || args.method === 'PUT' || args.method === 'PATCH') {
    if (args.body) {
      const commonParams: {
        SourceSystem: string;
        IDNumber?: string;
        PlaintiffId?: string;
        AcceptedLanguage: string;
      } = {
        SourceSystem: "E-Services",
        IDNumber: userClaims?.UserID,
        AcceptedLanguage: userClaims?.AcceptedLanguage?.toUpperCase() || 'EN',
      };

      // Only add PlaintiffId for Worker and Agent user types
      if (userType === 'worker' || userType === 'agent') {
        commonParams.PlaintiffId = userClaims?.UserID;
      }

      args.body = {
        ...args.body,
        ...commonParams,
      };
    }
  } else {
    if (args.params) {
      const commonParams: {
        SourceSystem: string;
        IDNumber?: string;
        PlaintiffId?: string;
        AcceptedLanguage: string;
      } = {
        SourceSystem: "E-Services",
        IDNumber: userClaims?.UserID,
        AcceptedLanguage: userClaims?.AcceptedLanguage?.toUpperCase() || 'EN',
      };

      // Only add PlaintiffId for Worker and Agent user types
      if (userType === 'worker' || userType === 'agent') {
        commonParams.PlaintiffId = userClaims?.UserID;
      }

      args.params = {
        ...args.params,
        ...commonParams,
      };
    }
  }

  return args;
};

export const api = createApi({
  baseQuery: (args, api, extraOptions) => {
    const transformedArgs = transformRequest(typeof args === 'string' ? { url: args } : args);
    return customBaseQuery(transformedArgs, api, extraOptions);
  },
  keepUnusedDataFor: 60,
  tagTypes: [''],
  endpoints: () => ({}),
});


const handleAuthTokenError = (result: any) => {

  // const { t } = useTranslation("translation");

  if (result?.data?.ErrorDetails?.[0]?.ErrorCode === "ERR001") {
    toast.error("The Token Is Expired");
    setTimeout(() => {
      if (process.env.VITE_LOGIN_SWITCH === "true") {
        window.location.href = `${process.env.VITE_REDIRECT_URL_LOCAL}`;
      } else {
        window.location.href = `${process.env.VITE_REDIRECT_URL}`;
      }
    }, 2000);
  }
  // else {
    // if (result?.data?.ErrorCodeList?.[0]?.ErrorCode) {
    //   toast.error(result?.data?.ErrorCodeList?.[0]?.ErrorDesc);
    // }
    // else if (result?.data?.ErrorCodeList?.[0]?.ErrorCode === "" && result?.data?.ErrorCodeList?.[0]?.ErrorDesc) {
    //   toast.dismiss();
    //   toast.success("success");
    // }
  // }
}


export const handleApiError = (error: unknown): never => {

  if (!error) throw new Error("Unknown error occurred");

  if (typeof error === 'object' && 'status' in error) {
    const apiError = error as APIError;

    let errorMessage = `Error ${apiError.originalStatus ?? "Unknown"}`;

    if (typeof apiError.data === "string") {
      errorMessage = apiError.data;
    } else if (apiError.error) {
      errorMessage = apiError.error;
    }

    throw new Error(errorMessage);
  }

  throw new Error("Unexpected API error");
};