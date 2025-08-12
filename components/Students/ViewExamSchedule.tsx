import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase.config";
import { useStudent } from "../../src/context/StudentContext";

type Schedule = {
  subject: string;
  date: string;
  time: string;
  venue: string;
};

export default function ViewExamSchedule() {
  const { students } = useStudent();
  const [schedules, setSchedules] = useState<Schedule[]>([]);

  useEffect(() => {
    const fetchSchedules = async () => {
      if (students.length === 0) return;

      const classId = students[0].class; // Assumes first child's class for simplicity
      const snap = await getDocs(
        collection(db, "classes", classId, "examSchedules")
      );

      const data: Schedule[] = snap.docs.map((doc) => doc.data() as Schedule);
      setSchedules(data);
    };

    fetchSchedules();
  }, [students]);

  return (
    <div>
      <h2 className="font-bold text-xl mb-3">Exam Schedule 📚</h2>
      {schedules.map((sched, idx) => (
        <div key={idx} className="mb-2 border p-2 rounded">
          <p>Subject: {sched.subject}</p>
          <p>Date: {sched.date}</p>
          <p>Time: {sched.time}</p>
          <p>Venue: {sched.venue}</p>
        </div>
      ))}
    </div>
  );
}
