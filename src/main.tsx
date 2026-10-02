import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import { AuthProvider } from "./hooks/useAuth";
import { SchoolProvider } from "./hooks/useSchool";
import { ToastProvider } from "./components/Toast/useToast";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <SchoolProvider fallbackName="Panel de Control">
        <ToastProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </ToastProvider>
      </SchoolProvider>
    </AuthProvider>
  </StrictMode>
);
