import { TokenClaims } from "@/features/auth/components/AuthProvider";
import { APIError } from "@/features/hearings/manage/types";
import {
  createApi,
  fetchBaseQuery,
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
  FetchBaseQueryMeta,
} from "@reduxjs/toolkit/query/react";
import cookie from "react-cookies";
import { startLoading, stopLoading } from "@/app/store/slices/loadingSlice";
import {
  handleApiResponse,
  ApiResponseWithErrors,
  ErrorHandlerConfig,
  hasInvalidTokenError,
} from "@/utils/api/errorHandler";

const refreshToken = async (): Promise<string | null> => {
  try {
    const clientId = process.env.VITE_OAUTH_CLIENT_ID || "";
    const clientSecret = process.env.VITE_OAUTH_CLIENT_SECRET || "";
    const grantType = process.env.VITE_OAUTH_GRANT_TYPE || "";

    if (!clientId || !clientSecret || !grantType) {
      return null;
    }

    const tokenBaseQuery = fetchBaseQuery({
      baseUrl: process.env.VITE_API_URL,
      prepareHeaders: (headers) => {
        headers.set("Content-Type", "application/x-www-form-urlencoded");
        return headers;
      },
    });

    const result = await tokenBaseQuery(
      {
        url: "/WeddiOauth2/v1/token",
        method: "POST",
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: grantType,
        }),
      },
      {
        signal: new AbortController().signal,
        dispatch: () => {},
        getState: () => ({}),
        extra: undefined,
        type: "query",
        endpoint: "refreshToken",
        abort: () => {},
      },
      {},
    );

    if (
      result.data &&
      typeof result.data === "object" &&
      "access_token" in result.data
    ) {
      const tokenData = result.data as {
        access_token: string;
        expires_in: number;
      };

      cookie.save("oauth_token", tokenData.access_token, {
        path: "/",
        maxAge: 86400,
      });

      const customExpiresIn = 50 * 60;
      const expiresAt = Date.now() + customExpiresIn * 1000;
      cookie.save("oauth_token_expires_at", expiresAt.toString(), {
        path: "/",
        maxAge: 86400,
      });

      return tokenData.access_token;
    } else {
    }
  } catch (error) {}

  return null;
};

const handleApiResponseLegacy = (
  result: any,
  args: string | FetchArgs,
  suppressInvalidToken = false,
) => {
  const url = typeof args === "string" ? args : args.url;

  if (url?.includes("GetNICDetails")) {
    return;
  }

  if (result?.data) {
    const config: ErrorHandlerConfig = {
      showToasts: true,
      redirectOnTokenExpired: true,

      customErrorMessages: url?.includes("GetNICDetails") ? {} : undefined,

      suppressErrorCodes: suppressInvalidToken ? ["invalid_token"] : [],
    };

    handleApiResponse(result.data as ApiResponseWithErrors, config);
  }
};

const customBaseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError,
  {},
  FetchBaseQueryMeta
> = async (args, api, extraOptions) => {
  api.dispatch(startLoading());

  try {
    let result = await fetchBaseQuery({
      baseUrl: process.env.VITE_API_URL,
      prepareHeaders: (headers) => {
        headers.set("Content-Type", "application/json");

        const token = cookie.load("token");
        if (token) {
          headers.set("accesstoken", `${token}`);
        }
        const oauthToken = cookie.load("oauth_token");
        if (oauthToken) {
          headers.set("Authorization", `Bearer ${oauthToken}`);
        }

        return headers;
      },
    })(args, api, extraOptions);

    const isJsonInvalidToken =
      result.data && hasInvalidTokenError(result.data as ApiResponseWithErrors);
    const isHttpUnauthorized =
      result.error &&
      (result.error.status === 401 || result.error.status === 403);

    if (isJsonInvalidToken || isHttpUnauthorized) {
      const newToken = await refreshToken();

      if (newToken) {
        result = await fetchBaseQuery({
          baseUrl: process.env.VITE_API_URL,
          prepareHeaders: (headers) => {
            headers.set("Content-Type", "application/json");
            const token = cookie.load("token");
            if (token) {
              headers.set("accesstoken", `${token}`);
            }

            headers.set("Authorization", `Bearer ${newToken}`);
            return headers;
          },
        })(args, api, extraOptions);

        if (result.data) {
          handleApiResponseLegacy(result, args, true);
        }
      } else {
      }
    } else {
      if (result.data) {
        handleApiResponseLegacy(result, args);
      }
    }

    if (result.error && !result.data) {
      try {
        handleApiError(result.error);
      } catch (error) {
        api.dispatch({
          type: "api/globalError",
          payload: error,
        });
        throw error;
      }
    }

    return result;
  } finally {
    api.dispatch(stopLoading());
  }
};

const transformRequest = (args: FetchArgs): FetchArgs => {
  const userClaims = cookie.load("userClaims") as TokenClaims;
  const isNICDetailsRequest = args.url?.includes("GetNICDetails");
  const isIncompleteCaseRequest = args.url?.includes("GetIncompleteCase");
  const userType = userClaims?.UserType?.toLowerCase();
  const userTypeOrdinary = cookie.load("userType");
  const mainCategory = cookie.load("mainCategory")?.value;
  const subCategory = cookie.load("subCategory")?.value;
  const fileNumber = cookie.load("userClaims")?.File_Number;

  const language = userClaims.AcceptedLanguage?.toUpperCase() || "EN";

  if (isIncompleteCaseRequest && !userClaims?.UserID) {
    throw new Error("User claims not available");
  }

  if (isNICDetailsRequest) {
    if (args.params) {
      args.params = {
        ...args.params,
        LoggedInUserID: userClaims?.UserID,
        SourceSystem: "E-Services",
        AcceptedLanguage: language,
      };
    }
    return args;
  }

  if (
    args.method === "POST" ||
    args.method === "PUT" ||
    args.method === "PATCH"
  ) {
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
        AcceptedLanguage: language,
        UserType: userTypeOrdinary,
      };

      if (
        userType === "worker" ||
        userType === "agent" ||
        userType === "embassy user"
      ) {
        commonParams.PlaintiffId = userClaims?.UserID;
      }

      if (userTypeOrdinary === "Establishment" && fileNumber) {
        commonParams.FileNumber = fileNumber;
      }

      if (
        userTypeOrdinary === "Legal representative" &&
        mainCategory &&
        subCategory
      ) {
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
        AcceptedLanguage?: string;
        UserType?: string;
        FileNumber?: string;
        MainGovernment?: string;
        SubGovernment?: string;
      } = {
        SourceSystem: "E-Services",
        IDNumber: userClaims?.UserID,

        ...(args.params.AcceptedLanguage ? {} : { AcceptedLanguage: language }),
      };

      if (
        userType === "worker" ||
        userType === "agent" ||
        userType === "embassy user"
      ) {
        commonParams.PlaintiffId = userClaims?.UserID;
      }

      if (userTypeOrdinary === "Establishment" && fileNumber) {
        commonParams.FileNumber = fileNumber;
      }

      if (
        userTypeOrdinary === "Legal representative" &&
        mainCategory &&
        subCategory
      ) {
        commonParams.MainGovernment = mainCategory;
        commonParams.SubGovernment = subCategory;
      }

      args.params = {
        ...commonParams,
        ...args.params,
      };
    }
  }

  return args;
};

const tokenQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError,
  {},
  FetchBaseQueryMeta
> = async (args, api, extraOptions) => {
  api.dispatch(startLoading());

  try {
    const result = await fetchBaseQuery({
      baseUrl: process.env.VITE_API_URL,
      prepareHeaders: (headers) => {
        headers.set("Content-Type", "application/x-www-form-urlencoded");

        return headers;
      },
      body: new URLSearchParams({
        client_id: process.env.VITE_OAUTH_CLIENT_ID || "13214757724497106741",
        client_secret:
          process.env.VITE_OAUTH_CLIENT_SECRET ||
          "77059AC65D87323D8149F51193E978D0",
        grant_type: process.env.VITE_OAUTH_GRANT_TYPE || "client_credentials",
      }),
    })(args, api, extraOptions);

    if (result.data) {
      handleApiResponseLegacy(result, args);
    }

    if (result.error) {
      try {
        handleApiError(result.error);
      } catch (error) {
        api.dispatch({
          type: "api/globalError",
          payload: error,
        });
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
      return tokenQuery(args, api, extraOptions);
    }
    const transformedArgs = transformRequest(
      typeof args === "string" ? { url: args } : args,
    );
    return customBaseQuery(transformedArgs, api, extraOptions);
  },
  keepUnusedDataFor: 60,
  tagTypes: [""],
  endpoints: () => ({}),
});

export const handleApiError = (error: unknown): never => {
  if (!error) throw new Error("Unknown error occurred");

  if (typeof error === "object" && "status" in error) {
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
