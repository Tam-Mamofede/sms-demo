import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { collection, doc, getDocs, setDoc } from "firebase/firestore";
import { db } from "../../firebase.config";

type ScoreType = {
  type: string;
  score: number;
  maxScore: number;
};

type GradeType = {
  subjectId: string;
  subjectName: string;
  term: string;
  scores: ScoreType[];
  totalScore: number;
  maxTotal: number;
  percentage: number;
  grade: string;
};

interface GradingContextType {
  grades: GradeType[];
  addGrade: (
    classId: string,
    studentId: string,
    subjectId: string,
    subjectName: string,
    term: string,
    scores: ScoreType[]
  ) => Promise<void>;
  getGradesForStudent: (classId: string, studentId: string) => Promise<void>;
  calculateGrade: (scores: { score: number; maxScore: number }[]) => {
    total: number;
    maxTotal: number;
    percentage: number;
    grade: string;
  };
}

const GradingContext = createContext<GradingContextType | null>(null);

export const GradingProvider = ({ children }: { children: ReactNode }) => {
  const [grades, setGrades] = useState<GradeType[]>([]);

  function calculateGrade(scores: { score: number; maxScore: number }[]) {
    const total = scores.reduce((sum, s) => sum + s.score, 0);
    const maxTotal = scores.reduce((sum, s) => sum + s.maxScore, 0);
    const percentage = (total / maxTotal) * 100;

    let grade = "F";
    if (percentage >= 90) grade = "A";
    else if (percentage >= 80) grade = "B+";
    else if (percentage >= 70) grade = "B";
    else if (percentage >= 60) grade = "C";
    else if (percentage >= 50) grade = "D";

    return { total, maxTotal, percentage, grade };
  }

  //////////////////////////////////////////////////////
  const addGrade = useCallback(
    async (
      classId: string,
      studentId: string,
      subjectId: string,
      subjectName: string,
      term: string,
      scores: ScoreType[]
    ) => {
      const { total, maxTotal, percentage, grade } = calculateGrade(scores);

      const gradeDocRef = doc(
        db,
        "classes",
        classId,
        "students",
        studentId,
        "grades",
        subjectId
      );

      const gradeData: GradeType = {
        subjectId,
        subjectName,
        term,
        scores,
        totalScore: total,
        maxTotal,
        percentage,
        grade,
      };

      await setDoc(gradeDocRef, gradeData);
    },
    []
  );

  ///////////////////////////////////////////////////
  const getGradesForStudent = useCallback(
    async (classId: string, studentId: string) => {
      const gradesRef = collection(
        db,
        "classes",
        classId,
        "students",
        studentId,
        "grades"
      );
      const snapshot = await getDocs(gradesRef);
      const data = snapshot.docs.map((doc) => doc.data() as GradeType);
      setGrades(data);
    },
    []
  );

  return (
    <GradingContext.Provider
      value={{ grades, addGrade, getGradesForStudent, calculateGrade }}
    >
      {children}
    </GradingContext.Provider>
  );
};

export const useGrading = () => {
  const context = useContext(GradingContext);
  if (!context)
    throw new Error("useGrading must be used within GradingProvider");
  return context;
};
