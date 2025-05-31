import { ReactNode, Suspense, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCookieState } from "@/features/initiate-hearing/hooks/useCookieState";
import {
  GetUserTypeResponce,
  useLazyGetUserTypeLegalRepQuery,
} from "../api/loginApis";
import Loader from "@/shared/components/loader";
import { useTranslation } from "react-i18next";
import { useLanguageDirection } from "@/shared/hooks/useLanguageDirection";
import { NICDetailsParams } from "@/features/initiate-hearing/components/hearing-details/hearing.details.types";
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
  popupHandler: () => void;
  popuoStablishment: () => void;
  setIsLegalRep: (value: boolean) => void;
}
 
const LazyLoader = ({ children }: { children: ReactNode }) => (
  <Suspense fallback={<Loader />}>{children}</Suspense>
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
    UserType: claims?.UserType,
    aud: claims?.aud,
    exp: claims?.exp,
    iat: claims?.iat,
    iss: claims?.iss
  };
}
 
const AuthProvider: React.FC<AuthProviderProps> = ({ children, popupHandler, popuoStablishment, setIsLegalRep }) => {
  const [searchParams] = useSearchParams();
  const [userClaims, setUserClaims] = useState<TokenClaims>();
  const [getCookie, setCookie, removeCookie, removeAll] = useCookieState({}, { path: "/", maxAge: 86400 });
  const [showNICError, setShowNICError] = useState(false);
  const [nicErrorMessage, setNicErrorMessage] = useState("");
 
  const [triggerGetUserType, { data: userTypeLegalRepData, isFetching }] =
    useLazyGetUserTypeLegalRepQuery();
 
  const [triggerGetNICDetailsQuery, { data: nicData, isFetching: nicIsLoading, error: nicError }] = useLazyGetNICDetailsQuery();
 
  const navigate = useNavigate();
  const [isEstablishment, setIsIstablishment] = useState<boolean>(false);
  const { isRTL } = useLanguageDirection();
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language.toUpperCase();
 
 
  useEffect(() => {
    const tokenFromURL = searchParams.get("MyClientsToken");
 
    if (tokenFromURL) {
      setCookie("token", tokenFromURL);
      const claims = formatDateOfbarth(decodeToken(tokenFromURL));
      if (claims?.AcceptedLanguage) {
        const language = claims.AcceptedLanguage.toLocaleLowerCase();
        i18n.changeLanguage(language).then(() => {
          localStorage.setItem("language", language);
          document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
        });
      }
 
      if (claims) {
        claims.UserType = claims.UserType === "EstablishmentUser" ? "1" : "2";
        // if the user is establishment
        if (claims.File_Number) {
          setIsIstablishment(true);
          popuoStablishment();
          setCookie("userType", "Establishment");
        } else {
          fetchUserType(claims);
          getNICData(claims?.UserID, claims.UserDOB)
        }
        removeCookie("userClaims");
        setUserClaims(claims);
        setCookie("userClaims", claims);
      } else {
        removeAll();
        window.location.href = `${process.env.VITE_REDIRECT_URL}`;
        //navigate("login");
      }
    } else {
      const storedClaims = getCookie("userClaims");
      if (shouldUseStoredClaims(storedClaims)) {
        setUserClaims(storedClaims);
        if (!storedClaims.File_Number) {
          setIsIstablishment(false);
          fetchUserType(storedClaims);
          getNICData(storedClaims?.UserID, storedClaims.UserDOB)
        } else {
          setCookie("userType", "Establishment");
          setIsIstablishment(true);
          popuoStablishment();
        }
      } else {
        removeAll();
        window.location.href = `${process.env.VITE_REDIRECT_URL}`;
        //navigate("login");
      }
    }
  }, []);
 
  const fetchUserType = (claims: TokenClaims) => {
 
    triggerGetUserType({
      IDNumber: claims.UserID,
      UserType: claims.UserType,
      AcceptedLanguage: isRTL ? "AR" : "EN",
      SourceSystem: "E-Services",
    });
  };
 
  const getNICData = (IDNumber?: string, DateOfBirth?: string,) => {
    triggerGetNICDetailsQuery({
      IDNumber: IDNumber || "",
      DateOfBirth: DateOfBirth || "",
      AcceptedLanguage: isRTL ? "AR" : "EN",
      SourceSystem: "E-Services",
    });
  }
 
  useEffect(() => {
    if (userTypeLegalRepData) {
      setCookie("storeAllUserTypeData", userTypeLegalRepData);
      const userType = extractUserType(userTypeLegalRepData);
      if (userType) {
        setCookie("userType", userType);
        setIsLegalRep(userType === "Legal representative");
      }
    }
  }, [userTypeLegalRepData]);
 
  const handleErrorResponse = (data: any) => {
    let errorMessage = "Failed to load user information";
    if (data?.ErrorDetails && Array.isArray(data.ErrorDetails)) {
      // Find the object with ErrorDesc
      const errorDesc = data.ErrorDetails.find((detail: any) => detail.ErrorDesc)?.ErrorDesc;
      if (errorDesc) {
        errorMessage = errorDesc;
      }
    }
    setNicErrorMessage(errorMessage);
    setShowNICError(true);
  };
 
  useEffect(() => {
    if (nicError) {
      const error = nicError as FetchBaseQueryError;
      let errorMessage = t("nic_error.default_error");

      if (error.status === 401) {
        errorMessage = t("nic_error.unauthorized");
        removeAll();
        window.location.href = `${process.env.VITE_REDIRECT_URL}`;
      } else if (error.status === 500) {
        errorMessage = t("nic_error.server_error");
      } else if (error.data) {
        // Handle API response errors (200 with error details)
        const errorData = error.data as any;
        if (errorData?.ErrorDetails && Array.isArray(errorData.ErrorDetails)) {
          // Find the object with ErrorDesc
          const errorDesc = errorData.ErrorDetails.find((detail: any) => detail.ErrorDesc)?.ErrorDesc;
          if (errorDesc) {
            errorMessage = errorDesc;
          }
        }
      }

      setNicErrorMessage(errorMessage);
      setShowNICError(true);
    }
  }, [nicError]);
 
  useEffect(() => {
    if (nicData) {
      // Check if the response contains error details
      if (nicData.ErrorDetails) {
        handleErrorResponse(nicData);
      } else {
        setCookie("storeAllNicData", nicData);
      }
    }
  }, [nicData]);
 
  const isLoading = !userClaims || (!isEstablishment && (isFetching || nicIsLoading));
 
 
  if (isLoading) return <Loader />;
  return (
    <>
      <LazyLoader>
        {userClaims && children}
      </LazyLoader>
      <NICErrorModal
        isOpen={showNICError}
        onClose={() => setShowNICError(false)}
        errorMessage={nicErrorMessage}
      />
    </>
  );
 
 
};
 
export default AuthProvider;