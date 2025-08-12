import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebase.config";
import { useAuth } from "../src/context/AuthContext";
import Loader from "./Loader";

type ScheduleType = {
  id: string;
  subject: string;
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
};

export default function PublicExamSchedule() {
  const [classId, setClassId] = useState("");
  const [schedules, setSchedules] = useState<ScheduleType[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);

  const { classOptions } = useAuth();

  useEffect(() => {
    const fetchSchedules = async () => {
      if (!classId) return;

      setLoading(true);
      try {
        const q = query(
          collection(db, "classes", classId, "examSchedules"),
          orderBy("date", "asc")
        );
        const snapshot = await getDocs(q);
        const data: ScheduleType[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<ScheduleType, "id">),
        }));
        setSchedules(data);
      } catch (error) {
        console.error("Failed to fetch schedules:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, [classId]);

  const getExamsForDate = (date: Date) => {
    const d = date.toISOString().split("T")[0];
    return schedules.filter((s) => s.date === d);
  };

  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === "month") {
      const exams = getExamsForDate(date);
      if (exams.length > 0) {
        return (
          <div className="mt-1 bg-[#F59E0B] text-white text-xs font-bold text-center rounded-full px-2">
            📚 {exams.length}
          </div>
        );
      }
    }
    return null;
  };

  const renderExamDetails = () => {
    if (!selectedDate) return null;

    const exams = getExamsForDate(selectedDate);
    if (exams.length === 0) return null;

    return (
      <div className="mt-4 p-4 bg-white border border-amber-200 rounded-xl shadow-sm">
        <h3 className="text-lg font-bold text-[#78350F] mb-3">
          📅 Exams on {selectedDate.toDateString()}
        </h3>
        <ul className="space-y-3">
          {exams.map((exam) => (
            <li
              key={exam.id}
              className="bg-[#FDE68A] border border-amber-300 p-3 rounded-lg shadow-sm flex justify-between items-start"
            >
              <div>
                <p className="font-semibold text-[#065F46]">{exam.subject}</p>
                <p className="text-xs text-[#78350F]">
                  {exam.startTime} – {exam.endTime} @ {exam.venue}
                </p>
              </div>
              <span className="text-xs text-[#F59E0B] font-bold">📝</span>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="p-6 bg-[#FFF7ED] rounded-2xl shadow-lg w-full max-w-6xl mx-auto mt-10">
      <h2 className="text-3xl font-extrabold text-[#065F46] mb-8 text-center">
        Public Exam Schedule
      </h2>

      <div className="mb-6 max-w-sm mx-auto">
        <label className="block text-sm font-semibold text-[#78350F] mb-2">
          🎓 Select Class
        </label>
        <select
          value={classId}
          onChange={(e) => {
            setClassId(e.target.value);
            setSelectedDate(null);
          }}
          className="w-full border border-emerald-300 bg-white rounded-xl p-2 shadow-sm focus:ring-2 focus:ring-[#10B981]"
        >
          <option value="">-- Choose a class --</option>
          {classOptions.map((cls) => (
            <option key={cls} value={cls}>
              {cls}
            </option>
          ))}
        </select>
      </div>

      {classId && (
        <>
          {loading ? (
            <div className="flex justify-center items-center h-full w-full my-6">
              <Loader />
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6 items-start">
              <div className=" p-4 rounded-xl">
                <Calendar
                  onClickDay={setSelectedDate}
                  tileContent={tileContent}
                  className="rounded-xl w-full text-sm font-medium"
                />
              </div>
              {renderExamDetails()}
            </div>
          )}
        </>
      )}
    </div>
  );
}
