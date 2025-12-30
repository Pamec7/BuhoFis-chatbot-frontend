import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

if (import.meta.env.DEV && import.meta.env.VITE_USE_MOCK_API === "true") {
  import("./mocks/mockServer").then((m) => m.enableMockApi());
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
