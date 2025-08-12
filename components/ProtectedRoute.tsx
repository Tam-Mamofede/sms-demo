import { useNavigate } from "react-router-dom";
import { useAuth } from "../src/context/AuthContext";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const navigate = useNavigate();
  const { isAuthenticated, user, guardianUser, isLoading } = useAuth();

  const role = user?.role || guardianUser?.role;

  useEffect(() => {
    if (role && !allowedRoles.includes(role)) {
      navigate("/not-authorized");
    } else if (!isAuthenticated || !role) {
      navigate("/log-in");
    }
  }, [isAuthenticated, role, allowedRoles, navigate, isLoading]);

  if (!isAuthenticated || !role || !allowedRoles.includes(role)) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
