import { TokenClaims } from '@/features/login/components/AuthProvider';
import { APIError } from '@/features/manage-hearings/types';
import { createApi, fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError, FetchBaseQueryMeta } from '@reduxjs/toolkit/query/react';
import cookie from "react-cookies";
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { startLoading, stopLoading } from '@/redux/slices/loadingSlice';

const handleApiResponse = (result: any, args: string | FetchArgs) => {
  const url = typeof args === 'string' ? args : args.url;

  // Don't toast for NIC details errors, they are handled by a modal in AuthProvider
  if (url?.includes('GetNICDetails')) {
    return;
  }
  const errorDetails = result?.data?.ErrorDetails;
  const errorCodeList = result?.data?.ErrorCodeList;

  if (errorDetails && Array.isArray(errorDetails) && errorDetails.length > 0) {
    errorDetails.forEach((error: { ErrorCode: string, ErrorDesc: string }) => {
      if (error.ErrorCode === "ERR001") {
        toast.error("The Token Is Expired");
        setTimeout(() => {
          if (process.env.VITE_LOGIN_SWITCH === "true") {
            window.location.href = `${process.env.VITE_REDIRECT_URL_LOCAL}`;
          } else {
            window.location.href = `${process.env.VITE_REDIRECT_URL}`;
          }
        }, 2000);
      } else if (error.ErrorDesc) {
        toast.error(error.ErrorDesc);
      }
    });
  }

  if (errorCodeList && Array.isArray(errorCodeList) && errorCodeList.length > 0) {
    errorCodeList.forEach((error: { ErrorCode: string, ErrorDesc: string }) => {
      if (error.ErrorDesc) {
        toast.error(error.ErrorDesc);
      }
    });
  }
};

const customBaseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError, {}, FetchBaseQueryMeta> = async (args, api, extraOptions) => {
  // Start loading
  api.dispatch(startLoading());

  try {
    const result = await fetchBaseQuery({
      baseUrl: process.env.VITE_API_URL,
      prepareHeaders: (headers) => {
        // const username = process.env.VITE_API_USERNAME;
        // const password = process.env.VITE_API_PASSWORD;
        // const encodedCredentials = btoa(`${username}:${password}`);

        // Token Should Be Send In The Header
        headers.set('Content-Type', 'application/json');
        // if (encodedCredentials) {
        //   headers.set('Authorization', `Basic ${encodedCredentials}`);
        // }
        // Token Should Be Send In The Header
        const token = cookie.load("token");
        if (token) {
          headers.set('accesstoken', `${token}`);
        }
        const oauthToken = cookie.load("oauth_token"); // The new OAuth token
        if (oauthToken) {
          headers.set('Authorization', `Bearer ${oauthToken}`);
        }


        // the scurity fixed 
        // const accessToken = cookie.load("access_token");
        // if (accessToken ) {
        //   headers.set('Authorization', `${accessToken}`);
        // }



        return headers;
      },
    })(args, api, extraOptions);

    // handleApiResponse(result, args);
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
  const userTypeOrdinary = cookie.load('userType');
  const mainCategory = cookie.load("mainCategory")?.value;
  const subCategory = cookie.load("subCategory")?.value;
  const userID = cookie.load("userClaims").UserID;
  const fileNumber = cookie.load("userClaims")?.File_Number;

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
        UserType?: string;
        FileNumber?: string;
        MainGovernment?: string;
        SubGovernment?: string;
      } = {
        SourceSystem: "E-Services",
        IDNumber: userClaims?.UserID,
        AcceptedLanguage: userClaims?.AcceptedLanguage?.toUpperCase() || 'EN',
        UserType: userTypeOrdinary
      };

      // Only add PlaintiffId for Worker and Agent user types
      if (userType === 'worker' || userType === 'agent' || userType === "embassy user") {
        commonParams.PlaintiffId = userClaims?.UserID;
      }

      // Add FileNumber for Establishment user type
      if (userTypeOrdinary === "Establishment" && fileNumber) {
        commonParams.FileNumber = fileNumber;
      }

      // Add MainGovernment and SubGovernment for Legal representative user type
      if (userTypeOrdinary === "Legal representative" && mainCategory && subCategory) {
        commonParams.MainGovernment = mainCategory;
        commonParams.SubGovernment = subCategory;
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
        UserType?: string;
        FileNumber?: string;
        MainGovernment?: string;
        SubGovernment?: string;
      } = {
        SourceSystem: "E-Services",
        IDNumber: userClaims?.UserID,
        AcceptedLanguage: userClaims?.AcceptedLanguage?.toUpperCase() || 'EN',
        // UserType: userTypeOrdinary
      };

      // Only add PlaintiffId for Worker and Agent user types
      if (userType === 'worker' || userType === 'agent' || userType === "embassy user") {
        commonParams.PlaintiffId = userClaims?.UserID;
      }

      // Add FileNumber for Establishment user type
      if (userTypeOrdinary === "Establishment" && fileNumber) {
        commonParams.FileNumber = fileNumber;
      }

      // Add MainGovernment and SubGovernment for Legal representative user type
      if (userTypeOrdinary === "Legal representative" && mainCategory && subCategory) {
        commonParams.MainGovernment = mainCategory;
        commonParams.SubGovernment = subCategory;
      }

      args.params = {
        ...args.params,
        ...commonParams,
      };
    }
  }

  // console.log("this is from transformRequest", args);
  return args;
};

// const tokenQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError, {}, FetchBaseQueryMeta> = async (args, api, extraOptions) => {
//   // Start loading
//   api.dispatch(startLoading());

//   try {
//     const result = await fetchBaseQuery({
//       baseUrl: process.env.VITE_API_URL,
//       prepareHeaders: (headers) => {

//         headers.set('Content-Type', 'application/x-www-form-urlencoded');

//         return headers;
//       },
//       body: new URLSearchParams({
//         client_id: process.env.VITE_OAUTH_CLIENT_ID || '13214757724497106741',
//         client_secret: process.env.VITE_OAUTH_CLIENT_SECRET || '77059AC65D87323D8149F51193E978D0',
//         grant_type: process.env.VITE_OAUTH_GRANT_TYPE || 'client_credentials'
//       })
//     })(args, api, extraOptions);

//     // handleApiResponse(result, args);
//     if (result.error) {
//       try {
//         handleApiError(result.error);
//       } catch (error) {
//         // Dispatch the error to your global error state if needed
//         api.dispatch({
//           type: 'api/globalError',
//           payload: error,
//         });
//         throw error;
//       }
//     }

//     return result;
//   } finally {
//     // Stop loading regardless of success or failure
//     api.dispatch(stopLoading());
//   }
// };

const tokenQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError, {}, FetchBaseQueryMeta> = async (_args, api, extraOptions) => {
  api.dispatch(startLoading());

  try {
    const result = await fetchBaseQuery({
      baseUrl: 'http://localhost:5000', // Node.js backend proxy
      prepareHeaders: (headers) => {
        headers.set('Content-Type', 'application/json');
        return headers;
      },
    })({ url: '/api/get-token', method: 'POST' }, api, extraOptions);

    if (result.error) {
      try {
        handleApiError(result.error);
      } catch (error) {
        api.dispatch({ type: 'api/globalError', payload: error });
        throw error;
      }
    }

    return result;
  } finally {
    api.dispatch(stopLoading());
  }
};


export const api = createApi({
  baseQuery: (args, api, extraOptions) => {
    if (args?.url?.includes("token")) {
      console.log("this is token ", args?.url);
      return tokenQuery(args, api, extraOptions)
    }
    const transformedArgs = transformRequest(typeof args === 'string' ? { url: args } : args);
    return customBaseQuery(transformedArgs, api, extraOptions);
  },
  keepUnusedDataFor: 60,
  tagTypes: [''],
  endpoints: () => ({}),
});

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