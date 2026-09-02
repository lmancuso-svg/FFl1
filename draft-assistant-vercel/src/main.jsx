import "./storage-shim.js"; // must load before the app touches window.storage
import React from "react";
import ReactDOM from "react-dom/client";
import DraftAssistant from "./DraftAssistant.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <DraftAssistant />
  </React.StrictMode>
);
