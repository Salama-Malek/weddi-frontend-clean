import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app/App";
import "@/assets/styles/index.css";
import "@/assets/styles/fonts.scss";
import "@/assets/styles/customs.css";
import { AppProvider } from "./providers/AppProvider";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </React.StrictMode>,
);
