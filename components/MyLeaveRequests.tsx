import { useEffect, useState } from "react";
import { useAuth } from "../src/context/AuthContext";
import { db } from "../firebase.config";
import {
  collection,
  query,
  where,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import Loader from "./Loader";

interface LeaveRequest {
  id: string;
  reason: string;
  requestedDates: { from: string; to: string };
  status: "Pending" | "Approved" | "Rejected";
  createdAt: Timestamp;
}

const MyLeaveRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMyRequests = async () => {
    if (!user?.uid) return;

    setLoading(true);
    try {
      const q = query(
        collection(db, "leaveRequests"),
        where("staffId", "==", user.uid)
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as LeaveRequest[];

      setRequests(data);
    } catch (err) {
      console.error("Error fetching leave requests:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyRequests();
  }, [user?.uid]);

  if (user?.role === "IT" || user?.role === "Proprietor") return null;

  return (
    <div className="mt-10 p-6 bg-[#FDE68A] text-[#065F46] rounded-xl shadow-lg max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#78350F]">
          🗂️ My Leave Requests
        </h2>
        <button
          onClick={fetchMyRequests}
          className="text-[#e09005] font-bold hover:underline"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-full w-full">
          <Loader />
        </div>
      ) : requests.length === 0 ? (
        <p className="text-[#78350F] text-center">
          You haven’t submitted any leave requests yet.
        </p>
      ) : (
        <ul className="space-y-4">
          {requests.map((req) => (
            <li
              key={req.id}
              className="p-4 rounded-lg bg-white shadow flex flex-col sm:flex-row sm:justify-between sm:items-center"
            >
              <div>
                <p className="font-semibold text-[#065F46]">
                  {req.requestedDates.from} → {req.requestedDates.to}
                </p>
                <p className="text-sm text-gray-700 mt-1">{req.reason}</p>
              </div>
              <span
                className={`mt-2 sm:mt-0 px-4 py-1 text-sm font-semibold rounded-full capitalize text-white ${
                  req.status === "Pending"
                    ? "bg-[#F59E0B]"
                    : req.status === "Approved"
                    ? "bg-[#10B981]"
                    : "bg-red-500"
                }`}
              >
                {req.status}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MyLeaveRequests;
