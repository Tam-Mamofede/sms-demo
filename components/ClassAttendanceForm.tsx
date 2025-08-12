import { db } from "../firebase.config";
import { collection, doc, getDoc, setDoc } from "firebase/firestore";
import { useAuth } from "../src/context/AuthContext";
import { useStaff } from "../src/context/StaffContext";
import { useAlert } from "../src/context/AlertContext";

export default function ClassAttendanceForm() {
  const { user } = useAuth();
  const { assignedStudents, setAttendance, attendance } = useStaff();
  const { showAlert } = useAlert();

  const today = new Date().toISOString().split("T")[0]; // Format: YYYY-MM-DD

  const handleMarkAttendance = (studentId: string, status: "yes" | "no") => {
    setAttendance((prev) => {
      const current = prev[studentId];

      if (current?.present.present === status) {
        const updated = { ...prev };
        delete updated[studentId];
        return updated;
      }

      return {
        ...prev,
        [studentId]: {
          firstName:
            assignedStudents.find((s) => s.studentId === studentId)
              ?.firstName || "",
          lastName:
            assignedStudents.find((s) => s.studentId === studentId)?.lastName ||
            "",
          present: {
            firstName:
              assignedStudents.find((s) => s.studentId === studentId)
                ?.firstName || "",
            lastName:
              assignedStudents.find((s) => s.studentId === studentId)
                ?.lastName || "",
            present: status,
            timestamp: Date.now(),
          },
        },
      };
    });
  };
  //////////////////////////////////////////////////////////
  const handleSave = async () => {
    console.log(`Clicked`);
    try {
      const classId = user?.formTeacherClass || "JSS 1";
      const today = new Date();
      const formattedDate = today.toISOString().slice(0, 10);
      const month = today.toISOString().slice(0, 7); // "YYYY-MM"

      // const formClassRef = doc(db, "classes", classId);
      const attendanceRef = doc(
        collection(db, "classes", classId, `attendance-${month}`),
        formattedDate
      );

      const docSnap = await getDoc(attendanceRef);
      const existingData = docSnap.exists()
        ? docSnap.data()?.students || {}
        : {};

      const updatedAttendance = {
        ...existingData,
        ...Object.fromEntries(
          assignedStudents.map((student) => [
            student.studentId,
            {
              firstName: student.firstName,
              lastName: student.lastName,
              present: attendance[student.studentId]?.present || {
                present: "no",
                firstName: student.firstName,
                lastName: student.lastName,
                timestamp: Date.now(),
              },
            },
          ])
        ),
      };

      await setDoc(
        attendanceRef,
        {
          classId,
          students: updatedAttendance,
        },
        { merge: true }
      );

      showAlert("Attendance saved!", "success");
    } catch (error) {
      console.error("Error saving attendance:", error);
      showAlert("Failed to save attendance. Please try again.", "error");
    }
  };

  return (
    <div className="p-6 bg-[#FFF7ED] rounded-2xl shadow-md border border-[#FDE68A] max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-center text-[#065F46] mb-6">
        📆 Class Attendance for <span className="text-[#F59E0B]">{today}</span>
      </h2>

      <ul className="divide-y">
        {assignedStudents.map((student) => (
          <li
            key={student.id}
            className="flex justify-between items-center py-4 px-2 bg-white hover:bg-[#f0fdf4] transition rounded-md"
          >
            <span className="text-[#065F46] font-medium">
              {student.firstName} {student.lastName}
            </span>
            <div className="flex gap-3">
              <button
                onClick={() => handleMarkAttendance(student.studentId, "yes")}
                className={`px-4 py-1 rounded-full font-semibold text-sm shadow transition ${
                  attendance[student.studentId]?.present.present === "yes"
                    ? "bg-[#10B981] text-white"
                    : "bg-[#E5E7EB] text-gray-700 hover:bg-[#D1D5DB]"
                }`}
              >
                Present
              </button>
              <button
                onClick={() => handleMarkAttendance(student.studentId, "no")}
                className={`px-4 py-1 rounded-full font-semibold text-sm shadow transition ${
                  attendance[student.studentId]?.present.present === "no"
                    ? "bg-[#EF4444] text-white"
                    : "bg-[#E5E7EB] text-gray-700 hover:bg-[#D1D5DB]"
                }`}
              >
                Absent
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="text-center mt-6">
        <button
          onClick={handleSave}
          className="px-6 py-3 bg-[#3B82F6] text-white font-semibold rounded-lg hover:bg-[#2563EB] transition"
        >
          Save Attendance
        </button>
      </div>
    </div>
  );
}
