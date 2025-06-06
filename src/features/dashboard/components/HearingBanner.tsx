import React, { lazy, Suspense, useEffect, useState } from "react";
import BannerBg from "@/assets/images/banner/banner-bg.png";
import Button from "@/shared/components/button";
import { useTranslation } from "react-i18next";
import { useCookieState } from "@/features/initiate-hearing/hooks/useCookieState";
const InfoBanner = lazy(
  () => import("@/shared/components/ui/account-warning-header")
);
import TableLoader from "@/shared/components/loader/TableLoader";
import { useGetMySchedulesQuery, useLazyGetMySchedulesQuery } from "../api/api";
import { TokenClaims } from "@/features/login/components/AuthProvider";
import { useUser } from "@/shared/context/userTypeContext";

interface BannerProps {
  isEstablishment?: boolean;
  isLegalRep?: boolean;
  showInfoBanner?: boolean;
  onCloseInfoBanner?: () => void;
}

const Banner: React.FC<BannerProps> = ({
  isEstablishment,
  isLegalRep,
  showInfoBanner = false,
  onCloseInfoBanner
}) => {
  // const { t, i18n } = useTranslation();
  // const isRTL = i18n.language === "ar";
  // const [hasHearing, setHasHearing] = useState(false);
  // const [hasLegalRepresentative, setHasLegalRepresentative] = useState(true);
  // const [getCookie] = useCookieState({});
  // const userClaims = getCookie("userClaims");
  // const uerType = getCookie("userType");

  // const [nearestSession, setNearestSession] = useState<null | {
  //   minutesRemaining: number;
  //   webexLink: string;
  // }>(null);
  // const [triggerGetMySchedules, { data: mySchedualData, isLoading: mySchedualLoading }] =
  //   useLazyGetMySchedulesQuery();
  // const [timeLeft, setTimeLeft] = useState<number>(0);
  /*
   const getMySchedualDataFun = async () => {
      if (!userClaims?.UserID || !uerType) return; // Don't proceed if we don't have required data
      
      setTimeLeft(0);
      const result = await triggerGetMySchedules({
        AcceptedLanguage: i18n.language.toUpperCase(),
        SourceSystem: "E-Services",
        IDNumber: userClaims.UserID,
        UserType: uerType,
        FileNumber: userClaims?.File_Number && userClaims?.File_Number
      });
      const data = result?.data;
      if (data?.PlaintiffCases?.length > 0) {
        const upcomingSessions = data.PlaintiffCases
          .map((s: any) => ({
            minutesRemaining: parseFloat(s?.ScheduleTimeRemaining),
            webexLink: s?.ScheduleWebexLink
          }))
          .filter((s: any) => s.minutesRemaining >= 0)
          .sort((a: any, b: any) => a.minutesRemaining - b.minutesRemaining);
  
        if (upcomingSessions.length > 0) {
          setTimeLeft(upcomingSessions?.[0].minutesRemaining * 60);
          setNearestSession(upcomingSessions[0]);
        } else {
          setNearestSession(null);
        }
      } else {
        setNearestSession(null);
      }
    };
  
  */
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const [hasHearing, setHasHearing] = useState(false);
  const [hasLegalRepresentative, setHasLegalRepresentative] = useState(true);
  const [getCookie] = useCookieState({});
  const userClaims: TokenClaims = getCookie("userClaims");
  const uerType = getCookie("userType");
  const {
    selected: selectedUser
  } = useUser();

  const [nearestSession, setNearestSession] = useState<null | {
    minutesRemaining: number;
    webexLink: string;
  }>(null);
  const [triggerGetMySchedules, { data: mySchedualData, isLoading: mySchedualLoading }] =
    useLazyGetMySchedulesQuery();
  const [timeLeft, setTimeLeft] = useState<number>(0);

  const getMySchedualDataFun = async () => {
 // هنا باقي جزاء بسيط محتاج يتهندل 
 // في حالة وجود سيشن ولاكن بالسالب وحصل ندائ للapis 
 // يجب عرض السيشن ايضا 

    const userID = getCookie("userClaims").UserID;
    const fileNumber = getCookie("userClaims")?.File_Number;
    const mainCategory = getCookie("mainCategory")?.value;
    const subCategory = getCookie("subCategory")?.value;
    const goveDetails = getCookie("storeAllUserTypeData");
    const uerType = getCookie("userType");

    const userConfigs: any = {
      Worker: {
        UserType: uerType,
        IDNumber: userID,
      },
      Establishment: {
        UserType: uerType,
        IDNumber: userID,
        FileNumber: fileNumber,
      },
      "Legal representative": {
        UserType: uerType,
        IDNumber: userID,
        MainGovernment: mainCategory || "",
        SubGovernment: subCategory || "",
      },
    } as const;

    setTimeLeft(0);
    const result = await triggerGetMySchedules({
      ...userConfigs[uerType],
      AcceptedLanguage: i18n.language.toUpperCase(),
      SourceSystem: "E-Services",

    });


    const data = result?.data;
    if (data?.PlaintiffCases?.length > 0) {
      const upcomingSessions = data.PlaintiffCases
        .map((s: any) => ({
          minutesRemaining: parseFloat(s?.ScheduleTimeRemaining),
          webexLink: s?.ScheduleWebexLink
        }))
        .filter((s: any) => s.minutesRemaining >= 0)
        .sort((a: any, b: any) => a.minutesRemaining - b.minutesRemaining);

      if (upcomingSessions.length > 0) {
        setTimeLeft(upcomingSessions?.[0].minutesRemaining * 60);
        setNearestSession(upcomingSessions[0]);
      } else {
        setNearestSession(null);
      }
    } else {
      setNearestSession(null);
    }
  }
  useEffect(() => {
    if (timeLeft <= 1500) {
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === 1500) {
          getMySchedualDataFun();
        }

        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [nearestSession]);




  // // Timer effect for countdown
  // useEffect(() => {
  //   let timer: NodeJS.Timeout;
  //   if (timeLeft > 0) {
  //     timer = setInterval(() => {
  //       setTimeLeft(prev => prev - 1);
  //     }, 1000);
  //   }
  //   return () => {
  //     if (timer) clearInterval(timer);
  //   };
  // }, [timeLeft]);

  // // Schedule data effect
  // useEffect(() => {
  //   let intervalId: NodeJS.Timeout;

  //   const fetchData = async () => {
  //     await getMySchedualDataFun();
  //     // Set up interval for next fetch
  //     intervalId = setInterval(getMySchedualDataFun, 60000); // Fetch every minute
  //   };

  //   if (userClaims?.UserID && uerType) {
  //     fetchData();
  //   }

  //   return () => {
  //     if (intervalId) clearInterval(intervalId);
  //   };
  // }, [userClaims?.UserID, uerType]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60)
      .toString()
      .padStart(2, '0');
    const s = Math.floor(seconds % 60)
      .toString()
      .padStart(2, '0');

    if (h > 0) {
      return `${h} ${t("Hour")}  ${m}  ${t("Minutes")}  ${s} ${t("Seconds")}`;
    } else {
      return ` ${m}  ${t("Minutes")}  ${s} ${t("Seconds")}`;
    }
  };

  useEffect(() => {
    getMySchedualDataFun();
  }, [uerType, selectedUser])


  return (
    <>
      {isLegalRep && showInfoBanner && (
        <Suspense fallback={<TableLoader />}>
          <InfoBanner onClose={onCloseInfoBanner} />
        </Suspense>
      )}

      <section
        dir={t("dir")}
        className={`relative w-full mt-4 overflow-hidden border border-gray-300 rounded-md z-0`}
      >
        <img
          src={BannerBg}
          alt="Banner Background"
          className="absolute inset-0 w-full h-full object-cover opacity-10"
        />

        <div
          className="absolute inset-0"
          style={{
            background: isRTL
              ? "linear-gradient(-90deg, rgba(255, 255, 255, 0.6) 41%, rgba(201, 255, 220, 0.74) 100%)"
              : "linear-gradient(90deg, rgba(255, 255, 255, 0.6) 41%, rgba(201, 255, 220, 0.74) 100%)",
          }}
        ></div>

        <div className="relative z-0 p-6 flex flex-col justify-between h-full">
          {nearestSession && (
            <div className="mb-4 bg-primary-960 rounded-md text-gray-100 p-4 flex justify-between items-center">
              {timeLeft > 0 ? (
                <p className="text-1822">
                  <b>{t("time_desc_start")} {":  "}</b>
                  {formatTime(timeLeft)} {" "}
                </p>
              ) : (
                <p className="text-1822">
                  {t("session_expired_or_ended")}
                </p>
              )}
              <Button variant="secondary" typeVariant="solid" onClick={() => window.open(nearestSession.webexLink, "_blank")}>
                {t("attend_session")}
              </Button>
            </div>
          )}

          <div className="relative z-0 flex justify-between items-center">
            <div className="space-y-4">
              <h6 className="text-2436 bold text-primary-900 lg:text-2xl text-lg">
                {t("welcome_text")} {userClaims?.UserName}
              </h6>
              {isEstablishment && (
                <div className="flex">
                  <p className={`text-md text-gray-500 ${isRTL ? "ml-1" : "mr-1"}`}>
                    {t("registration_text")}
                  </p>
                  <p className="text-md font-bold text-gray-500">{userClaims?.File_Number || t("registration_num")}</p>
                </div>
              )}

              {/* <p className={`text-sm ${isRTL ? "text-gray-500" : "text-primary-900"}`}>
                {t("log_desc")}
              </p> */}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Banner;