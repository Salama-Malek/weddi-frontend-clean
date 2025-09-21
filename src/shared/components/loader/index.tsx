import React from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

interface LoaderProps {
  force?: boolean;
}

const Loader: React.FC<LoaderProps> = ({ force }) => {
  const { t } = useTranslation("translation");
  const isGlobalLoading = useSelector((s: any) => s.loading?.isLoading);
  if (!force && !isGlobalLoading) return null;
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-black bg-opacity-25 backdrop-blur-sm z-50">
      <div
        className="h-12 w-12 rounded-full border-4 border-gray-300 animate-spin"
        style={{ borderRightColor: "#1B8354" }}
        aria-label={t("loading_spinner")}
        role="status"
      />
      <p className="mt-4 text-white text-sm font-medium">
        {t("loading_spinner")}
      </p>
    </div>
  );
};

export default React.memo(Loader);
