import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { AuthProvider } from "./context/AuthContext.tsx";
import { UploadProvider } from "./context/UploadContext.tsx";
import { BrowserRouter } from "react-router-dom";
import "../index.css";
import { StudentProvider } from "./context/StudentContext.tsx";
import { StaffProvider } from "./context/StaffContext.tsx";
import { FinanceProvider } from "./context/FinanceContext.tsx";
import { LibraryProvider } from "./context/LibraryContext.tsx";
import { GradingProvider } from "./context/GradingContext.tsx";
import { PayrollProvider } from "./context/PayrollContext.tsx";
import { AlertProvider } from "./context/AlertContext.tsx";
import ErrorBoundary from "../components/ErrorBoundary";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <ErrorBoundary>
        <AlertProvider>
          <AuthProvider>
            <StudentProvider>
              <StaffProvider>
                <PayrollProvider>
                  <FinanceProvider>
                    <LibraryProvider>
                      <GradingProvider>
                        <UploadProvider>
                          <App />
                        </UploadProvider>
                      </GradingProvider>
                    </LibraryProvider>
                  </FinanceProvider>
                </PayrollProvider>
              </StaffProvider>
            </StudentProvider>
          </AuthProvider>
        </AlertProvider>
      </ErrorBoundary>
    </BrowserRouter>
  </StrictMode>
);
