import { motion } from "framer-motion";
import { useAuth } from "../src/context/AuthContext";
import Loader from "../components/Loader";
import { useState } from "react";

export default function Login() {
  const {
    setLogInEmail,
    setLogInPassword,
    login,
    loginAsGuardian,
    isLoading,
    logInPassword,
    logInEmail,
  } = useAuth();

  type StaffKey =
    | "Admin"
    | "FormTeacher"
    | "SubjectTeacher"
    | "Proprietor"
    | "IT"
    | "HOD"
    | "Librarian"
    | "Accountant"
    | "Receptionist"
    | "Guardian";

  const STAFF_PRESETS: Record<StaffKey, { email: string; password: string }> = {
    Admin: { email: "admin@school.test", password: "Admin!234" },
    FormTeacher: {
      email: "joy@evergreen.com",
      password: "0000@Evergreen",
    },
    SubjectTeacher: {
      email: "tonye@evergreen.com",
      password: "0000@Evergreen",
    },
    Proprietor: {
      email: "kat@evergreen.com",
      password: "0000@Evergreen",
    },
    Librarian: {
      email: "ani@evergreen.com",
      password: "0000@Evergreen",
    },
    HOD: {
      email: "ayo@evergreen.com",
      password: "0000@Evergreen",
    },
    Accountant: {
      email: "clark@evergreen.com",
      password: "0000@Evergreen",
    },
    IT: {
      email: "femi@evergreen.com",
      password: "0000@Evergreen",
    },
    Receptionist: {
      email: "jamesanderson@evergreen.com",
      password: "0000@Evergreen",
    },
    Guardian: {
      email: "jodustin@email.com",
      password: "0000_Guardian123",
    },
  };

  const [selectedRole, setSelectedRole] = useState<StaffKey | null>(null);

  const handlePickRole = (role: StaffKey) => {
    setSelectedRole(role);
    const { email, password } = STAFF_PRESETS[role];
    setLogInEmail(email);
    setLogInPassword(password);
  };

  return (
    <>
      {!isLoading ? (
        <div className="min-h-screen bg-[#FFF7ED] flex items-center justify-center px-4">
          <div className="w-full max-w-md mx-auto">
            {/* Login as: role toggle */}
            <div className="mb-4">
              <p className="mb-2 text-sm font-semibold text-[#065F46]">
                Login as
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(Object.keys(STAFF_PRESETS) as StaffKey[]).map((role) => {
                  const isActive = selectedRole === role;
                  return (
                    <motion.button
                      key={role}
                      type="button"
                      onClick={() => handlePickRole(role)}
                      whileTap={{ scale: 0.97 }}
                      whileHover={{ scale: 1.02 }}
                      className={[
                        "rounded-full border px-3 py-2 text-sm",
                        "transition shadow-sm",
                        isActive
                          ? "bg-[#10B981] text-white border-[#10B981]"
                          : "bg-white text-[#065F46] border-[#F59E0B] hover:bg-[#FFF7ED]",
                      ].join(" ")}
                    >
                      {role}
                    </motion.button>
                  );
                })}
              </div>
              {selectedRole && (
                <p className="mt-2 text-xs text-[#78350F] mb-4">
                  Auto-filled for{" "}
                  <span className="font-semibold">{selectedRole}</span>.
                </p>
              )}
            </div>

            <p className="text-center text-[#78350F] mb-6 text-sm">
              Enter your credentials to access the system
            </p>

            <motion.input
              type="email"
              value={logInEmail}
              onChange={(e) => setLogInEmail(e.target.value)}
              className="w-full mb-4 p-3 border border-[#F59E0B] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#10B981] bg-white text-[#065F46] placeholder:text-[#78350F]"
              placeholder="Email"
              disabled
              whileFocus={{ scale: 1.01 }}
            />

            <motion.input
              type="password"
              value={logInPassword}
              onChange={(e) => setLogInPassword(e.target.value)}
              className="w-full mb-6 p-3 border border-[#F59E0B] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#10B981] bg-white text-[#065F46] placeholder:text-[#78350F]"
              placeholder="Password"
              disabled
              whileFocus={{ scale: 1.01 }}
            />

            <div className="flex justify-between gap-4">
              <motion.button
                onClick={login}
                whileTap={{ scale: 0.96 }}
                whileHover={{ scale: 1.03 }}
                className="w-full bg-[#10B981] text-white py-2 rounded-full shadow hover:bg-[#059669] transition"
              >
                Staff Login
              </motion.button>
              <motion.button
                onClick={loginAsGuardian}
                whileTap={{ scale: 0.96 }}
                whileHover={{ scale: 1.03 }}
                className="w-full bg-[#78350F] text-white py-2 rounded-full shadow hover:bg-[#5A2E0C] transition"
              >
                Guardian Login
              </motion.button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex justify-center items-center h-screen w-full">
          <Loader />
        </div>
      )}
    </>
  );
}
