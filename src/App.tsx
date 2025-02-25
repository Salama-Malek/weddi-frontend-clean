import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./components/LanguageSwitcher.tsx";

const App = () => {
  const { t } = useTranslation();

  return (
    <Router>
      <nav className="flex space-x-4 p-4 bg-gray-100">
        <Link to="/" className="text-blue-600">{t("home")}</Link>
        <Link to="/dashboard" className="text-blue-600">{t("dashboard")}</Link>
      </nav>
      <LanguageSwitcher />
      <Routes>
        <Route path="/" element={<h1>{t("welcome")}</h1>} />
        <Route path="/dashboard" element={<h1>{t("dashboard")}</h1>} />
      </Routes>
    </Router>
  );
};

export default App;
