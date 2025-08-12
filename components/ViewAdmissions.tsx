import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  orderBy,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase.config";
import { useAlert } from "../src/context/AlertContext";
import Loader from "./Loader";

type AdmissionType = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  classApplying: string;
  guardianName: string;
  guardianPhone: string;
  submittedAt?: { toDate: () => Date };
  status: string;
};

export default function ViewAdmissions() {
  const { showAlert } = useAlert();

  const [admissions, setAdmissions] = useState<AdmissionType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdmissions = async () => {
      try {
        const q = query(
          collection(db, "admissions"),
          orderBy("submittedAt", "desc")
        );
        const snapshot = await getDocs(q);
        const data: AdmissionType[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as AdmissionType[];
        setAdmissions(data);
      } catch (err) {
        console.error("Error fetching admissions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdmissions();
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const ref = doc(db, "admissions", id);
      await updateDoc(ref, { status: newStatus });

      setAdmissions((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
      );

      showAlert(`Status updated to "${newStatus}"`, "success");
    } catch (err) {
      console.error("Error updating status:", err);
      showAlert("Failed to update status", "error");
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF7ED] py-10 px-4">
      <h1 className="text-4xl font-bold text-center text-[#065F46] mb-10">
        🎓 Admission Applications
      </h1>

      {loading ? (
        <div className="flex justify-center items-center h-full w-full">
          <Loader />
        </div>
      ) : admissions.length === 0 ? (
        <p className="text-center text-amber-100 text-lg">
          No applications yet.
        </p>
      ) : (
        <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {admissions.map((app) => (
            <div
              key={app.id}
              className={`relative rounded-2xl p-6 shadow-lg border-2 ${
                app.status === "accepted"
                  ? "bg-[#10B981] text-white border-[#065F46]"
                  : app.status === "rejected"
                  ? "bg-rose-100 text-rose-900 border-rose-300"
                  : app.status === "reviewed"
                  ? "bg-[#FFFBF0] border-amber-300"
                  : "bg-white border-gray-200"
              }`}
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h2 className="text-xl font-bold">
                    {app.firstName} {app.lastName}
                  </h2>
                  <p className="text-sm text-amber-100 italic">
                    Applying for {app.classApplying}
                  </p>
                </div>
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full ${
                    app.status === "accepted"
                      ? "bg-white text-[#065F46]"
                      : app.status === "rejected"
                      ? "bg-rose-200 text-rose-700"
                      : app.status === "reviewed"
                      ? "bg-amber-200 text-[#78350F]"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {app.status.toUpperCase()}
                </span>
              </div>

              {/* Info Section */}
              <div className="space-y-1 text-sm">
                <p>
                  <strong>Email:</strong> {app.email}
                </p>
                <p>
                  <strong>DOB:</strong> {app.dateOfBirth}
                </p>
                <p>
                  <strong>Guardian:</strong> {app.guardianName}
                </p>
                <p>
                  <strong>Phone:</strong> {app.guardianPhone}
                </p>
              </div>

              {/* Status Control */}
              <div className="mt-4 space-y-1">
                <label className="text-xs font-medium text-amber-100">
                  Update Status:
                </label>
                <select
                  value={app.status}
                  onChange={(e) => handleStatusChange(app.id, e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-lg text-sm bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-400 text-[#78350F]"
                >
                  <option value="pending">Pending</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              {/* Footer */}
              <p className="mt-4 text-xs text-amber-100 italic">
                Submitted:{" "}
                {app.submittedAt?.toDate?.().toLocaleString?.() ?? "Unknown"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // return (
  //   <div className="min-h-screen bg-[#FFF7ED] p-6">
  //     <h1 className="text-3xl font-bold text-[#065F46] mb-6 text-center">
  //       Admission Applications
  //     </h1>

  //     {loading ? (
  //       <p className="text-center text-lg text-[#78350F]">
  //         Loading applications...
  //       </p>
  //     ) : admissions.length === 0 ? (
  //       <p className="text-center text-gray-600">No applications yet.</p>
  //     ) : (
  //       <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
  //         {admissions.map((app) => (
  //           <div
  //             key={app.id}
  //             className={`rounded-2xl shadow-md p-5 space-y-2 text-[#065F46] ${
  //               app.status === "accepted"
  //                 ? "bg-[#065F46] text-white" // light emerald
  //                 : "bg-[#FDE68A]" // default soft yellow
  //             }`}
  //           >
  //             <h2 className="text-xl font-bold">
  //               {app.firstName} {app.lastName}
  //             </h2>
  //             <p>
  //               <span className="font-semibold">Email:</span> {app.email}
  //             </p>
  //             <p>
  //               <span className="font-semibold">DOB:</span> {app.dateOfBirth}
  //             </p>
  //             <p>
  //               <span className="font-semibold">Class:</span>{" "}
  //               {app.classApplying}
  //             </p>
  //             <p>
  //               <span className="font-semibold">Guardian:</span>{" "}
  //               {app.guardianName}
  //             </p>
  //             <p>
  //               <span className="font-semibold">Phone:</span>{" "}
  //               {app.guardianPhone}
  //             </p>

  //             <div>
  //               <span className="font-semibold">Status:</span>{" "}
  //               <select
  //                 value={app.status}
  //                 onChange={(e) => handleStatusChange(app.id, e.target.value)}
  //                 className="ml-2 bg-[#F59E0B] text-[#78350F] font-semibold px-3 py-1 rounded"
  //               >
  //                 <option value="pending">Pending</option>
  //                 <option value="reviewed">Reviewed</option>
  //                 <option value="accepted">Accepted</option>
  //                 <option value="rejected">Rejected</option>
  //               </select>
  //             </div>

  //             <p className="text-sm ">
  //               Submitted:{" "}
  //               {app.submittedAt?.toDate?.().toLocaleString?.() ?? "Unknown"}
  //             </p>
  //           </div>
  //         ))}
  //       </div>
  //     )}
  //   </div>
  // );
}
