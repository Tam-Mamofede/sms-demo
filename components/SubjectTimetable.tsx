import { useState } from "react";
import { useAuth } from "../src/context/AuthContext";
import SetTimeTable from "./Classes/SetTimetable";

export default function SubjectTimetable() {
  const { user } = useAuth();
  const [selectedClass, setSelectedClass] = useState("");

  return (
    <div className="min-h-screen bg-[#FFF7ED] p-6">
      <div className="max-w-4xl mx-auto bg-[#FDE68A] p-6 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold text-[#065F46] mb-4 text-center">
          📘 Subject Timetable Editor
        </h2>
        <label className="block mb-2 font-semibold text-[#78350F]">
          Select a class to edit:
        </label>
        <select
          className="w-full p-3 rounded-lg border border-emerald-300 mb-6 focus:ring-2 focus:ring-[#10B981]"
          onChange={(e) => setSelectedClass(e.target.value)}
        >
          <option value="">-- Choose Class --</option>
          {user?.subjectAssignments?.map((assign, idx) => (
            <option key={idx} value={assign.class}>
              {assign.class}
            </option>
          ))}
        </select>

        {selectedClass && <SetTimeTable classId={selectedClass} />}
      </div>
    </div>
  );
}
