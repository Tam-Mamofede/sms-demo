import { useEffect, useState } from "react";
import { db } from "../../firebase.config";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "../../src/context/AuthContext";

const daysOfWeek = ["monday", "tuesday", "wednesday", "thursday", "friday"];

interface Slot {
  startTime: string;
  endTime: string;
  subjectId: string;
  teacherId: string;
}

const FormClassTimetable = () => {
  const { user } = useAuth();
  const [weeklyData, setWeeklyData] = useState<Record<string, Slot[]>>({});

  const classId = user?.formTeacherClass;
  const isFormTeacher = user?.role === "FormTeacher";

  useEffect(() => {
    if (!classId || !isFormTeacher) return;

    const fetchTimetables = async () => {
      const data: Record<string, Slot[]> = {};

      for (const day of daysOfWeek) {
        const ref = doc(db, "classes", classId, "timetable", day);
        const snapshot = await getDoc(ref);
        if (snapshot.exists()) {
          data[day] = snapshot.data().slots || [];
        } else {
          data[day] = [];
        }
      }

      setWeeklyData(data);
    };

    fetchTimetables();
  }, [classId, isFormTeacher]);

  if (!isFormTeacher) {
    return (
      <div className="text-center text-red-600 font-semibold mt-6">
        🚫 You do not have permission to view this timetable.
      </div>
    );
  }

  return (
    <div className="mt-10 bg-[#FFF7ED] p-4 rounded-xl shadow-inner border border-[#FDE68A]">
      <h2 className="text-2xl font-bold text-center text-[#065F46] mb-6">
        🗓️ Weekly Timetable for{" "}
        <span className="text-[#F59E0B]">{classId}</span>
      </h2>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-center border-separate border-spacing-0">
          <thead>
            <tr className="bg-[#FDE68A] text-[#78350F]">
              {daysOfWeek.map((day) => (
                <th
                  key={day}
                  className="capitalize p-3 border border-white first:rounded-tl-2xl last:rounded-tr-2xl"
                >
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {daysOfWeek.map((day) => (
                <td
                  key={day}
                  className="align-top p-4 bg-white border border-white min-w-[160px]"
                >
                  {weeklyData[day]?.length > 0 ? (
                    weeklyData[day].map((slot, idx) => (
                      <div
                        key={idx}
                        className="mb-3 p-3 rounded-lg border border-emerald-200 bg-[#f0fdf4] shadow-sm"
                      >
                        <p className="font-bold text-[#065F46] text-sm">
                          {slot.startTime} – {slot.endTime}
                        </p>
                        <p className="text-xs text-[#F59E0B] font-semibold mt-1">
                          📘 {slot.subjectId}
                        </p>
                        <p className="text-xs text-[#78350F] mt-1">
                          👨‍🏫 {slot.teacherId}
                        </p>
                      </div>
                    ))
                  ) : (
                    <span className="text-gray-400 text-xs">No slots</span>
                  )}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FormClassTimetable;
