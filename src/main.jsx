import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./components/App.jsx";
import { useAuthProvider } from "./auth/AuthProvider.jsx";
import "./styles.css";

const { AuthProvider } = useAuthProvider();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <HashRouter>
        <App />
      </HashRouter>
    </AuthProvider>
  </StrictMode>
);
