import { useState } from "react";
import { changeLanguage } from "i18next";
import { useTranslation } from "react-i18next";

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [selectedLang, setSelectedLang] = useState(i18n.language || "en");

  const toggleLanguage = () => {
    const newLang = selectedLang === "en" ? "ar" : "en";
    changeLanguage(newLang);
    setSelectedLang(newLang);
  };

  return (
    <button
      className="bg-gray-200 dark:bg-gray-800 text-black dark:text-white py-2 px-4 rounded-md transition duration-200 hover:bg-gray-300 dark:hover:bg-gray-700"
      onClick={toggleLanguage}
    >
      {selectedLang === "en" ? "🇦🇪 العربية" : "🇺🇸 English"}
    </button>
  );
};

export default LanguageSwitcher;
