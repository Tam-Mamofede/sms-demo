import { useEffect, useState } from "react";
import { db } from "../../firebase.config";
import { collection, getDocs } from "firebase/firestore";

import { GradeType } from "../../src/types/GradeType";

interface StudentGradesProps {
  classId: string;
  studentId: string;
}

export default function StudentGrades({
  classId,
  studentId,
}: StudentGradesProps) {
  const [grades, setGrades] = useState<GradeType[]>([]);

  useEffect(() => {
    const fetchGrades = async () => {
      const gradeColRef = collection(
        db,
        "classes",
        classId,
        "students",
        studentId,
        "grades"
      );
      const snapshot = await getDocs(gradeColRef);
      const data = snapshot.docs.map((doc) => doc.data() as GradeType);

      setGrades(data);
    };

    fetchGrades();
  }, [classId, studentId]);

  return (
    <div className="p-4">
      <h2 className="font-bold mb-2">Grade Report</h2>
      <table className="w-full table-auto border">
        <thead>
          <tr className="bg-gray-100">
            <th>Subject</th>
            <th>Total</th>
            <th>Max</th>
            <th>%</th>
            <th>Grade</th>
          </tr>
        </thead>
        <tbody>
          {grades.map((g) => (
            <tr key={g.subjectId} className="text-center border-b-black">
              <td>{g.subjectName}</td>
              <td>{g.totalScore}</td>
              <td>{g.maxTotal}</td>
              <td>{g.percentage.toFixed(1)}%</td>
              <td>{g.grade}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
