import { useEffect, useState } from "react";
import { useAuth } from "../src/context/AuthContext";
import { useStaff } from "../src/context/StaffContext";
import { db } from "../firebase.config";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { StudentType } from "../src/types/StudentType";
import { useAlert } from "../src/context/AlertContext";

export default function SubjectTeacherAttendanceForm() {
  const { user } = useAuth();
  const { subjectClassStudents } = useStaff();
  const { showAlert } = useAlert();

  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [students, setStudents] = useState<StudentType[]>([]);
  const [absentStudents, setAbsentStudents] = useState<Record<string, boolean>>(
    {}
  );
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().slice(0, 10);
  const month = today.slice(0, 7);

  useEffect(() => {
    console.log("subjectClassStudents:", subjectClassStudents);
    if (!selectedClass) return;
    const filtered = subjectClassStudents.filter(
      (s) => s.class === selectedClass
    );
    setStudents(filtered);
  }, [selectedClass, subjectClassStudents]);

  ////////////////////////////////////////////

  const handleToggleAbsent = (studentId: string) => {
    setAbsentStudents((prev) => ({
      ...prev,
      [studentId]: !prev[studentId],
    }));
  };

  const handleSave = async () => {
    if (!selectedClass || !selectedSubject) {
      showAlert("Select both class and subject", "warning");
      return;
    }

    try {
      setLoading(true);
      const attendanceDocRef = doc(
        db,
        "classes",
        selectedClass,
        `attendance-${month}`,
        today
      );

      const docSnap = await getDoc(attendanceDocRef);
      const existing = docSnap.exists() ? docSnap.data() : {};
      const prevSubjectRecords = existing?.subjectAbsences || {};

      const newAbsences = {
        ...prevSubjectRecords,
        [selectedSubject]: {
          ...(prevSubjectRecords[selectedSubject] || {}),
          ...Object.fromEntries(
            Object.entries(absentStudents)
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              .filter(([_, isAbsent]) => isAbsent)
              .map(([id]) => {
                const s = students.find((stu) => stu.studentId === id);
                return [
                  id,
                  {
                    firstName: s?.firstName || "",
                    lastName: s?.lastName || "",
                    present: "no",
                    timestamp: Date.now(),
                  },
                ];
              })
          ),
        },
      };

      await setDoc(
        attendanceDocRef,
        {
          subjectAbsences: newAbsences,
        },
        { merge: true }
      );

      showAlert("Attendance saved!", "success");
    } catch (error) {
      console.error(error);
      showAlert("Failed to save attendance.", "error");
    } finally {
      setLoading(false);
    }
  };

  const teacherClasses = user?.subjectAssignments?.map((a) => a.class) || [];
  const teacherSubjects = user?.subjectAssignments?.map((a) => a.subject) || [];

  if (user?.role !== "SubjectTeacher" && user?.role !== "FormTeacher") {
    return (
      <div className="p-6 text-red-600 font-bold bg-red-50 rounded-lg text-center mt-8">
        🚫 You do not have access to this section.
      </div>
    );
  }

  return (
    <div className="p-6 bg-[#FFF7ED] rounded-2xl shadow-md mt-10 max-w-4xl mx-auto border border-[#FDE68A]">
      <h2 className="text-2xl font-bold text-[#065F46] text-center mb-6">
        📘 Subject Class Attendance —{" "}
        <span className="text-[#F59E0B]">{today}</span>
      </h2>

      {/* Selectors */}
      <div className="flex flex-col md:flex-row gap-4 justify-center mb-6">
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="p-3 border border-emerald-300 rounded-lg w-full md:w-1/2 focus:outline-none focus:ring-2 focus:ring-[#10B981]"
        >
          <option value="">Select Subject</option>
          {[...new Set(teacherSubjects)].map((sub, idx) => (
            <option key={idx} value={sub}>
              {sub}
            </option>
          ))}
        </select>{" "}
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="p-3 border border-emerald-300 rounded-lg w-full md:w-1/2 focus:outline-none focus:ring-2 focus:ring-[#10B981]"
        >
          <option value="">Select Class</option>
          {[...new Set(teacherClasses)].map((cls, idx) => (
            <option key={idx} value={cls}>
              {cls}
            </option>
          ))}
        </select>
      </div>

      {/* Attendance List */}
      {students.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <ul className="divide-y">
            {students.map((student) => (
              <li
                key={student.studentId}
                className="flex justify-between items-center py-3"
              >
                <span className="text-[#065F46] font-medium">
                  {student.firstName} {student.lastName}
                </span>
                <button
                  onClick={() => handleToggleAbsent(student.studentId)}
                  className={`px-4 py-1 rounded-full font-semibold text-sm transition ${
                    absentStudents[student.studentId]
                      ? "bg-[#EF4444] text-white"
                      : "bg-[#E5E7EB] text-gray-700 hover:bg-[#D1D5DB]"
                  }`}
                >
                  {absentStudents[student.studentId]
                    ? "🚫 Marked Absent"
                    : "Mark Absent"}
                </button>
              </li>
            ))}
          </ul>

          <button
            onClick={handleSave}
            disabled={loading}
            className="mt-6 w-full md:w-auto px-6 py-2 bg-[#10B981] text-white font-semibold rounded-lg hover:bg-[#059669] transition"
          >
            {loading ? "Saving..." : "Save Subject Attendance"}
          </button>
        </div>
      )}
    </div>
  );
}
