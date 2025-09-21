import { useTranslation } from "react-i18next";
export const HelpCenterHeader: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between space-x-4 w-full">
      <p className="text-gray-800 font-bold text-lg">{t("Help_Center")}</p>
    </div>
  );
};
