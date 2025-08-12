import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FFF7ED] flex flex-col items-center justify-center px-4 text-center">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-[#FDE68A] border border-[#F59E0B] rounded-3xl shadow-lg p-10 max-w-md w-full"
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="mb-6"
        >
          <svg
            width="100"
            height="100"
            viewBox="0 0 24 24"
            fill="none"
            className="mx-auto"
          >
            <path
              d="M3 4.5A2.5 2.5 0 015.5 2H20a1 1 0 011 1v15a1 1 0 01-1.447.894L17 17.118l-3.553 1.776a1 1 0 01-.894 0L9 17.118l-3.553 1.776A1 1 0 014 18V5.5A.5.5 0 003.5 5h-.001A.5.5 0 003 4.5z"
              fill="#10B981"
            />
            <circle cx="9" cy="10" r="1.5" fill="#78350F" />
            <circle cx="15" cy="10" r="1.5" fill="#78350F" />
            <path
              d="M8.5 13c.667.667 1.333 1 2 1s1.333-.333 2-1"
              stroke="#78350F"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </motion.div>

        <h1 className="text-3xl font-bold text-[#065F46] mb-2">
          Page Not Found
        </h1>
        <p className="text-[#78350F] mb-6">
          It seems you've wandered off the timetable! This page doesn’t exist.
        </p>
        <button
          onClick={() => navigate("/log-in")}
          className="bg-[#10B981] hover:bg-[#059669] text-white px-6 py-2 rounded-full transition duration-200"
        >
          Back to Log in
        </button>
      </motion.div>
    </div>
  );
}
