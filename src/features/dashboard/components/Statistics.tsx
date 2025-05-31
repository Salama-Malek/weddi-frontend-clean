import React from "react";
import { useTranslation } from "react-i18next";

const Statistics = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const statData = [
    { count: 3, label: t("All_hearing_text") },
    { count: 3, label: t("Pending_hearing_text") },
    { count: 3, label: t("Completed_hearing_text") },
  ];

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="w-[100%] bg-white rounded-lg shadow-md p-4 mb-4"
    >
      <p className="text-2lg text-gray-900 mb-4 bold">{t("statistics")}</p>
      <hr className="w-full border-t border-gray-930 my-4" />

      {statData.map((stat, index) => (
        <div key={index} className="flex flex-col items-center text-center">
          <StatCard count={stat.count} label={stat.label} />
          {index !== statData.length - 1 && (
            <hr className="w-[83.5%] border-t border-gray-930 mt-10" />
          )}
        </div>
      ))}
    </div>
  );
};
interface StatData {
  count: number;
  label: string;
}
const StatCard = ({ count, label }:StatData) => {
  return (
    <div className="flex flex-col items-center mt-[45px] gap-4">
      <span className="text-3xl bold text-green-900">{count}</span>
      <span className="text-gray-500 normal text-md">{label}</span>
    </div>
  );
};

export default React.memo(Statistics);