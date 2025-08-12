import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../firebase.config";
import { useAuth } from "../../src/context/AuthContext";
import { useAlert } from "../../src/context/AlertContext";

type ScheduleType = {
  id: string;
  subject: string;
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
};

export default function FormTeacherExamScheduleView({
  classId,
}: {
  classId: string;
}) {
  const { user } = useAuth();
  const { showAlert } = useAlert();

  const [schedules, setSchedules] = useState<ScheduleType[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    if (!user || user.role !== "FormTeacher") return;

    const q = query(
      collection(db, "classes", classId, "examSchedules"),
      orderBy("date", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: ScheduleType[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<ScheduleType, "id">),
      }));
      setSchedules(data);
    });

    return () => unsubscribe();
  }, [user, classId]);

  const getExamsForDate = (date: Date) => {
    const d = date.toISOString().split("T")[0];
    return schedules.filter((s) => s.date === d);
  };

  const handleDelete = async (scheduleId: string) => {
    const confirm = window.confirm(
      "Are you sure you want to delete this exam?"
    );
    if (!confirm) return;

    try {
      await deleteDoc(doc(db, "classes", classId, "examSchedules", scheduleId));
    } catch (error) {
      console.error("Error deleting exam:", error);
      showAlert("Something went wrong. Try again.", "error");
    }
  };

  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === "month") {
      const exams = getExamsForDate(date);
      if (exams.length > 0) {
        return (
          <div className="mt-1 bg-amber-300 text-xs text-center rounded">
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
      <div className="mt-4 p-4 bg-[#FDE68A] rounded-xl shadow-md">
        <h3 className="text-lg font-bold text-[#78350F] mb-2">
          Exams on {selectedDate.toDateString()}
        </h3>
        <ul className="space-y-2">
          {exams.map((exam) => (
            <li
              key={exam.id}
              className="text-sm bg-white rounded-lg p-2 flex justify-between items-center border border-amber-300"
            >
              <div>
                <p className="font-semibold text-[#065F46]">{exam.subject}</p>
                <p className="text-xs">
                  {exam.startTime} - {exam.endTime} @ {exam.venue}
                </p>
              </div>
              <button
                onClick={() => handleDelete(exam.id)}
                className="text-red-600 hover:text-red-800 font-bold text-xs"
              >
                ✖
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  if (!user || user.role !== "FormTeacher") {
    return <p className="text-red-600 font-bold">Access Denied 🚫</p>;
  }

  return (
    <div className="p-6 bg-[#FFF7ED] rounded-2xl shadow-lg w-full max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold text-[#065F46] mb-4 text-center">
        📅 Exam Calendar
      </h2>
      <p className="text-sm text-center text-[#78350F] mb-4">
        {" "}
        Click on a date to view exams.
      </p>
      <div className="grid  md:grid-cols-2 gap-4">
        <Calendar
          onClickDay={setSelectedDate}
          tileContent={tileContent}
          className="rounded-xl border-2 border-emerald-300 p-4"
        />
        {renderExamDetails()}
      </div>
    </div>
  );
}
