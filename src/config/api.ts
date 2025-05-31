import { TokenClaims } from '@/features/login/components/AuthProvider';
import { APIError } from '@/features/manage-hearings/types';
import { createApi, fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError, FetchBaseQueryMeta } from '@reduxjs/toolkit/query/react';
import cookie from "react-cookies";
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

const customBaseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError, {}, FetchBaseQueryMeta> = async (args, api, extraOptions) => {
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
};

const transformRequest = (args: FetchArgs): FetchArgs => {

  const isNICDetailsEndpoint = typeof args.url === 'string' && args.url.includes('GetNICDetails');

  if (isNICDetailsEndpoint) {
    return args;
  }


  if (args.method === 'POST' || args.method === 'PUT' || args.method === 'PATCH') {
    if (typeof args.body === 'object' && args.body !== null) {
      const userClaims: TokenClaims = cookie.load("userClaims");

      const bodyExtras: Record<string, string> = {
        SourceSystem: "E-Services",
      };

      if (userClaims?.UserID) {
        bodyExtras.IDNumber = userClaims.UserID;
      }

      if (userClaims?.File_Number) {
        bodyExtras.FileNumber = userClaims.File_Number;
      }

      return {
        ...args,
        body: {
          ...args.body,
          ...bodyExtras,
        },
      };
    }
  } else {

    //console.log("kdslksdjfl");
    //console.log("kdslksdjfl", args.params);
    const userClaims: TokenClaims = cookie.load("userClaims");

    const bodyExtras: Record<string, string> = {
      SourceSystem: "E-Services",
    };

    if (userClaims?.UserID) {
      bodyExtras.IDNumber = userClaims.UserID;
    }

    if (userClaims?.File_Number) {
      bodyExtras.FileNumber = userClaims.File_Number;
    }

    return {
      ...args,
      params: {
        ...args.params,
        ...bodyExtras
      }
    }

  };
  return args;

}

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