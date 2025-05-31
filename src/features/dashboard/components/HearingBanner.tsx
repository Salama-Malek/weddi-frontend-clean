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

interface BannerProps {
  isEstablishment?: boolean;
  isLegalRep?: boolean;
}

const Banner: React.FC<BannerProps> = ({ isEstablishment, isLegalRep }) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const [hasHearing, setHasHearing] = useState(false);
  const [hasLegalRepresentative, setHasLegalRepresentative] = useState(true);
  const [getCookie] = useCookieState({});
  const userClaims: TokenClaims = getCookie("userClaims");
  const uerType = getCookie("userType");


  const [nearestSession, setNearestSession] = useState<null | {
    minutesRemaining: number;
    webexLink: string;
  }>(null);
  const [triggerGetMySchedules, { data: mySchedualData, isLoading: mySchedualLoading }] =
    useLazyGetMySchedulesQuery();
  const [timeLeft, setTimeLeft] = useState<number>(0);
  // useEffect(() => {
  //   let intervalId: NodeJS.Timeout;

  //   const fetchAndCheckData = async () => {
  //     const result = await triggerGetMySchedules({
  //       AcceptedLanguage: i18n.language.toUpperCase(),
  //       SourceSystem: "E-Services",
  //       IDNumber: userClaims.UserID,
  //       UserType: uerType,
  //       FileNumber: userClaims?.File_Number && userClaims?.File_Number
  //     });

  //     const data = result?.data;

  //     if (data?.PlaintiffCases?.length > 0) {
  //       const upcomingSessions = data.PlaintiffCases
  //         .map((s: any) => ({
  //           minutesRemaining: parseFloat(s?.ScheduleTimeRemaining),
  //           webexLink: s?.ScheduleWebexLink
  //         }))
  //         .filter((s: any) => s.minutesRemaining >= 0)
  //         .sort((a: any, b: any) => a.minutesRemaining - b.minutesRemaining);

  //       if (upcomingSessions.length > 0) {
  //         setNearestSession(upcomingSessions[0]);

  //         if (!intervalId) {
  //           intervalId = setInterval(fetchAndCheckData, 60000);
  //         }
  //       } else {
  //         setNearestSession(null);
  //       }
  //     }
  //   };

  //   if (uerType) {
  //     fetchAndCheckData();
  //   }

  //   return () => {
  //     if (intervalId) clearInterval(intervalId);
  //   };
  // }, [uerType]);


  /**
   1- call the api 
   2- compare the now time to the remind mints
   3- diaplay count down with the remaind timer for it 
   -- call api each time user refresh or the timer is zero
   */

  const getMySchedualDataFun = async () => {
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

      //console.log(upcomingSessions);

      if (upcomingSessions.length > 0) {
        //console.log(upcomingSessions?.[0]);

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
    if (timeLeft <= 0) {
      return
    };

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          getMySchedualDataFun();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [nearestSession]);

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
  }, [uerType])










  return (
    <>
      {isLegalRep && (
        <Suspense fallback={<TableLoader />}>
          <InfoBanner onClose={() => setHasLegalRepresentative(false)} />
        </Suspense>
      )}

      <section
        dir={t("dir")}
        className={`relative w-full mt-4 overflow-hidden border border-gray-300 rounded-md`}
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

        <div className="relative z-10 p-6 flex flex-col justify-between h-full">
          {nearestSession && (
            <div className="mb-4 bg-primary-960 rounded-md text-gray-100 p-4 flex justify-between items-center">
              <p className="text-1822">
                <b>
                  {t("time_desc_start")} {":  "}
                </b>
                {formatTime(timeLeft)} {" "}
                {/* {t("time_desc_end")} */}
              </p>
              <Button variant="secondary" typeVariant="solid" onClick={() => window.open(nearestSession.webexLink, "_blank")}>
                {t("attend_session")}
              </Button>
            </div>
          )}

          <div className="relative z-10 flex justify-between items-center">
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