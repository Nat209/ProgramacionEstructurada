import React from "react";
import { createRoot } from "react-dom/client";
import DashboardRealtime from "../../dashboard_realtime.jsx";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <DashboardRealtime />
  </React.StrictMode>,
);
