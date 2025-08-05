import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "../assets/styles/index.css";
import "../assets/styles/fonts.scss";
import "../assets/styles/customs.css";
import { AppProvider } from "@app/providers/AppProvider";


ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </React.StrictMode>
);