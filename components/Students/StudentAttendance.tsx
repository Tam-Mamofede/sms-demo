import { useEffect, useState } from "react";
import { db } from "../../firebase.config";
import { doc, getDocs, collection } from "firebase/firestore";
import { StudentType } from "../../src/types/StudentType";
import Loader from "../Loader";

interface Props {
  classId: string;
  studentId: string;
  student: Pick<StudentType, "firstName" | "lastName">;
}
type SubjectStudentAttendance = Record<
  string,
  {
    firstName?: string;
    lastName?: string;
    present: "yes" | "no";
    timestamp?: number;
  }
>;

const StudentAttendance: React.FC<Props> = ({
  classId,
  studentId,
  student,
}) => {
  const [classRecords, setClassRecords] = useState<
    { date: string; present: "yes" | "no" }[]
  >([]);
  const [subjectRecords, setSubjectRecords] = useState<
    {
      date: string;
      subjects: { subject: string; present: "yes" | "no" }[];
    }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchMonthlyAttendance = async () => {
    setIsLoading(true);
    const month = new Date().toISOString().slice(0, 7);
    const attendanceCollectionRef = collection(
      doc(db, "classes", classId),
      `attendance-${month}`
    );

    try {
      const snapshot = await getDocs(attendanceCollectionRef);
      const classData: { date: string; present: "yes" | "no" }[] = [];
      const subjectData: {
        date: string;
        subjects: { subject: string; present: "yes" | "no" }[];
      }[] = [];

      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const date = docSnap.id;

        // Class attendance
        if (data.students?.[studentId]) {
          classData.push({
            date,
            present: data.students[studentId].present,
          });
        }

        // Subject-specific attendance
        const subjectAbsences = data.subjectAbsences || {};
        const subjectsMarked: { subject: string; present: "yes" | "no" }[] = [];

        for (const [subject, students] of Object.entries(subjectAbsences)) {
          const subjectStudents = students as SubjectStudentAttendance;

          if (subjectStudents[studentId]?.present === "no") {
            subjectsMarked.push({ subject, present: "no" });
          }
        }

        if (subjectsMarked.length > 0) {
          subjectData.push({ date, subjects: subjectsMarked });
        }
      });

      setClassRecords(classData);
      setSubjectRecords(subjectData);
    } catch (err) {
      console.error("Error fetching monthly attendance report:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (classId && studentId) fetchMonthlyAttendance();
  }, [classId, studentId]);

  return (
    <div className="mt-6 p-4 border rounded-md bg-white shadow-md">
      <h2 className="text-xl font-bold mb-2">
        Monthly Attendance Report for {student.firstName} {student.lastName}
      </h2>

      {isLoading ? (
        <div className="flex justify-center items-center h-full w-full">
          <Loader />
        </div>
      ) : (
        <>
          <h3 className="font-semibold mt-4 mb-2 text-blue-600">
            Class Attendance
          </h3>
          {classRecords.length > 0 ? (
            <ul className="mb-4">
              {classRecords.map((record, idx) => (
                <li key={idx} className="flex justify-between border-b py-1">
                  <span>{record.date}</span>
                  <span>
                    {record.present === "yes" ? "✅ Present" : "❌ Absent"}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">
              No class attendance records.
            </p>
          )}

          <h3 className="font-semibold mt-4 mb-2 text-purple-600">
            Subject Absences
          </h3>
          {subjectRecords.length > 0 ? (
            subjectRecords.map((day, idx) => (
              <div key={idx} className="mb-2">
                <strong>{day.date}</strong>
                <ul className="ml-4 list-disc">
                  {day.subjects.map((subj, i) => (
                    <li key={i} className="flex justify-between border-b py-1">
                      <span>{subj.subject}:</span> <span>❌ Absent</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">
              No subject absences recorded.
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default StudentAttendance;
