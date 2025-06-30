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
  const [sessionTimer, setSesionTimer] = useState<string>("");
 
 
 
  const [triggerGetMySchedules, { data: mySchedualData, isLoading: mySchedualLoading }] =
    useLazyGetMySchedulesQuery();
 
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const fetchAndCheckData = async () => {
      const selectedUserType = getCookie("selectedUserType");
      const mainCategory = getCookie("mainCategory")?.value;
      const subCategory = getCookie("subCategory")?.value;

      // For Legal representative users, check if they have made their selections
      if (uerType === "Legal representative") {
        // If user hasn't selected their role yet, don't call the API
        if (!selectedUserType) {
          return;
        }
        
        // If user selected Legal representative but hasn't selected main/sub categories, don't call the API
        if (selectedUserType === "Legal representative" && (!mainCategory || !subCategory)) {
          return;
        }
        
        // If user selected Worker, use Worker configuration
        if (selectedUserType === "Worker") {
          const result = await triggerGetMySchedules({
            AcceptedLanguage: i18n.language.toUpperCase(),
            SourceSystem: "E-Services",
            IDNumber: userClaims.UserID,
            UserType: "Worker",
          });
          handleApiResponse(result);
          return;
        }
      }

      try {
        const result = await triggerGetMySchedules({
          AcceptedLanguage: i18n.language.toUpperCase(),
          SourceSystem: "E-Services",
          IDNumber: userClaims.UserID,
          UserType: uerType,
          FileNumber: userClaims?.File_Number && userClaims?.File_Number
        });
        handleApiResponse(result);
      } catch (error) {
        // Suppress ER3008 and other "no records found" errors
        console.log("MySchedules API error (suppressed):", error);
      }
    };

    const handleApiResponse = (result: any) => {
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
          setNearestSession(upcomingSessions[0]);

          if (!intervalId) {
            intervalId = setInterval(fetchAndCheckData, 60000);
          }
        } else {
          setNearestSession(null);
        }
      }
    };

    if (uerType) {
      fetchAndCheckData();
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [uerType]);
 
  



  useEffect(()=>{

  },[])




  /*
  {
    "PlaintiffCases": [
        {
            "SettlementID": "144611203",
            "SessionTime": "08:30 ص 08:55 ص",
            "CaseID": "CS-28038",
            "ScheduleTimeRemaining": "-476.0 Minutes",
            "ScheduleWebexLink": "https://hrsd-sa.webex.com/hrsd-sa/j.php?MTID=m6a45d850967f9cd8cdb389fa7b32b159"
        },
        {
            "SettlementID": "144607281",
            "SessionTime": "12:30 م 12:55 م",
            "CaseID": "CS-21997",
            "ScheduleTimeRemaining": "-236.0 Minutes",
            "ScheduleWebexLink": "https://www.webexGopi.com"
        },
        {
            "SettlementID": "144607051",
            "SessionTime": "09:00 ص 09:25 ص",
            "CaseID": "CS-20003",
            "ScheduleTimeRemaining": "-446.0 Minutes",
            "ScheduleWebexLink": "https://www.webexGopi.com"
        },
        {
            "SettlementID": "144602087",
            "SessionTime": "12:30 م 12:55 م",
            "CaseID": "CS-18194",
            "ScheduleTimeRemaining": "-236.0 Minutes",
            "ScheduleWebexLink": "https://www.webexHabib.com"
        },
        {
            "SettlementID": "144602031",
            "SessionTime": "08:30 ص 08:55 ص",
            "CaseID": "CS-18163",
            "ScheduleTimeRemaining": "-476.0 Minutes",
            "ScheduleWebexLink": "https://www.webexHabib.com"
        },
        {
            "SettlementID": "144601232",
            "SessionTime": "11:30 ص 11:55 ص",
            "CaseID": "CS-18033",
            "ScheduleTimeRemaining": "-296.0 Minutes",
            "ScheduleWebexLink": "https://www.webexGopi.com"
        },
        {
            "SettlementID": "144601193",
            "SessionTime": "11:00 ص 11:25 ص",
            "CaseID": "CS-18023",
            "ScheduleTimeRemaining": "-326.0 Minutes",
            "ScheduleWebexLink": "https://www.webexGopi.com"
        },
        {
            "SettlementID": "144601181",
            "SessionTime": "11:00 ص 11:25 ص",
            "CaseID": "CS-18010",
            "ScheduleTimeRemaining": "-326.0 Minutes",
            "ScheduleWebexLink": "https://www.webexHabib.com"
        }
    ],
    "SourceSystem": "E-Services"
}
  
  */



 
 
 
 
 
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
                {t("time_desc_start")} {" "}
                {Math.ceil(nearestSession.minutesRemaining)} {" "}
                {t("time_desc_end")}
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
 
              <p className={`text-sm ${isRTL ? "text-gray-500" : "text-primary-900"}`}>
                {t("log_desc")}
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
 
export default Banner;