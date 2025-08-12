import { useEffect, useState } from "react";
import { db } from "../../firebase.config";
import { doc, onSnapshot } from "firebase/firestore";

const daysOfWeek = ["monday", "tuesday", "wednesday", "thursday", "friday"];

interface Slot {
  startTime: string;
  endTime: string;
  subjectId: string;
  teacherId: string;
}

interface Props {
  classId: string;
  subjectId: string;
}

const WeeklySubjectView = ({ classId, subjectId }: Props) => {
  const [weeklyData, setWeeklyData] = useState<Record<string, Slot[]>>({});

  useEffect(() => {
    const unsubscribes: (() => void)[] = [];

    for (const day of daysOfWeek) {
      const ref = doc(db, "classes", classId, "timetable", day);
      const unsub = onSnapshot(ref, (snapshot) => {
        setWeeklyData((prev) => {
          const updated = { ...prev };
          if (snapshot.exists()) {
            const slots = snapshot.data().slots || [];
            updated[day] = slots.filter(
              (slot: Slot) => slot.subjectId === subjectId
            );
          } else {
            updated[day] = [];
          }
          return updated;
        });
      });

      unsubscribes.push(unsub);
    }

    return () => {
      unsubscribes.forEach((unsub) => unsub());
    };
  }, [classId, subjectId]);

  return (
    <div className="mt-10 bg-[#FFF7ED] p-4 rounded-2xl shadow-inner border border-[#FDE68A]">
      <h2 className="text-2xl font-bold text-[#065F46] text-center mb-6">
        📅 Weekly Schedule for{" "}
        <span className="text-[#F59E0B]">{subjectId}</span>
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
                  className="align-top p-4 border border-white bg-white min-w-[150px]"
                >
                  {weeklyData[day]?.length > 0 ? (
                    weeklyData[day].map((slot, idx) => (
                      <div
                        key={idx}
                        className="mb-3 p-3 bg-[#E0F2FE] text-[#065F46] rounded-lg shadow-sm border border-emerald-200"
                      >
                        <p className="font-semibold text-sm">
                          {slot.startTime} - {slot.endTime}
                        </p>
                        <p className="text-xs mt-1 text-[#78350F]">
                          👩‍🏫 {slot.teacherId}
                        </p>
                      </div>
                    ))
                  ) : (
                    <span className="text-gray-400 text-xs">—</span>
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

export default WeeklySubjectView;
