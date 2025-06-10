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
  const [userClaims, setUserClaims] = useState<TokenClaims | null>(null);
  const [getCookie, setCookie, removeCookie, removeAll] = useCookieState({}, { path: "/", maxAge: 86400 });
  const [showNICError, setShowNICError] = useState(false);
  const [nicErrorMessage, setNicErrorMessage] = useState("");
  const [isNICValidated, setIsNICValidated] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const [triggerGetUserType, { data: userTypeLegalRepData, isFetching }] =
    useLazyGetUserTypeLegalRepQuery();

  const [triggerGetNICDetailsQuery, { data: nicData, isFetching: nicIsLoading, error: nicError }] = useLazyGetNICDetailsQuery();

  const navigate = useNavigate();
  const [isEstablishment, setIsIstablishment] = useState<boolean>(false);
  const { isRTL } = useLanguageDirection();
  const { t, i18n } = useTranslation();

  const handleErrorResponse = (data: any) => {
    try {
      let errorMessage = "Failed to load user information";
      if (data?.ErrorDetails && Array.isArray(data.ErrorDetails)) {
        const errorDesc = data.ErrorDetails.find(
          (detail: any) => detail.ErrorDesc
        )?.ErrorDesc;
        if (errorDesc) {
          errorMessage = errorDesc;
        }
      }
      setNicErrorMessage(errorMessage);
      setShowNICError(true);
    } catch (error) {
      console.error("Error in handleErrorResponse:", error);
    }
  };

  const getNICData = (IDNumber?: string, DateOfBirth?: string) => {
    try {
      // console.log("Getting NIC data for:", IDNumber, DateOfBirth);
      // console.log("Current userClaims:", userClaims);
      if (!IDNumber || !DateOfBirth || !userClaims?.UserID) {
        console.error("Missing required NIC data:", { IDNumber, DateOfBirth, userClaims });
        return;
      }
      // console.log("Triggering NIC API call with:", {
      //   IDNumber,
      //   DateOfBirth,
      //   AcceptedLanguage: isRTL ? "AR" : "EN",
      //   SourceSystem: "E-Services"
      // });
      triggerGetNICDetailsQuery({
        IDNumber: IDNumber,
        DateOfBirth: DateOfBirth,
        AcceptedLanguage: isRTL ? "AR" : "EN",
        SourceSystem: "E-Services",
      });
    } catch (error) {
      console.error("Error in getNICData:", error);
    }
  };

  const fetchUserType = (claims: TokenClaims) => {
    try {
      // console.log("Fetching user type with claims:", claims);
      // console.log("Current userClaims:", userClaims);
      if (!claims.UserID || !userClaims?.UserID) {
        // console.error("Missing required user data:", { claims, userClaims });
        return;
      }
      // console.log("Triggering GetUserType API call with:", {
      //   IDNumber: claims.UserID,
      //   UserType: claims.UserType,
      //   AcceptedLanguage: isRTL ? "AR" : "EN",
      //   SourceSystem: "E-Services"
      // });
      triggerGetUserType({
        IDNumber: claims.UserID!,
        UserType: claims.UserType!,
        AcceptedLanguage: isRTL ? "AR" : "EN",
        SourceSystem: "E-Services",
      });
    } catch (error) {
      console.error("Error in fetchUserType:", error);
    }
  };

  // Track when this provider has mounted
  useEffect(() => {
    // console.log("AuthProvider mounted");
    setIsMounted(true);
    return () => {
      // console.log("AuthProvider unmounted");
      setIsMounted(false);
    };
  }, []);

  // MAIN AUTH EFFECT
  useEffect(() => {
    if (!isMounted) {
      // console.log("AuthProvider not yet mounted, skipping auth check");
      return;
    }

    try {
      // console.log("Starting auth check...");
      const tokenFromURL = searchParams.get("MyClientsToken");
      // console.log("Token from URL:", tokenFromURL);
      // console.log("Current cookies:", {
      //   token: getCookie("token"),
      //   userClaims: getCookie("userClaims")
      // });

      if (tokenFromURL) {
        // console.log("Token found in URL, decoding...");
        setCookie("token", tokenFromURL);
        const decodedToken = decodeToken(tokenFromURL);
        // console.log("Decoded token:", decodedToken);

        if (!decodedToken) {
          // console.error("Failed to decode token or token expired");
          removeAll();
          window.location.href = `${process.env.VITE_REDIRECT_URL}`;
          return;
        }

        const claims = formatDateOfbarth(decodedToken);
        console.log("Formatted claims:", claims);

        if (claims?.AcceptedLanguage) {
          const language = claims.AcceptedLanguage.toUpperCase();
          i18n.changeLanguage(language.toLowerCase()).then(() => {
            localStorage.setItem("language", language.toLowerCase());
            document.documentElement.dir = language.toLowerCase() === "ar" ? "rtl" : "ltr";
          });
        }

        if (claims) {
          // Convert "EstablishmentUser" → "1", else "2"
          claims.UserType = claims.UserType === "EstablishmentUser" ? "1" : "2";

          // Save claims into state + cookie first
          console.log("Setting user claims in state & cookie:", claims);
          setUserClaims(claims);
          setCookie("userClaims", claims);

          // Call both APIs in parallel
          if (!claims.File_Number) {
            console.log("Starting parallel API calls for user type and NIC validation");
            Promise.all([
              fetchUserType(claims),
              getNICData(claims.UserID, claims.UserDOB)
            ]).catch(error => {
              console.error("Error in parallel API calls:", error);
            });
          } else {
            // Establishment user flow
            setIsIstablishment(true);
            popuoStablishment();
            setCookie("userType", "Establishment");
          }
        } else {
          console.error("No valid claims found in token");
          removeAll();
          window.location.href = `${process.env.VITE_REDIRECT_URL}`;
        }
      } else {
        console.log("No token in URL, checking stored claims");
        const storedClaims = getCookie("userClaims");
        console.log("Stored claims:", storedClaims);

        if (shouldUseStoredClaims(storedClaims)) {
          console.log("Using stored claims");
          setUserClaims(storedClaims);
          if (!storedClaims.File_Number) {
            setIsIstablishment(false);
            // Check if user has already selected a type from the popup
            const selectedUserType = getCookie("selectedUserType");
            if (selectedUserType) {
              // Use the selected type instead of making a new API call
              setCookie("userType", selectedUserType);
              setIsLegalRep(selectedUserType === "Legal representative");
            } else {
              // Only fetch user type if we don't have it in cookies
              const storedUserType = getCookie("storeAllUserTypeData");
              if (!storedUserType) {
                // Call both APIs in parallel
                console.log("Starting parallel API calls for stored claims");
                Promise.all([
                  fetchUserType(storedClaims),
                  getNICData(storedClaims.UserID, storedClaims.UserDOB)
                ]).catch(error => {
                  console.error("Error in parallel API calls:", error);
                });
              } else {
                console.log("User type already in cookies, skipping API call");
              }
            }
          } else {
            setCookie("userType", "Establishment");
            setIsIstablishment(true);
            popuoStablishment();
          }
        } else {
          console.log("No valid stored claims, redirecting to login");
          removeAll();
          window.location.href = `${process.env.VITE_REDIRECT_URL}`;
        }
      }
    } catch (error) {
      console.error("Error in auth effect:", error);
      removeAll();
      window.location.href = `${process.env.VITE_REDIRECT_URL}`;
    }
  }, [isMounted, searchParams]);

  // Separate effect to handle API calls when userClaims changes
  useEffect(() => {
    if (!userClaims?.UserID) return;

    const storedUserType = getCookie("storeAllUserTypeData");
    if (!storedUserType && !userClaims.File_Number) {
      console.log("Making API calls after userClaims update");
      Promise.all([
        fetchUserType(userClaims),
        getNICData(userClaims.UserID, userClaims.UserDOB)
      ]).catch(error => {
        console.error("Error in parallel API calls:", error);
      });
    }
  }, [userClaims?.UserID]);

  // USER‐TYPE EFFECT
  useEffect(() => {
    try {
      if (userTypeLegalRepData) {
        console.log("User type data received:", userTypeLegalRepData);
        setCookie("storeAllUserTypeData", userTypeLegalRepData);
        // Only set the user type if it hasn't been selected from the popup
        const selectedUserType = getCookie("selectedUserType");
        if (!selectedUserType) {
          const userType = extractUserType(userTypeLegalRepData);
          if (userType) {
            setCookie("userType", userType);
            setIsLegalRep(userType === "Legal representative");
          }
        }
      }
    } catch (error) {
      console.error("Error in user type effect:", error);
    }
  }, [userTypeLegalRepData, setCookie, setIsLegalRep]);

  // NIC‐DATA EFFECT
  useEffect(() => {
    try {
      if (nicData) {
        console.log("NIC data received:", nicData);
        if ("ErrorDetails" in nicData && Array.isArray((nicData as any).ErrorDetails)) {
          handleErrorResponse(nicData);
        } else {
          // Store NIC details in both cookies for backward compatibility
          setCookie("storeAllNicData", nicData);
          setCookie("nicDetailObject", nicData);
          setIsNICValidated(true);
        }
      }
    } catch (error) {
      console.error("Error in NIC data effect:", error);
    }
  }, [nicData, setCookie]);

  // NIC‐ERROR HANDLING
  useEffect(() => {
    try {
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
          const errorData = error.data as any;
          if (
            errorData?.ErrorDetails &&
            Array.isArray(errorData.ErrorDetails)
          ) {
            const errorDesc = errorData.ErrorDetails.find(
              (detail: any) => detail.ErrorDesc
            )?.ErrorDesc;
            if (errorDesc) {
              errorMessage = errorDesc;
            }
          }
        }

        setNicErrorMessage(errorMessage);
        setShowNICError(true);
      }
    } catch (error) {
      console.error("Error in NIC error effect:", error);
    }
  }, [nicError, removeAll, t]);

  // Only show loader during initial auth check and API calls
  const isLoading = !userClaims && (isFetching || nicIsLoading);

  // If we have userClaims, render the app regardless of other states
  if (userClaims) {
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
  }

  // Show loader only during initial auth
  if (isLoading) {
    return <Loader />;
  }

  // If we get here, something went wrong with auth
  return null;
};
 
export default AuthProvider;