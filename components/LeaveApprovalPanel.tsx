// components/LeaveApprovalPanel.tsx
import { useEffect, useState } from "react";
import { db } from "../firebase.config";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { useAuth } from "../src/context/AuthContext";
import { useAlert } from "../src/context/AlertContext";
import Loader from "./Loader";

interface LeaveRequest {
  id: string;
  staffId: string;
  staffName: string;
  reason: string;
  requestedDates: { from: string; to: string };
  status: "Pending" | "Approved" | "Rejected";
  createdAt: string;
  approvedBy?: string;
}

const LeaveApprovalPanel = () => {
  const { user } = useAuth();
  const { showAlert } = useAlert();

  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, "leaveRequests"),
        orderBy("createdAt", "desc")
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

  const handleAction = async (id: string, action: "Approved" | "Rejected") => {
    try {
      const ref = doc(db, "leaveRequests", id);
      await updateDoc(ref, {
        status: action,
        approvedBy: user?.uid,
      });
      showAlert("Updated successfully!", "success");
      fetchRequests();
    } catch (err) {
      console.error(err);
      showAlert("Error updating request status", "error");
    }
  };

  useEffect(() => {
    if (user?.role === "IT" || user?.role === "Proprietor") {
      fetchRequests();
    }
  }, [user?.role]);

  if (user?.role !== "IT" && user?.role !== "Proprietor") return null;

  return (
    <div className="mt-12 p-6 max-w-5xl mx-auto bg-[#FFF7ED] rounded-2xl shadow-md border border-amber-200">
      <h2 className="text-2xl font-bold text-[#065F46] mb-6">Leave Requests</h2>

      {loading ? (
        <div className="flex justify-center items-center h-full w-full">
          <Loader />
        </div>
      ) : requests.length === 0 ? (
        <p className="text-center text-gray-500 text-sm">
          No leave requests available.
        </p>
      ) : (
        <ul className="space-y-6">
          {requests.map((req) => (
            <li
              key={req.id}
              className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-lg font-semibold text-[#065F46]">
                    {req.staffName}
                  </p>
                  <p className="text-sm text-gray-600">
                    {req.requestedDates.from} &ndash; {req.requestedDates.to}
                  </p>
                  <p className="text-sm text-gray-800">{req.reason}</p>
                </div>

                <span
                  className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    req.status === "Pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : req.status === "Approved"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {req.status}
                </span>
              </div>

              {req.status === "Pending" && (
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => handleAction(req.id, "Approved")}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleAction(req.id, "Rejected")}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition"
                  >
                    Reject
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LeaveApprovalPanel;
