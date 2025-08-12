import { useEffect, useMemo, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../firebase.config";
import { useAuth } from "../../src/context/AuthContext";
import { useGrading } from "../../src/context/GradingContext";
import { useStudent } from "../../src/context/StudentContext";
import { useAlert } from "../../src/context/AlertContext";

type ScoreType = {
  type: string;
  score: number;
  maxScore: number;
};

export default function SubjectTeacherGradeEntry() {
  const { user } = useAuth();
  const { students } = useStudent();
  const { calculateGrade } = useGrading();
  const { showAlert } = useAlert();

  const [existingScores, setExistingScores] = useState<{
    [studentId: string]: ScoreType[];
  }>({});

  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [term] = useState("Term 2");

  const [grades, setGrades] = useState<{ [studentId: string]: ScoreType[] }>(
    {}
  );

  const assignedSubjects = user?.subjectAssignments || [];

  const uniqueStudents = useMemo(() => {
    return Array.from(new Map(students.map((s) => [s.id, s])).values());
  }, [students]);

  const filteredStudents = useMemo(() => {
    return uniqueStudents.filter((s) => s.class === selectedClass);
  }, [uniqueStudents, selectedClass]);

  const handleScoreChange = (
    studentId: string,
    index: number,
    key: keyof Pick<ScoreType, "score" | "maxScore">,
    value: number
  ) => {
    const current = grades[studentId] || [
      { type: "Assignment", score: 0, maxScore: 0 },
      { type: "Test", score: 0, maxScore: 0 },
      { type: "Exam", score: 0, maxScore: 0 },
    ];

    const updated = [...current];
    updated[index][key] = value;

    setGrades({ ...grades, [studentId]: updated });
  };
  ///////////////////////////////////////////////////////////

  const handleSubmit = async (studentId: string) => {
    const newScores = grades[studentId];
    if (!newScores) return showAlert("Enter scores first!", "warning");

    const existing = existingScores[studentId] || [];

    // Merge logic:
    const merged: ScoreType[] = ["Assignment", "Test", "Exam"].map((type) => {
      const existingItem = existing.find((s) => s.type === type);
      const newItem = newScores.find((s) => s.type === type);

      return newItem?.score && newItem?.maxScore
        ? newItem
        : existingItem || { type, score: 0, maxScore: 0 };
    });

    const { total, maxTotal, percentage, grade } = calculateGrade(merged);

    const gradeDocRef = doc(
      db,
      "classes",
      selectedClass,
      "students",
      studentId,
      "grades",
      selectedSubject
    );

    await setDoc(gradeDocRef, {
      subjectId: selectedSubject,
      subjectName: selectedSubject,
      term,
      scores: merged,
      totalScore: total,
      maxTotal,
      percentage,
      grade,
    });

    showAlert(`Grades submitted.`, "success");
  };
  ////////////////////////////////////////
  // useEffect(() => {
  //   const fetchExistingScores = async () => {
  //     if (!selectedClass || !selectedSubject) return;

  //     const results: { [studentId: string]: ScoreType[] } = {};

  //     for (const student of filteredStudents) {
  //       const gradeDocRef = doc(
  //         db,
  //         "classes",
  //         selectedClass,
  //         "students",
  //         student.id,
  //         "grades",
  //         selectedSubject
  //       );

  //       const docSnap = await getDoc(gradeDocRef);
  //       if (docSnap.exists()) {
  //         results[student.id] = docSnap.data()?.scores || [];
  //       }
  //     }

  //     setExistingScores(results);
  //   };

  //   fetchExistingScores();
  // }, [selectedClass, selectedSubject, filteredStudents]);

  //////////////////////////////////////////////

  useEffect(() => {
    const fetchExistingScores = async () => {
      if (!selectedClass || !selectedSubject) return;

      const results: { [studentId: string]: ScoreType[] } = {};

      for (const student of filteredStudents) {
        const gradeDocRef = doc(
          db,
          "classes",
          selectedClass,
          "students",
          student.id,
          "grades",
          selectedSubject
        );

        const docSnap = await getDoc(gradeDocRef);
        if (docSnap.exists()) {
          results[student.id] = docSnap.data()?.scores || [];
        }
      }

      setExistingScores(results);
    };

    fetchExistingScores();
  }, [selectedClass, selectedSubject, filteredStudents]);

  ///////////////////////////////////////////////////
  const handleSubmitAll = async () => {
    if (!selectedSubject || !selectedClass) {
      showAlert("Please select subject and class.", "warning");
      return;
    }

    for (const student of filteredStudents) {
      const newScores = grades[student.id];
      const existing = existingScores[student.id] || [];

      // Nothing new submitted for this student? Skip.
      if (!newScores) {
        console.warn(
          `No new scores for ${student.firstName} ${student.lastName}`
        );
        continue;
      }

      const merged: ScoreType[] = ["Assignment", "Test", "Exam"].map((type) => {
        const existingItem = existing.find((s) => s.type === type);
        const newItem = newScores.find((s) => s.type === type);

        return newItem?.score && newItem?.maxScore
          ? newItem
          : existingItem || { type, score: 0, maxScore: 0 };
      });

      const { total, maxTotal, percentage, grade } = calculateGrade(merged);

      const gradeDocRef = doc(
        db,
        "classes",
        selectedClass,
        "students",
        student.id,
        "grades",
        selectedSubject
      );

      await setDoc(gradeDocRef, {
        subjectId: selectedSubject,
        subjectName: selectedSubject,
        term,
        scores: merged,
        totalScore: total,
        maxTotal,
        percentage,
        grade,
      });
    }

    showAlert("Grades submitted for all students!", "success");
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Enter Grades</h2>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="border border-emerald-500 p-2 rounded-xl"
        >
          <option value="">Select Subject</option>
          {[...new Set(assignedSubjects.map((a) => a.subject))].map(
            (subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            )
          )}
        </select>

        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="border border-emerald-500 p-2 rounded-xl"
        >
          <option value="">Select Class</option>
          {[...new Set(assignedSubjects.map((a) => a.class))].map((cls) => (
            <option key={cls} value={cls}>
              {cls}
            </option>
          ))}
        </select>
      </div>
      {uniqueStudents.length > 0 && selectedSubject && selectedClass && (
        <div className="mb-6 text-right">
          <button
            onClick={handleSubmitAll}
            className="bg-green-600 text-white px-6 py-2 rounded-2xl"
          >
            Save All Grades
          </button>
        </div>
      )}

      {filteredStudents.length > 0 && selectedSubject && selectedClass ? (
        filteredStudents.map((student) => (
          <div
            key={student.id}
            className="border border-green-700  p-4 mb-4 rounded-xl"
          >
            <h3 className="font-semibold mb-2">
              {student.firstName} {student.lastName}
            </h3>

            {["Assignment", "Test", "Exam"].map((type, i) => {
              const studentScores = existingScores[student.id] || [];
              const existing = studentScores.find((s) => s.type === type);

              const alreadyFilled =
                existing && existing.score > 0 && existing.maxScore > 0;

              if (alreadyFilled) return null;

              return (
                <div className="flex gap-2 mb-2" key={type}>
                  <label className="w-36">{type}</label>
                  <input
                    type="number"
                    placeholder="Score"
                    className="border p-1 w-20"
                    onChange={(e) =>
                      handleScoreChange(
                        student.id,
                        i,
                        "score",
                        Number(e.target.value)
                      )
                    }
                  />
                  <input
                    type="number"
                    placeholder="Max Score"
                    className="border p-1 w-20"
                    onChange={(e) =>
                      handleScoreChange(
                        student.id,
                        i,
                        "maxScore",
                        Number(e.target.value)
                      )
                    }
                  />
                </div>
              );
            })}

            <button
              onClick={() => handleSubmit(student.id)}
              className="mt-2 bg-blue-600 text-white px-4 py-1 rounded-2xl"
            >
              Save Grade
            </button>
          </div>
        ))
      ) : (
        <p className="text-gray-600">Select class and subject to begin</p>
      )}
    </div>
  );
}
