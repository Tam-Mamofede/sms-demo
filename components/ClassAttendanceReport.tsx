import { useEffect, useState } from "react";
import { useStaff } from "../src/context/StaffContext";
import { useAuth } from "../src/context/AuthContext";
import { collection, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase.config";
import { StudentAttendanceType } from "../src/types/StudentAttendanceType";
import { useAlert } from "../src/context/AlertContext";

interface AttendanceProps {
  date: string;
}

export const ClassAttendanceReport: React.FC<AttendanceProps> = ({ date }) => {
  const [isLoading, setIsLoading] = useState(false);

  const { user } = useAuth();
  const { showAlert } = useAlert();
  const { setAttendance, attendance } = useStaff();

  const fetchAttendance = async () => {
    try {
      setIsLoading(true);

      const classId = user?.formTeacherClass || "JSS 1";
      const today = new Date();
      const formattedDate = today.toISOString().slice(0, 10);
      const month = today.toISOString().slice(0, 7); // "YYYY-MM"

      const attendanceRef = doc(
        collection(db, "classes", classId, `attendance-${month}`),
        formattedDate
      );

      const docSnap = await getDoc(attendanceRef);

      const data = docSnap.data();
      if (data && data.students) {
        setAttendance(data.students);
      } else {
        showAlert("No attendance records found.", "warning");
      }
    } catch (error) {
      console.error(error);
      showAlert("Could not find attendance records.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!attendance || Object.keys(attendance).length === 0) {
      fetchAttendance();
    }
  }, [date]);

  return (
    <div className="p-6 mt-8 bg-[#FFF7ED] rounded-2xl shadow border border-[#FDE68A] max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-center text-[#065F46] mb-6">
        🗂️ Attendance Report – <span className="text-[#F59E0B]">{date}</span>
      </h2>

      <div className="flex justify-center mb-6">
        <button
          onClick={() => fetchAttendance()}
          disabled={isLoading}
          className={`px-6 py-2 rounded-lg font-medium text-white transition shadow ${
            isLoading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-[#F59E0B] hover:bg-amber-500"
          }`}
        >
          {isLoading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {!attendance || Object.keys(attendance).length === 0 ? (
        <p className="text-center text-gray-600">
          😕 No attendance records found. Try hitting refresh again.
        </p>
      ) : (
        <ul className="divide-y">
          {Object.entries(attendance).map(([id, student]) => {
            const studentData = student as StudentAttendanceType[string];
            return (
              <li
                key={id}
                className="flex justify-between items-center py-3 px-4 bg-white hover:bg-[#fef3c7] transition"
              >
                <span className="font-medium text-[#065F46]">
                  {studentData.firstName} {studentData.lastName}
                </span>
                <span
                  className={`text-sm font-semibold ${
                    studentData.present?.present === "yes"
                      ? "text-green-600"
                      : studentData.present?.present === "no"
                      ? "text-red-600"
                      : "text-yellow-600"
                  }`}
                >
                  {studentData.present?.present === "yes"
                    ? "✅ Present"
                    : studentData.present?.present === "no"
                    ? "❌ Absent"
                    : "⚠️ Not Marked"}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
