import { useEffect, useState } from "react";
import { db } from "../../firebase.config";
import { collection, doc, getDocs, getDoc } from "firebase/firestore";
import Loader from "../Loader";

type ScoreType = {
  type: string;
  score: number;
  maxScore: number;
};

type GradeEntry = {
  scores: ScoreType[];
  totalScore: number;
  maxTotal: number;
  percentage: number;
  grade: string;
  term: string;
};

type StudentType = {
  id: string;
  firstName: string;
  lastName: string;
};

type Props = {
  classId: string;
  subjectName: string;
};

export default function ClassSubjectGradeReport({
  classId,
  subjectName,
}: Props) {
  const [students, setStudents] = useState<StudentType[]>([]);
  const [grades, setGrades] = useState<{ [studentId: string]: GradeEntry }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        setLoading(true);

        const studentSnap = await getDocs(
          collection(db, "classes", classId, "students")
        );

        const studentList: StudentType[] = studentSnap.docs.map((doc) => ({
          ...(doc.data() as StudentType),
          id: doc.id,
        }));

        setStudents(studentList);

        const gradeData: { [studentId: string]: GradeEntry } = {};

        for (const student of studentList) {
          const gradeRef = doc(
            db,
            "classes",
            classId,
            "students",
            student.id,
            "grades",
            subjectName
          );

          const gradeSnap = await getDoc(gradeRef);
          if (gradeSnap.exists()) {
            gradeData[student.id] = gradeSnap.data() as GradeEntry;
          }
        }

        setGrades(gradeData);
      } catch (error) {
        console.error("Error fetching grades:", error);
      } finally {
        setLoading(false);
      }
    };

    if (classId && subjectName) {
      fetchGrades();
    }
  }, [classId, subjectName]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full w-full">
        <Loader />
      </div>
    );
  }

  return (
    <div className="bg-[#FFF7ED] p-6 rounded-xl shadow-inner border border-[#FDE68A] mt-6">
      <h2 className="text-2xl font-bold text-[#065F46] mb-4 text-center">
        📘 {subjectName} Grades – {classId}
      </h2>

      <div className="overflow-x-auto rounded-lg">
        <table className="w-full border border-emerald-200 text-sm rounded-lg overflow-hidden">
          <thead className="bg-[#FDE68A] text-[#78350F]">
            <tr>
              <th className="p-3 text-left">Student</th>
              <th className="p-3 text-center">Assignment</th>
              <th className="p-3 text-center">Test</th>
              <th className="p-3 text-center">Exam</th>
              <th className="p-3 text-center">Total</th>
              <th className="p-3 text-center">%</th>
              <th className="p-3 text-center">Grade</th>
              <th className="p-3 text-center">Term</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => {
              const grade = grades[student.id];
              const getScore = (type: string) =>
                grade?.scores.find((s) => s.type === type) || {
                  score: 0,
                  maxScore: 0,
                };

              const assignment = getScore("Assignment");
              const test = getScore("Test");
              const exam = getScore("Exam");

              return (
                <tr key={student.id} className="hover:bg-[#f0fdf4] transition">
                  <td className="p-3 font-semibold text-[#065F46]">
                    {student.firstName} {student.lastName}
                  </td>
                  <td className="p-3 text-center">
                    {assignment.score} / {assignment.maxScore}
                  </td>
                  <td className="p-3 text-center">
                    {test.score} / {test.maxScore}
                  </td>
                  <td className="p-3 text-center">
                    {exam.score} / {exam.maxScore}
                  </td>
                  <td className="p-3 text-center">{grade?.totalScore || 0}</td>
                  <td className="p-3 text-center font-medium text-[#10B981]">
                    {grade?.percentage?.toFixed(1) || "0"}%
                  </td>
                  <td className="p-3 text-center font-bold">
                    {grade?.grade || "-"}
                  </td>
                  <td className="p-3 text-center">{grade?.term || "-"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
