import { ReactNode, Suspense, useEffect, useState, useCallback } from "react";
import { jwtDecode } from "jwt-decode";
import { useSearchParams } from "react-router-dom";
import { useCookieState } from "@/features/initiate-hearing/hooks/useCookieState";
import {
  GetUserTypeResponce,
  useLazyGetUserTokenQuery,
  useLazyGetUserTypeLegalRepQuery,
} from "../api/loginApis";
import Loader from "@/shared/components/loader";
import { useTranslation } from "react-i18next";
import { useLanguageDirection } from "@/shared/hooks/useLanguageDirection";
import { useLazyGetNICDetailsQuery } from "@/features/initiate-hearing/api/create-case/plaintiffDetailsApis";
import { toHijri_YYYYMMDD } from "@/shared/lib/helpers";
import NICErrorModal from "@/shared/components/modal/NICErrorModal";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";

export interface TokenClaims {
  AcceptedLanguage?: string;
  File_Number?: string;
  UserDOB?: string;
  UserID?: string;
  UserName?: string;
  UserType?: string;
  aud?: string;
  exp?: number;
  iat?: number;
  iss?: string;
}

interface AuthProviderProps {
  children: ReactNode;
  setIsLegalRep: (value: boolean) => void;
  setIsEstablishment: (value: boolean) => void;
  setUserTypeState: (value: string) => void;
}

const LazyLoader = ({ children }: { children: ReactNode }) => (
  <Suspense fallback={<Loader force />}>{children}</Suspense>
);

const decodeToken = (token: string): TokenClaims | null => {
  try {
    const decoded: TokenClaims = jwtDecode(token);
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < now) return null;
    return decoded;
  } catch {
    return null;
  }
};

const shouldUseStoredClaims = (claims: any): boolean => {
  if (!claims || Object.keys(claims).length === 0) return false;
  const now = Math.floor(Date.now() / 1000);
  return claims.exp && claims.exp >= now;
};

const extractUserType = (res: GetUserTypeResponce): string | undefined =>
  res?.UserTypeList?.[0]?.UserType;

const formatDateOfbarth = (claims: TokenClaims | null): TokenClaims | null => {
  return {
    AcceptedLanguage: claims?.AcceptedLanguage,
    File_Number: claims?.File_Number,
    UserDOB: toHijri_YYYYMMDD(claims?.UserDOB || ""),
    UserID: claims?.UserID,
    UserName: claims?.UserName,
    UserType: claims?.UserType === "EstablishmentUser" ? "1" : "2",
    aud: claims?.aud,
    exp: claims?.exp,
    iat: claims?.iat,
    iss: claims?.iss,
  };
};

const AuthProvider: React.FC<AuthProviderProps> = ({
  children,
  setIsLegalRep,
  setIsEstablishment,
  setUserTypeState,
}) => {
  const [searchParams] = useSearchParams();
  const [getCookie, setCookie, , removeAll] = useCookieState(
    {},
    { path: "/", maxAge: 86400 },
  );
  const [showNICError, setShowNICError] = useState(false);
  const [nicErrorMessage, setNicErrorMessage] = useState("");
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const [triggerGetUserType, { data: userTypeLegalRepData }] =
    useLazyGetUserTypeLegalRepQuery();

  const [
    triggerGetNICDetailsQuery,
    { data: nicData, isFetching: nicIsLoading, error: nicError },
  ] = useLazyGetNICDetailsQuery();

  const [triggerGetToken, { isFetching: isTokenFetching }] =
    useLazyGetUserTokenQuery();
  const [isTokenReady, setIsTokenReady] = useState(false);

  const checkAndFetchToken = useCallback(async () => {
    const tokenExpiresAt = getCookie("oauth_token_expires_at");
    const parsedExpiresAt = tokenExpiresAt ? parseInt(tokenExpiresAt, 10) : 0;

    const shouldRefreshToken =
      !parsedExpiresAt || Date.now() > parsedExpiresAt - 5 * 60 * 1000;

    if (shouldRefreshToken) {
      const tokenData = await triggerGetToken().unwrap();
      setCookie("oauth_token", tokenData.access_token);

      const customExpiresIn = 50 * 60;
      const expiresAt = Date.now() + customExpiresIn * 1000;

      setCookie("oauth_token_expires_at", expiresAt.toString());
    }
  }, [getCookie, setCookie, triggerGetToken]);

  useEffect(() => {
    const initialize = async () => {
      await checkAndFetchToken();
      setIsTokenReady(true);
    };
    initialize().catch((error) => {
      console.error("Failed to initialize token", error);
      setIsTokenReady(false);
    });
  }, [checkAndFetchToken]);

  useEffect(() => {
    if (!isTokenReady) return;

    const intervalId = setInterval(checkAndFetchToken, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [isTokenReady, checkAndFetchToken]);

  useEffect(() => {
    if (!isTokenReady) return;

    const initializeUserSession = async () => {
      try {
        const tokenFromURL = searchParams.get("MyClientsToken");
        if (tokenFromURL) {
          const decodedToken = decodeToken(tokenFromURL);
          if (!decodedToken) {
            return;
          }

          const claims = formatDateOfbarth(decodedToken);
          if (claims?.AcceptedLanguage) {
            const language = claims.AcceptedLanguage.toUpperCase();
            i18n.changeLanguage(language.toLowerCase()).then(() => {
              localStorage.setItem("language", language.toLowerCase());
              document.documentElement.dir =
                language.toLowerCase() === "ar" ? "rtl" : "ltr";
            });
          }

          setCookie("userClaims", claims);
          setCookie("token", tokenFromURL);

          if (claims) {
            claims.UserType =
              claims.UserType === "EstablishmentUser" ? "1" : "2";

            if (!claims.File_Number) {
              await Promise.all([
                fetchUserType(claims),
                getNICData(claims.UserID, claims.UserDOB),
              ]);
            } else {
              setCookie("userType", "Establishment");
              setIsEstablishment(true);
            }
          } else {
          }
        } else {
          const storedClaims = getCookie("userClaims");
          if (shouldUseStoredClaims(storedClaims)) {
            if (!storedClaims.File_Number) {
              setIsEstablishment(false);
              const selectedUserType = getCookie("selectedUserType");
              if (selectedUserType) {
                setCookie("userType", selectedUserType);
                setIsLegalRep(selectedUserType === "Legal representative");
              } else {
                const storedUserType = getCookie("storeAllUserTypeData");
                if (!storedUserType) {
                  await Promise.all([
                    fetchUserType(storedClaims),
                    getNICData(storedClaims.UserID, storedClaims.UserDOB),
                  ]);
                }
              }
            } else {
              setCookie("userType", "Establishment");
              setIsEstablishment(true);
            }
          } else {
          }
        }
      } catch (error) {
        console.error("Failed to initialize user session", error);
      } finally {
        setIsDataLoaded(true);
      }
    };
    initializeUserSession();
  }, [isTokenReady]);

  useEffect(() => {
    if (!isTokenReady) return;

    const storedClaims = getCookie("userClaims");
    if (!shouldUseStoredClaims(storedClaims)) {
      window.location.href = process.env.VITE_REDIRECT_URL || "";
      return;
    }
  }, [isTokenReady]);

  const { isRTL } = useLanguageDirection();
  const { t, i18n } = useTranslation();

  const handleErrorResponse = (data: any) => {
    let errorMessage = "Failed to load user information";
    if (data?.ErrorDetails && Array.isArray(data.ErrorDetails)) {
      const errorDesc = data.ErrorDetails.find(
        (detail: any) => detail.ErrorDesc,
      )?.ErrorDesc;
      if (errorDesc) {
        errorMessage = errorDesc;
      }
    }
    setNicErrorMessage(errorMessage);
    setShowNICError(true);
  };

  const fetchUserType = async (claims: TokenClaims) => {
    if (!claims.UserID || !claims.UserType) {
      return;
    }
    return await triggerGetUserType({
      IDNumber: claims.UserID!,
      UserRequestType: claims.UserType!,
      SourceSystem: "E-Services",
    }).unwrap();
  };

  const getNICData = async (IDNumber?: string, DateOfBirth?: string) => {
    if (!IDNumber || !DateOfBirth) {
      return;
    }
    return await triggerGetNICDetailsQuery({
      IDNumber: IDNumber,
      DateOfBirth: DateOfBirth,
      AcceptedLanguage: isRTL ? "AR" : "EN",
      SourceSystem: "E-Services",
    }).unwrap();
  };

  useEffect(() => {
    if (userTypeLegalRepData) {
      setCookie("storeAllUserTypeData", userTypeLegalRepData);
      const selectedUserType = getCookie("selectedUserType");
      if (!selectedUserType) {
        const userType = extractUserType(userTypeLegalRepData);
        if (userType) {
          setCookie("userType", userType);
          setIsLegalRep(userType === "Legal representative");
          setUserTypeState(userType);

          if (userType === "Legal representative") {
            setCookie("originalUserType", "Legal representative");
          }
        }
      }
    }
  }, [userTypeLegalRepData]);

  useEffect(() => {
    if (nicData) {
      if (
        "ErrorDetails" in nicData &&
        Array.isArray((nicData as any).ErrorDetails)
      ) {
        handleErrorResponse(nicData);
      } else {
        setCookie("storeAllNicData", nicData);
        setCookie("nicDetailObject", nicData);
      }
    }
  }, [nicData]);

  useEffect(() => {
    if (nicError) {
      const error = nicError as FetchBaseQueryError;
      let errorMessage = t("nic_error.default_error");

      if (error.status === 401) {
        errorMessage = t("nic_error.unauthorized");
        removeAll();
      } else if (error.status === 500) {
        errorMessage = t("nic_error.server_error");
      } else if (error.data) {
        const errorData = error.data as any;
        if (errorData?.ErrorDetails && Array.isArray(errorData.ErrorDetails)) {
          const errorDesc = errorData.ErrorDetails.find(
            (detail: any) => detail.ErrorDesc,
          )?.ErrorDesc;
          if (errorDesc) {
            errorMessage = errorDesc;
          }
          setIsDataLoaded(true);
        }
      }

      setNicErrorMessage(errorMessage);
      setShowNICError(true);
    }
  }, [nicError, removeAll, t]);

  if (!isTokenReady || isTokenFetching || !isDataLoaded || nicIsLoading) {
    return <Loader force />;
  }

  return (
    <>
      <LazyLoader>{children}</LazyLoader>
      <NICErrorModal
        isOpen={showNICError}
        onClose={() => setShowNICError(false)}
        errorMessage={nicErrorMessage}
      />
    </>
  );
};

export default AuthProvider;
