import { useNavigate } from "react-router-dom";
import { LockIcon } from "lucide-react";

export default function NotAuthorized() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FFF7ED] flex items-center justify-center px-4">
      <div className="bg-[#FDE68A] border border-[#F59E0B] text-[#065F46] rounded-3xl shadow-xl p-10 max-w-md w-full text-center space-y-4">
        <div className="flex justify-center mb-2">
          <LockIcon className="w-14 h-14 text-[#78350F]" />
        </div>

        <h1 className="text-3xl font-bold">Access Denied 🚫</h1>

        <p className="text-[#78350F] text-sm">
          You don’t have permission to view this page. If this seems wrong,
          contact your school administrator or IT support.
        </p>

        <button
          onClick={() => navigate("/log-in")}
          className="mt-4 bg-[#10B981] hover:bg-[#059669] text-white font-semibold px-6 py-2 rounded-full transition duration-300 shadow"
        >
          🔐 Back to Login
        </button>
      </div>
    </div>
  );
}
