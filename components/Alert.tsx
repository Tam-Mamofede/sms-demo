// Alert.tsx

import { useAlert } from "../src/context/AlertContext";

const Alert = () => {
  const { message, type, isVisible } = useAlert();

  if (!isVisible) return null;

  const alertStyles = {
    success: "bg-green-100 border-l-4 border-green-500 text-green-700",
    error: "bg-red-100 border-l-4 border-red-500 text-red-700",
    warning: "bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700",
    info: "bg-blue-100 border-l-4 border-blue-500 text-blue-700",
  };

  return (
    <div className="flex items-center justify-center">
      <div
        className={`absolute top-30  p-4 mb-4 border-l-4 ${alertStyles[type]} shadow-lg z-50 rounded-3xl`}
      >
        <p>{message}</p>
      </div>
    </div>
  );
};

export default Alert;
