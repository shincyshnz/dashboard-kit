import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { AppProviders } from "@/app/providers/app-providers";
import "@/styles/index.css";

const root = document.getElementById("root");
if (!root) throw new Error("#root element not found in index.html");

createRoot(root).render(
  <StrictMode>
    <AppProviders />
  </StrictMode>,
);
