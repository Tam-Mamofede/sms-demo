import { useState } from "react";
import { useAuth } from "../src/context/AuthContext";
import ClassSubjectGradeReport from "./Grading/ClassSubjectGradeReport";

export default function ClassSubjectGrade() {
  const { user } = useAuth();
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");

  const uniqueClasses = [
    ...new Set(user?.subjectAssignments?.map((s) => s.class)),
  ];

  const uniqueSubjects = [
    ...new Set(user?.subjectAssignments?.map((s) => s.subject)),
  ];

  return (
    <div className="min-h-screen bg-[#FFF7ED] text-[#065F46] p-6">
      <div className="max-w-3xl mx-auto bg-[#FDE68A] rounded-2xl shadow-lg p-6">
        <h2 className="text-3xl font-bold text-center mb-8 text-[#78350F]">
          📊 Class & Subject Grade Report
        </h2>

        {/* Class Selector */}
        <div className="mb-6">
          <label className="block mb-2 font-semibold text-[#065F46]">
            Select a class to view report:
          </label>
          <select
            className="w-full p-3 border border-stone-700 rounded-lg focus:ring-2 focus:ring-[#10B981]"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            <option value="">-- Choose Class --</option>
            {uniqueClasses.map((classId, idx) => (
              <option key={idx} value={classId}>
                {classId}
              </option>
            ))}
          </select>
        </div>

        {/* Subject Selector */}
        <div className="mb-6">
          <label className="block mb-2 font-semibold text-[#065F46]">
            Select a subject to view report:
          </label>
          <select
            className="w-full p-3 border border-stone-700 rounded-lg focus:ring-2 focus:ring-[#10B981]"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
          >
            <option value="">-- Choose Subject --</option>
            {uniqueSubjects.map((subject, idx) => (
              <option key={idx} value={subject}>
                {subject}
              </option>
            ))}
          </select>
        </div>

        {/* Report View */}
        {selectedClass && selectedSubject && (
          <div className="mt-8 bg-white p-4 rounded-xl shadow-inner border border-[#FDE68A]">
            <ClassSubjectGradeReport
              classId={selectedClass}
              subjectName={selectedSubject}
            />
          </div>
        )}
      </div>
    </div>
  );
}
