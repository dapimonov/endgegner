import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "../app/globals.css";
import { CEndgegnerApp } from "../src/application/CEndgegnerApp/CEndgegnerApp";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Root element not found");
}

createRoot(root).render(
  <StrictMode>
    <CEndgegnerApp />
  </StrictMode>,
);
