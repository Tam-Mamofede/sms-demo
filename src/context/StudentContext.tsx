import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { collection, doc, getDoc, getDocs, setDoc } from "firebase/firestore";

import { db } from "../../firebase.config";
import { StudentType } from "../types/StudentType";
import { useAlert } from "./AlertContext";

const StudentContext = createContext<StudentContextType | undefined>(undefined);

interface StudentProviderProps {
  children: ReactNode;
}

interface StudentContextType {
  generateStudentId: () => Promise<string>;
  students: StudentType[];
  setStudents: React.Dispatch<React.SetStateAction<StudentType[]>>;
  addNewSt: boolean;
  setAddNewSt: React.Dispatch<React.SetStateAction<boolean>>;
  currentStudent: StudentType | null;
  setCurrentStudent: React.Dispatch<React.SetStateAction<StudentType | null>>;
  fetchAllStudents: () => Promise<void>;
  isLoading: boolean;
}

export const StudentProvider = ({ children }: StudentProviderProps) => {
  const [addNewSt, setAddNewSt] = useState<boolean>(false);
  const [currentStudent, setCurrentStudent] = useState<StudentType | null>(
    null
  );
  const [students, setStudents] = useState<StudentType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { showAlert } = useAlert();

  //////////////////////////////////////

  const generateStudentId = async (): Promise<string> => {
    const counterDocRef = doc(db, "counters", "students");

    try {
      const counterSnap = await getDoc(counterDocRef);

      let newStudentId = 1; // Default if no counter exists

      if (counterSnap.exists()) {
        const lastId = counterSnap.data().lastStudentId || 0;
        newStudentId = lastId + 1;
      }

      // Update Firestore with the new ID
      await setDoc(
        counterDocRef,
        { lastStudentId: newStudentId },
        { merge: true }
      );

      // Return formatted student ID (e.g., "STU-0001")
      return `STU-${String(newStudentId).padStart(4, "0")}`;
    } catch (error) {
      showAlert("Error generating student ID", "error");
      console.error("Error generating student ID:", error);
      throw new Error("Failed to generate student ID");
    }
  };

  ////////////////////////////////////////////////////////////

  const fetchAllStudents = useCallback(async () => {
    setIsLoading(true);
    try {
      const classesColRef = collection(db, "classes");
      const classDocs = await getDocs(classesColRef);

      let allStudents: StudentType[] = [];

      // Iterate through each class document to fetch students
      for (const classDoc of classDocs.docs) {
        const studentsColRef = collection(
          db,
          // "classes",
          // classDoc.id,
          "students"
        );
        const studentDocs = await getDocs(studentsColRef);

        const studentList = studentDocs.docs.map((doc) => ({
          ...(doc.data() as StudentType),
          id: doc.id, // Add ID for reference
          classId: classDoc.id, // Include class ID
        }));

        allStudents = [...allStudents, ...studentList];
      }

      const unique = Array.from(
        new Map(allStudents.map((s) => [s.id, s])).values()
      );
      setStudents(unique);
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setIsLoading(false);
    }
  }, [addNewSt]);

  useEffect(() => {
    fetchAllStudents();
  }, []);
  /////////////////////////////////////////////////////////////
  // useEffect(() => {
  //   const addStudentData = async () => {
  //     try {
  //       const addData = {
  //         firstName: "Sophia",
  //         lastName: "Lee",
  //         dateOfBirth: "2010-07-07",
  //         gender: "Female",
  //         nationality: "Korean",
  //         guardianEmail: "sophialee@gmail.com",
  //         phoneNumber: "+821012345678",
  //         address: "101 Gangnam St, Seoul, South Korea",
  //         class: "JSS 3",
  //         guardianName: "Min Lee",
  //         guardianPhone: "+821012345679",
  //       };

  //       // Add a new document to the "students" collection
  //       const docRef = await addDoc(collection(db, "students"), addData);

  //       console.log("Student added successfully with ID:", docRef.id);
  //     } catch (error) {
  //       console.error("Error adding student:", error);
  //     }
  //   };

  //   addStudentData();
  // }, []);

  /////////////////////////////////////////
  return (
    <StudentContext.Provider
      value={{
        generateStudentId,
        students,
        setStudents,
        addNewSt,
        setAddNewSt,
        currentStudent,
        setCurrentStudent,
        fetchAllStudents,
        isLoading,
      }}
    >
      {children}
    </StudentContext.Provider>
  );
};

export const useStudent = (): StudentContextType => {
  const context = useContext(StudentContext);
  if (!context) {
    throw new Error("useStudent must be used within an StudentProvider");
  }
  return context;
};
