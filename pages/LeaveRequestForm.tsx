import { useState } from "react";
import { useAuth } from "../src/context/AuthContext";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "../firebase.config";
import Navbar from "../components/NavBar";
import MyLeaveRequests from "../components/MyLeaveRequests";
import { useAlert } from "../src/context/AlertContext";

const LeaveRequestForm = () => {
  const { user } = useAuth();
  const { showAlert } = useAlert();

  const [reason, setReason] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!reason || !fromDate || !toDate) {
      showAlert("Please fill out all fields.", "warning");
      return;
    }

    try {
      setLoading(true);
      await addDoc(collection(db, "leaveRequests"), {
        staffId: user?.uid,
        staffName: `${user?.firstName} ${user?.lastName}`,
        reason,
        requestedDates: { from: fromDate, to: toDate },
        status: "Pending",
        createdAt: Timestamp.now(),
      });

      showAlert("Leave request submitted!", "success");
      setReason("");
      setFromDate("");
      setToDate("");
    } catch (error) {
      console.error("Error submitting leave request:", error);
      showAlert("Failed to submit request.", "error");
    } finally {
      setLoading(false);
    }
  };

  if (user?.role === "IT" || user?.role === "Proprietor") return null;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#FFF7ED] text-[#065F46] mt-26">
        <div className="max-w-3xl mx-auto mt-12 p-6 md:p-10 bg-[#FDE68A] rounded-2xl shadow-lg">
          <h1 className="text-3xl font-bold text-center mb-6 text-[#78350F]">
            Request for Leave
          </h1>

          <div className="space-y-6">
            {/* Reason */}
            <div>
              <label className="block font-semibold mb-1">Reason</label>
              <textarea
                className="w-full p-3 rounded-md border border-gray-700 focus:ring-2 focus:ring-[#10B981] resize-none"
                rows={4}
                placeholder="e.g. Personal time, medical appointment, etc."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>

            {/* Date Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block font-semibold mb-1">From</label>
                <input
                  type="date"
                  className="w-full p-2 border border-gray-700 rounded-md focus:ring-2 focus:ring-[#10B981]"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">To</label>
                <input
                  type="date"
                  className="w-full p-2 border border-gray-700 rounded-md focus:ring-2 focus:ring-[#10B981]"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </div>
            </div>

            {/* Submit */}
            <div className="text-center">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className={`mt-4 px-6 py-2 rounded-lg font-semibold shadow-md transition text-white ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#10B981] hover:bg-[#059669]"
                }`}
              >
                {loading ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto mt-10 px-4">
          <MyLeaveRequests />
        </div>
      </div>
    </>
  );
};

export default LeaveRequestForm;
