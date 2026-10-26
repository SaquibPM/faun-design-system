import "@faun-ds/tokens/css";
import "@faun-ds/tokens/css/base";
import "./styles/component-styles";
import "./styles/docs.css";
import "./styles/foundations.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createHashRouter } from "react-router";
import { routes } from "./routes";
import { initPreferences } from "./prefs";

initPreferences();
const router = createHashRouter(routes);
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
