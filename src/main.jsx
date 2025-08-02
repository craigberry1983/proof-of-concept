import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import { MsalProvider } from "./common/MsalContext";
import App from "./components/App.jsx";
import "./styles.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <MsalProvider>
      <HashRouter>
        <App />
      </HashRouter>
    </MsalProvider>
  </StrictMode>
);
