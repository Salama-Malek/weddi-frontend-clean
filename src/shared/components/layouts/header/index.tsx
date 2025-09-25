import { Suspense, useEffect, useState } from "react";
import logo from "@/assets/logo.svg";
import logoar from "@/assets/logoar.svg";
import { Notification02Icon } from "hugeicons-react";
import { PiLineVerticalThin } from "react-icons/pi";
import Button from "@/shared/components/button";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { useLazySaveUINotificationQuery } from "@/features/dashboard/api/api";
import { useCookieState } from "@/features/initiate-hearing/hooks/useCookieState";
import TableLoader from "../../loader/TableLoader";
import { toHijri_YYYYMMDD } from "@/shared/lib/helpers";
import MyDropdown from "@/providers";
import { lazy } from "react";
import Modal from "@/shared/components/modal/Modal";
import { useUser } from "@/shared/context/userTypeContext";

const LoginAccountSelect = lazy(
  () => import("@/features/login/components/LoginAccountSelect"),
);

const Header = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;
  const [getCookie] = useCookieState();

  const [selected, setSelected] = useState<string | null>(null);

  const userClaims = getCookie("userClaims");
  const { pathname } = useLocation();
  const [openSwitchAccountModalWarning, setOpenSwitchAccountModalWarning] =
    useState(false);

  function getUserDateTime() {
    return new Date();
  }

  const [currentDateTime, setCurrentDateTime] = useState(getUserDateTime());
  const [isNotificationClicked, setIsNotificationClicked] = useState(false);
  const {
    openModule,
    setOpenModule,
    userType: userTypeState,
    selected: selectedUser,
    isMenueCahngeFlag,
  } = useUser();

  const originalUserType = getCookie("originalUserType");

  const storedUserTypeData = getCookie("storeAllUserTypeData");
  const hasLegalRepCapability = storedUserTypeData?.UserTypeList?.some(
    (userType: any) => userType.UserType === "Legal representative",
  );

  const shouldShowSwitchOption =
    originalUserType === "Legal representative" || hasLegalRepCapability;

  useEffect(() => {
    const id = setInterval(() => setCurrentDateTime(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const formatTime = (date: Date) => {
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");

    const ampm = {
      en: hours >= 12 ? "PM" : "AM",
      ar: hours >= 12 ? "مساءً" : "صباحًا",
    };
    const currentLanguage = i18n.language || "en";
    const timeIndicator = ampm[currentLanguage as keyof typeof ampm] || ampm.en;
    hours = hours % 12 || 12;
    return `${String(hours).padStart(2, "0")}:${minutes} ${timeIndicator}`;
  };

  const formatDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const gregorianDate = `${day}/${month}/${year}`;
    const hijriDate = toHijri_YYYYMMDD(`${month}/${day}/${year}`, true);
    const dayNames = {
      en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      ar: ["أحد", "اثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"],
    };

    const currentLanguage = i18n.language.toLowerCase() || "en";
    const dayName =
      dayNames[currentLanguage as keyof typeof dayNames]?.[date.getDay()] ||
      dayNames.en[date.getDay()];

    return `${gregorianDate} - ${hijriDate} | ${dayName}`;
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

  useEffect(() => {
    if (userTypeState) {
      const payload = {
        IDNumber: userClaims?.UserID || "",
        AcceptedLanguage: currentLanguage === "ar" ? "AR" : "EN",
        SourceSystem: "E-Services",
        CaseID: "",
      };
      triggerSave(payload);
    }
  }, [userTypeState, selectedUser, isMenueCahngeFlag]);

  const handleLogout = () => {
    navigate("/logout");
  };

  const handleSwitchAccount = () => {
    if (pathname === "/") {
      setOpenModule(true);
      setSelected(null);
    } else {
      setOpenSwitchAccountModalWarning(true);
    }
  };

  const handleCloseSwitchAccountModalWarning = () => {
    setOpenSwitchAccountModalWarning(false);
  };

  const handleClosePopup = () => {
    setSelected(null);
    setOpenModule(false);
  };

  const settingsItems = shouldShowSwitchOption
    ? [
        {
          label: t("switch_account"),
          value: "switch_account",
          onClick: handleSwitchAccount,
        },
        {
          label: t("logout"),
          value: "logout",
          onClick: handleLogout,
        },
      ]
    : [
        {
          label: t("logout"),
          value: "logout",
          onClick: handleLogout,
        },
      ];

  const notificationItems =
    notificationData?.UINotificationList?.length > 0
      ? notificationData?.UINotificationList?.map(
          (notif: any, _index: number) => ({
            label: notif.NotificationText,
            onClick: () => {},
          }),
        )
      : [
          {
            label: t("no_notifcations"),
            onClick: () => {},
          },
        ];

  // const changeLanguage = (lng: string) => {
  //   i18n.changeLanguage(lng).then(() => {
  //     localStorage.setItem("language", lng);
  //     document.documentElement.dir = lng === "ar" ? "rtl" : "ltr";
  //   });
  // };

  useEffect(() => {
    if (isNotificationClicked) {
      triggerSave({
        IDNumber: userClaims?.UserID || "",
        AcceptedLanguage: currentLanguage === "ar" ? "AR" : "EN",
        SourceSystem: "E-Services",
        CaseID: "",
      });
    }
  }, [isNotificationClicked]);

  return (
    <>
      <header className="header-shadow bg-light-alpha-white h-auto lg:h-20 py-3">
        <div className="h-full w-full flex flex-wrap gap-y-2 justify-between items-center max-w-full px-2 md:px-6">
          {/* Logo */}
          <div
            className="col-span-3 md:col-span-6 lg:order-1 order-1 cursor-pointer"
            onClick={() => navigate("")}
          >
            <img
              src={currentLanguage === "ar" ? logoar : logo}
              alt="Logo"
              className="lg:h-12 md:h-12 sm:h-12 h-10"
            />
          </div>

          {/* Center Section - Date/Time */}
          <div className="col-span-6 md:col-span-12 lg:order-2 order-3 flex lg:justify-end md:justify-end justify-between items-center lg:ms-auto md:ms-auto ms-0 lg:w-auto w-full">
            {/* this is switch language btn , will be enable when appling the urd language  */}
            {/* {pathname === "/" && (
              <span
                className="!text-default-color text-md medium flex justify-center items-center gap-1 cursor-pointer"
                onClick={() => changeLanguage(currentLanguage === "en" ? "ar" : "en")}
              >
                {t("language")} <GoChevronDown size={20} className="text-default-color" />
              </span>
            )} */}
            <PiLineVerticalThin
              size={32}
              className="text-gray-300 lg:flex md:flex hidden"
            />

            {/* Desktop Date/Time */}
            <span className="!text-default-color text-[14px] font-medium hidden md:flex justify-center w-full">
              <time>
                {formattedTime}&nbsp;&nbsp;|&nbsp;&nbsp;
                <span className="text-success-600">
                  {formattedDate.split(" - ")[0]} -{" "}
                  {formattedDate.split(" - ")[1].split(" | ")[0]}
                </span>
                &nbsp;|&nbsp;{formattedDate.split(" | ")[1]}
              </time>
            </span>

            {/* Mobile Date/Time */}
            <span className="!text-default-color text-[14px] font-medium md:hidden flex justify-center w-full">
              <time>
                {formattedTime}&nbsp;|&nbsp;
                <span className="text-success-600">
                  {formattedDate.split(" - ")[0]} -{" "}
                  {formattedDate.split(" - ")[1].split(" | ")[0]}
                </span>
                &nbsp;|&nbsp;{formattedDate.split(" | ")[1]}
              </time>
            </span>

            <Suspense fallback={<TableLoader />}>
              <div
                className="relative ml-2 md:ml-4"
                onClick={() => {
                  if (isNotificationClicked) {
                    setIsNotificationClicked(false);
                  } else {
                    setIsNotificationClicked(true);
                  }
                }}
              >
                <MyDropdown
                  isFetching={isFetching}
                  items={notificationItems}
                  header={t("notifications")}
                  trigger={
                    <div className="relative cursor-pointer">
                      <Notification02Icon className="text-primary-960 m-0 lg:mr-6 md:mr-6" />
                      {notificationData?.UINotificationList?.length > 0 && (
                        <span className="absolute top-0 lg:right-[26px] md:right-[26px] right-[0] w-2.5 h-2.5 bg-info-960 rounded-full"></span>
                      )}
                    </div>
                  }
                />
              </div>
            </Suspense>
          </div>

          {/* Settings Button */}
          <div className="ms-2 md:ms-5 col-span-3 md:col-span-6 lg:order-3 order-2 flex justify-end items-center">
            <MyDropdown
              items={settingsItems}
              trigger={
                <Button className="!w-auto !h-8 md:!h-10 border-0 text-light-alpha-white text-xs md:text-md medium px-2 md:px-4">
                  <span className="inline">{t("settings")}</span>
                </Button>
              }
              onChange={(option) => {
                if (option.value === "switch_account") {
                  handleSwitchAccount();
                } else if (option.value === "logout") {
                  handleLogout();
                }
              }}
            />
          </div>
        </div>
      </header>

      {openModule && (
        <Modal
          close={handleClosePopup}
          header={t("select_account_type")}
          modalWidth={600}
        >
          <div className="w-full space-y-4">
            <Suspense fallback={<TableLoader />}>
              <LoginAccountSelect
                selected={selected}
                setSelected={setSelected}
                selectedOption={null}
                handleChange={(opt) => setSelected(opt as any)}
                handleCloseModal={handleClosePopup}
                popupHandler={() => {}}
                isLegalRep={selected === "Legal representative"}
              />
            </Suspense>
          </div>
        </Modal>
      )}

      {openSwitchAccountModalWarning && (
        <Modal
          close={handleCloseSwitchAccountModalWarning}
          header={t("homePageWarning")}
          modalWidth={600}
        >
          <div className="w-full space-y-4">
            <p>{t("homePageWarningDesc")}</p>
            <Button
              className="!w-auto !h-10 border-0 text-light-alpha-white text-md medium"
              onClick={handleCloseSwitchAccountModalWarning}
            >
              {t("ok")}
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
};

export default Header;
