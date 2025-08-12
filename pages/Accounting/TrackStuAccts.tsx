import { useState } from "react";
import SetTuitionFee from "../../components/Accounting/SetTuitionFee";
import RecordPayment from "../../components/Accounting/RecordPayment";
import FeeSummary from "../../components/Accounting/FeeSummary";
import { useAuth } from "../../src/context/AuthContext";
import { StudentType } from "../../src/types/StudentType";
import { useStudent } from "../../src/context/StudentContext";
import Navbar from "../../components/NavBar";
import { useAlert } from "../../src/context/AlertContext";

export default function TrackStuAcct() {
  const [studentId, setStudentId] = useState("");

  const { user } = useAuth();
  const staffId = user?.staffId;

  const [studentDocId, setStudentDocId] = useState<string | null>(null);
  const [studentData, setStudentData] = useState<StudentType | null>(null);

  const { students } = useStudent();
  const { showAlert } = useAlert();

  const currentYear = new Date().getFullYear();
  const termOptions = ["Term 1", "Term 2", "Term 3"];
  const [selectedTerm, setSelectedTerm] = useState(termOptions[0]);
  const termId = `${currentYear}-${selectedTerm.replace(" ", "-")}`;

  const fetchStudent = () => {
    const found = students.find((student) => student.studentId === studentId);
    if (found) {
      setStudentDocId(found.id);
      setStudentData(found as StudentType);
    } else {
      showAlert("No student found with that ID", "error");
      setStudentData(null);
      setStudentDocId(null);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#FFF7ED] pb-10 px-6 space-y-10 pt-26">
        <h1 className="text-3xl font-bold text-center text-[#065F46]">
          💰 Track Student Tuition Payments
        </h1>

        {/* Student & Term Input */}
        <div className="bg-white p-6 rounded-xl shadow-md max-w-3xl mx-auto border border-gray-200 space-y-4">
          <h2 className="text-xl font-semibold text-[#78350F]">
            🎓 Student Info
          </h2>

          <div className="flex flex-col md:flex-row gap-4">
            <select
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-3 bg-white text-gray-800"
            >
              {termOptions.map((term) => (
                <option key={term} value={term}>
                  {term} ({currentYear})
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Enter Student UID"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  fetchStudent();
                }
              }}
              className="w-full border border-gray-300 rounded-md p-3 bg-white text-gray-800"
            />
          </div>
        </div>

        {/* Tuition Actions */}
        {studentData && studentDocId && (
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <div className="bg-[#FDE68A] p-6 rounded-xl shadow border border-yellow-300">
              <SetTuitionFee studentDocId={studentDocId} termId={termId} />
            </div>

            <div className="bg-[#FDE68A] p-6 rounded-xl shadow border border-yellow-300">
              <RecordPayment
                studentDocId={studentDocId}
                studentData={studentData}
                termId={termId}
                staffId={staffId!}
              />
            </div>
          </div>
        )}

        {/* Fee Summary */}
        {studentData && studentId && studentDocId && (
          <div className="max-w-5xl mx-auto bg-white p-6 rounded-xl shadow border border-gray-200">
            <h2 className="text-xl font-semibold text-[#065F46] mb-4">
              Payment Summary
            </h2>
            <FeeSummary
              studentDocId={studentDocId}
              termId={termId}
              studentId={studentId}
            />
          </div>
        )}
      </div>
    </>
  );
}
