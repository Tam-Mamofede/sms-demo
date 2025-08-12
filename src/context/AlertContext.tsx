// AlertContext.tsx
import React, { createContext, useContext, useState } from "react";

type AlertType = "success" | "error" | "warning" | "info";

interface AlertContextType {
  message: string;
  type: AlertType;
  isVisible: boolean;
  showAlert: (message: string, type: AlertType) => void;
  hideAlert: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider = ({ children }: { children: React.ReactNode }) => {
  const [message, setMessage] = useState<string>("");
  const [type, setType] = useState<AlertType>("info");
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const showAlert = (message: string, type: AlertType) => {
    setMessage(message);
    setType(type);
    setIsVisible(true);

    setTimeout(() => {
      setIsVisible(false);
    }, 5000);
  };

  const hideAlert = () => setIsVisible(false);

  return (
    <AlertContext.Provider
      value={{ message, type, isVisible, showAlert, hideAlert }}
    >
      {children}
    </AlertContext.Provider>
  );
};

export const useAlert = (): AlertContextType => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlert must be used within an AlertProvider");
  }
  return context;
};
