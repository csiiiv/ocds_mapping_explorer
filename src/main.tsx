import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import App from "./App";
import { defaultAppPath } from "./lib/appRoutes";
import "./styles.css";

const basename = import.meta.env.BASE_URL.replace(/\/$/, "") || undefined;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter basename={basename}>
      <Routes>
        <Route path="/" element={<Navigate to={defaultAppPath()} replace />} />
        <Route path="/p/:projectId/*" element={<App />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);
