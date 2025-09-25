import { useCookieState } from "@/features/initiate-hearing/hooks/useCookieState";
import { useLanguageDirection } from "@/i18n/LanguageDirectionProvider";
import { AuctionIcon } from "hugeicons-react";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { GoDotFill } from "react-icons/go";

const HearingSideHeader = () => {
  const { isRTL } = useLanguageDirection();
  const { t } = useTranslation("stepper");
  const [getCookie] = useCookieState({ caseId: "" });
  const [forceUpdate, setForceUpdate] = useState(0);
  const [displayCaseId, setDisplayCaseId] = useState<string | null>(null);

  useEffect(() => {
    const handleCaseDataCleared = () => {
      setForceUpdate((prev) => prev + 1);
      setDisplayCaseId(null);
    };

    const handleStorageChange = () => {
      setForceUpdate((prev) => prev + 1);
    };

    window.addEventListener("caseDataCleared", handleCaseDataCleared);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("caseDataCleared", handleCaseDataCleared);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  useEffect(() => {
    const currentCaseId = getCookie("caseId");

    if (currentCaseId && currentCaseId.toString().trim()) {
      setDisplayCaseId(currentCaseId.toString().trim());
    } else {
      setDisplayCaseId(null);
    }
  }, [getCookie, forceUpdate]);

  return (
    <header className="bg-primary-25 flex flex-col items-center py-4 px-md">
      <div className={`justify-around w-full flex items-center gap-4`}>
        <AuctionIcon strokeWidth={1.26} className="text-primary-600" />
        <span>
          <h1 className="text-xs xl:text-md lg:text-lg medium text-default-color">
            {t("title")}
          </h1>
          <span className="text-gray-500 text-1438 normal">
            {t("case_id_label")} ({displayCaseId || "---"})
          </span>
        </span>
        <span
          className={`bg-lavender-100 text-lavender-600 medium text-md px-2 ${
            isRTL ? "pl-4" : "pr-3"
          } py-1 rounded-full flex items-center gap-2`}
        >
          <GoDotFill size={20} />{" "}
          <span className="relative right-[3px] bottom-[1px]">
            {t("new_text")}
          </span>
        </span>
      </div>
      <div className="border-b-[4px] rounded-md border-[#1B8354] relative top-[16px] w-full"></div>
    </header>
  );
};

export default React.memo(HearingSideHeader);
