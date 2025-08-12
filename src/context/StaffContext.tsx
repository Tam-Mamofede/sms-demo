import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useAuth } from "./AuthContext";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "../../firebase.config";
import { StudentType } from "../types/StudentType";
import { StaffType } from "../types/StaffType";
import { StudentAttendanceType } from "../types/StudentAttendanceType";

const StaffContext = createContext<StaffContextType | undefined>(undefined);

interface StaffProviderProps {
  children: ReactNode;
}

interface StaffContextType {
  assignedStudents: StudentType[];
  allStaff: StaffType[];
  attendance: StudentAttendanceType;
  setAttendance: React.Dispatch<React.SetStateAction<StudentAttendanceType>>;
  subjectClassStudents: StudentType[];
  setSubjectClassStudents: React.Dispatch<React.SetStateAction<StudentType[]>>;
  fetchAllStaff: () => Promise<void>;
  fetchStudentInAssignedClass: () => Promise<void>;
  fetchMonthlyAttendanceForStudent: (
    classId: string,
    studentId: string,
    month: string // format: "YYYY-MM"
  ) => Promise<{ date: string; present: "yes" | "no" }[]>;
}

export const StaffProvider = ({ children }: StaffProviderProps) => {
  const [assignedStudents, setAssignedStudents] = useState<StudentType[]>([]);

  const [subjectClassStudents, setSubjectClassStudents] = useState<
    StudentType[]
  >([]);
  const [attendance, setAttendance] = useState<StudentAttendanceType>({});
  const [allStaff, setAllStaff] = useState<StaffType[]>([]);
  const { user, addNewStaff } = useAuth();

  const fetchMonthlyAttendanceForStudent = async (
    classId: string,
    studentId: string,
    month: string // format: "YYYY-MM"
  ) => {
    try {
      const attendanceCollectionRef = collection(
        doc(db, "classes", classId),
        `attendance-${month}`
      );

      const snapshot = await getDocs(attendanceCollectionRef);

      const records: { date: string; present: "yes" | "no" }[] = [];

      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const students = data?.students || {};
        const studentRecord = students[studentId];

        if (studentRecord) {
          records.push({
            date: docSnap.id, // doc ID is the date, eg: "2025-04-03"
            present: studentRecord.present,
          });
        }
      });

      return records;
    } catch (error) {
      console.error("Failed to fetch attendance for student:", error);
      return [];
    }
  };

  ///////////////////////////////////////////////

  useEffect(() => {
    const fetchStudentsForSubjectClasses = async () => {
      if (!user?.subjectAssignments) return;

      try {
        const allStudents: StudentType[] = [];

        const classSet = new Set(user.subjectAssignments.map((s) => s.class));
        for (const classId of classSet) {
          const studentsCollectionRef = collection(
            db,
            "classes",
            classId,
            "students"
          );
          const snapshot = await getDocs(studentsCollectionRef);

          const students = snapshot.docs.map((doc) => ({
            ...(doc.data() as StudentType),
            id: doc.id,
          }));
          allStudents.push(...students);
        }

        const uniqueStudents = Array.from(
          new Map(allStudents.map((s) => [s.id, s])).values()
        );

        setSubjectClassStudents(uniqueStudents);
      } catch (err) {
        console.error("Error fetching subject students:", err);
      }
    };

    fetchStudentsForSubjectClasses();
  }, [user?.subjectAssignments]);

  ////////////////////////////////////
  const fetchStudentInAssignedClass = async () => {
    if (!user?.formTeacherClass && user?.role !== "FormTeacher") return;

    const assignedClass = user?.formTeacherClass;

    try {
      const studentsCollectionRef = collection(
        db,
        "classes",
        assignedClass,
        "students"
      );
      const studentDocs = await getDocs(studentsCollectionRef);

      // Convert Firestore QuerySnapshot to an array of student objects
      const studentList: StudentType[] = studentDocs.docs.map((doc) => ({
        ...(doc.data() as StudentType),
        id: doc.id, // Add document ID for reference
      }));

      setAssignedStudents(studentList);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  useEffect(() => {
    if (user?.role === "FormTeacher") {
      fetchStudentInAssignedClass();
    } else {
      return;
    }
  }, [user?.formTeacherClass]);

  ////////////////////////////////////////////
  const fetchAllStaff = async () => {
    try {
      const staffColRef = collection(db, "staff");
      const staffDocs = await getDocs(staffColRef);

      // Convert Firestore QuerySnapshot to an array of student objects
      const staffList: StaffType[] = staffDocs.docs.map((doc) => ({
        ...(doc.data() as StaffType),
      }));

      setAllStaff(staffList);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  useEffect(() => {
    fetchAllStaff();
  }, [addNewStaff]);

  /////////////////////////////////////////////////////////////
  const fetchAttendance = async () => {
    const classId = user?.formTeacherClass || "JSS 1";
    const today = new Date();
    const formattedDate = today.toISOString().slice(0, 10);
    const month = today.toISOString().slice(0, 7); // "YYYY-MM"

    const formClassRef = doc(db, "classes", classId);
    const attendanceRef = doc(
      formClassRef,
      `attendance-${month}`,
      formattedDate
    );
    const docSnap = await getDoc(attendanceRef);

    if (docSnap.exists()) {
      setAttendance(docSnap.data()?.students || {});
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [setAttendance, user?.formTeacherClass]);

  return (
    <StaffContext.Provider
      value={{
        assignedStudents,
        attendance,
        setAttendance,
        allStaff,
        fetchMonthlyAttendanceForStudent,
        subjectClassStudents,
        setSubjectClassStudents,
        fetchAllStaff,
        fetchStudentInAssignedClass,
      }}
    >
      {children}
    </StaffContext.Provider>
  );
};

export const useStaff = (): StaffContextType => {
  const context = useContext(StaffContext);
  if (!context) {
    throw new Error("useStaff must be used within an StaffProvider");
  }
  return context;
};
