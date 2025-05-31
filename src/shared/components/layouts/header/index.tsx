import React, { Suspense, useEffect, useState } from "react";
import logo from "@/assets/logo.svg";
import logoar from "@/assets/logoar.svg";
import { Notification02Icon } from "hugeicons-react";
import { PiLineVerticalThin } from "react-icons/pi";
import Button from "@/shared/components/button";
import { GoChevronDown } from "react-icons/go";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useLazySaveUINotificationQuery } from "@/features/dashboard/api/api";
import { useCookieState } from "@/features/initiate-hearing/hooks/useCookieState";
import TableLoader from "../../loader/TableLoader";
import { toHijri_YYYYMMDD } from "@/shared/lib/helpers";

const Header = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;
  const [getCookie, , removeCookie, removeAll] = useCookieState();

  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setCurrentDateTime(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const formatTime = (date: Date) => {
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? t("PM") : t("AM");
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${ampm}`;
  };

  const formatDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year} - ` + toHijri_YYYYMMDD(`${month}/${day}/${year}`, true);
  };

  const formattedTime = formatTime(currentDateTime);
  const formattedDate = formatDate(currentDateTime);

  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") || "en";
    if (savedLanguage !== currentLanguage) {
      i18n.changeLanguage(savedLanguage);
      document.documentElement.dir = savedLanguage === "ar" ? "rtl" : "ltr";
    }
  }, []);

  const [triggerSave, { data: notificationData, isFetching }] =
    useLazySaveUINotificationQuery({
      skipPollingIfUnfocused: true,
    });
  const userClaims = getCookie("userClaims");
  useEffect(() => {
    const payload = {
      IDNumber: userClaims?.UserID || "",
      AcceptedLanguage: currentLanguage === "ar" ? "AR" : "EN",
      SourceSystem: "E-Services",
      CaseID: getCookie("caseId") ? getCookie("caseId") : "",
      UserID: "satya",
    };
    triggerSave(payload); // Will only trigger when called
  }, [currentLanguage]);

  const handleItemClick = (label: string) => {
    // //console.log("label", label);
  };

  const handleNotificationClick = () => { };

  const handleLogout = () => {
    removeAll();
    window.location.href = `${process.env.VITE_REDIRECT_URL}`;
  };

  const dropdownItems = [
    {
      label: t("items.item4"),
      onClick: () => {
        removeAll();
        window.location.href = `${process.env.VITE_REDIRECT_URL}`;
      },
    }
  ];


  const notificationItems =
    notificationData?.UINotificationList?.length > 0
      ? notificationData?.UINotificationList.map(
        (notif: any, index: number) => ({
          label: notif.NotificationText,
          onClick: () => handleNotificationClick(),
        })
      )
      : [
        {
          label: t(""),
          onClick: () => { },
        },
      ];

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng).then(() => {
      localStorage.setItem("language", lng);
      document.documentElement.dir = lng === "ar" ? "rtl" : "ltr";
    });
  };

  return (
    <header className="header-shadow bg-light-alpha-white h-auto lg:h-20 py-3 " >
      <div className="h-full w-full flex flex-wrap gap-y-2 justify-between items-center max-w-full px-2 md:px-6">
        <div className="col-span-3 md:col-span-6 lg:order-1 order-1 cursor-pointer" onClick={() => navigate("")}>
          <img src={currentLanguage === "ar" ? logoar : logo} alt="Logo" className="lg:h-12 md:h-12 sm:h-12 h-10" />
        </div>
        <div className="col-span-6 md:col-span-12 lg:order-2 order-3 flex lg:justify-end md:justify-end  justify-between items-center 700 lg:ms-auto md:ms-auto ms-0 lg:w-auto w-full ">
          {/* <span
            className="!text-default-color text-sm md:text-md medium lg:flex md:flex hidden justify-center items-center gap-1 cursor-pointer "
            onClick={() =>
              changeLanguage(currentLanguage === "en" ? "ar" : "en")
            }
          >
            {t("language")}{" "}
            <GoChevronDown size={20} className="text-default-color" />
          </span> */}
          <PiLineVerticalThin size={32} className="text-gray-300 lg:flex md:flex hidden " />
          <span className="!text-default-color text-sm mt-sm-5 md:text-md medium flex justify-center w-full">
            <time>
              {formattedTime}&nbsp;&nbsp;|&nbsp;&nbsp;
              <span className="text-success-600">
                {formattedDate}
              </span>
            </time>
          </span>


          {/* Notification Dropdown
          <Suspense fallback={<TableLoader />}>
            <div className="relative ml-4">
              <MyDropdown
                isFetching={isFetching}
                items={notificationItems}
                trigger={
                  <div className="relative cursor-pointer">
                    <Notification02Icon className="text-primary-960 m-0  lg:mr-6 md:mr-6" />
                    <span className="absolute top-0 lg:right-[26px] md:right-[26px] right-[0] w-2.5 h-2.5 bg-info-960 rounded-full"></span>
                  </div>
                }
              />
            </div>
          </Suspense> */}

        </div>
        <div className="ms-5 col-span-3 md:col-span-6 lg:order-3 order-2 flex justify-end items-center 700">
          <span>
            <Button
              className="!w-auto !h-10 border-0 text-light-alpha-white text-md medium"
              onClick={handleLogout}
            >
              {t("items.item4")}
            </Button>
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;
