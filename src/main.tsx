import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import App from "./App";
import { defaultAppPath } from "./lib/appRoutes";
import "./styles.css";

// HashRouter is used so that refresh / direct links work on GitHub Pages
// (a static host with no SPA fallback). The path after the hash is fully
// client-side; Vite's `base` handles the project subpath for assets.
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<Navigate to={defaultAppPath()} replace />} />
        <Route path="/p/:projectId/*" element={<App />} />
      </Routes>
    </HashRouter>
  </React.StrictMode>,
);
