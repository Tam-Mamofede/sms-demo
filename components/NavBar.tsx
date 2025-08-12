import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../src/context/AuthContext";

const Navbar: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 bg-[#FDE68A]/90 backdrop-blur-md shadow-lg rounded-full px-6 py-3 w-[95%] max-w-5xl border border-[#F59E0B]">
      <div className="flex justify-between items-center">
        {/* Logo */}
        <Link
          to="/staff-dashboard"
          className="text-[#065F46] font-bold text-xl tracking-wide hover:underline"
        >
          🌱 Evergreen
        </Link>

        {/* Menu */}
        <ul className="flex items-center gap-4 text-sm font-medium text-[#78350F]">
          <li>
            <button
              onClick={() => navigate(-1)}
              className="hover:text-[#065F46] transition duration-200"
            >
              ← Go Back
            </button>
          </li>
          <li>
            <Link
              to="/"
              className="hover:text-[#065F46] transition duration-200"
            >
              Contact Support
            </Link>
          </li>
          <li>
            <Link
              to="/user-change-password"
              className="hover:text-[#065F46] transition duration-200"
            >
              Change Password
            </Link>
          </li>
          <li>
            <button
              onClick={logout}
              className="hover:text-[#065F46] transition duration-200"
            >
              Log Out
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
