import {
  createContext,
  useContext,
  useState,
  ReactNode,
  SetStateAction,
  Dispatch,
  useEffect,
} from "react";

import { staffFormData, staffSchema } from "../schemas/staffSchema";
import { auth, db } from "../../firebase.config";
import { useForm, UseFormReturn } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  // User as FirebaseUser,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { StaffType } from "../types/StaffType";
import { StudentType } from "../types/StudentType";
import { useAlert } from "./AlertContext";

type GuardianBase = Pick<
  StudentType,
  | "guardianName"
  | "guardianPhone"
  | "guardianEmail"
  | "guardianAddress"
  | "guardianWorkAddress"
  | "role"
  | "guardianId"
>;

type GuardianType = GuardianBase & {
  studentIds: string[];
  id: string;
};

interface AuthContextType {
  user: StaffType | null;
  guardianUser: GuardianType | null;
  staffId: string;
  guardianUserId: string;
  login: () => void;
  syncStudents: () => void;
  loginAsGuardian: () => void;
  logInEmail: string;
  setLogInEmail: Dispatch<SetStateAction<string>>;
  logInPassword: string;
  setLogInPassword: Dispatch<SetStateAction<string>>;
  logout: () => void;
  createStaffAcct: (data: staffFormData) => Promise<void>;
  formMethods: UseFormReturn<staffFormData>;
  uploading: boolean;
  addNewStaff: boolean;
  userRole: string;
  staffRoles: string[];
  isAuthenticated: boolean;
  subjects: string[];
  classOptions: string[];
  generateStaffId: () => Promise<string>;
  curMonth: string;
  setCurMonth: Dispatch<SetStateAction<string>>;
  isLoading: boolean;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
  userRoles: {
    FormTeacher: string;
    SubjectTeacher: string;
    IT: string;
    Accountant: string;
    Receptionist: string;
    Proprietor: string;
    Guardian: string;
    HOD: string;
    Librarian: string;
  };
  curGuardian: GuardianType | null;
  setCurGuardian: React.Dispatch<React.SetStateAction<GuardianType | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [curMonth, setCurMonth] = useState<string>("");
  const [curGuardian, setCurGuardian] = useState<GuardianType | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [user, setUser] = useState<StaffType | null>(null);
  const [guardianUser, setGuardianUser] = useState<GuardianType | null>(null);
  const [staffId, setStaffId] = useState("");
  const [guardianUserId, setGuardianUserId] = useState("");
  const [uploading, setUploading] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [logInEmail, setLogInEmail] = useState("");
  const [logInPassword, setLogInPassword] = useState("");

  const [addNewStaff, setAddNewStaff] = useState<boolean>(false);

  const classOptions = [
    "Primary 1",
    "Primary 2",
    "Primary 3",
    "Primary 4",
    "Primary 5",
    "Primary 6",
    "JSS 1",
    "JSS 2",
    "JSS 3",
    "SS 1",
    "SS 2",
    "SS 3",
  ];

  const subjects = [
    "Mathematics",
    "English",
    "Science",
    "Social Studies",
    "Physics",
    "Chemistry",
    "Biology",
    "Economics",
    "Government",
    "Literature",
    "Computer Science",
    "History",
    "Agriculture",
  ];

  const formMethods = useForm<staffFormData>({
    resolver: yupResolver(staffSchema),
    defaultValues: {
      workExperiences: [],
      certifications: [],
      subjectAssignments: [{ subject: "", class: "" }],
    },
  });

  const { showAlert } = useAlert();
  const navigate = useNavigate();

  const staffRoles: string[] = [
    "FormTeacher",
    "SubjectTeacher",
    "IT",
    "Proprietor",
    "Accountant",
    "HOD",
    "Guardian",
    "Receptionist",
    "Librarian",
  ];

  const userRoles = {
    FormTeacher: "FormTeacher",
    SubjectTeacher: "SubjectTeacher",
    IT: "IT",
    Accountant: "Accountant",
    HOD: "HOD",
    Librarian: "Librarian",
    Receptionist: "Receptionist",
    Guardian: "Guardian",
    Proprietor: "Proprietor",
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDocRef = doc(db, "teachers", firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data() as StaffType;
          setUser(userData);
          setStaffId(firebaseUser.uid);
          setUserRole(userData.role || "");
          setIsAuthenticated(true);
        } else {
          console.error("Teacher document not found in Firestore.");
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setUserRole("");
      }
    });

    return () => unsubscribe();
  }, []);

  // const TARGET_UID = "mSsJ0yNSdsO4NKLYPbylm0UFY6q2";
  useEffect(() => {
    (async () => {
      try {
        const uid = "hxYe6IbAQVXo80HJy87DOGeho2D2";
        const ref = doc(db, "guardians", uid);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          console.log(`⚠️ Guardian doc already exists for ${uid}, skipping.`);
          return;
        }

        const payload = {
          uid,
          id: "q4EUPzVpTsebsIvLVL3Dkow28Or1",
          role: "Guardian",
          guardianName: "Joseph Dustin",
          guardianEmail: "jodustin@email.com",
          guardianPhone: "+234675675675",
          guardianAddress: "12 Unity Crescent, Garki, Abuja, Nigeria",
          guardianWorkAddress:
            "Evergreen Logistics, Plot 5 Industrial Layout, Lagos, Nigeria",
          studentIds: ["1FeC0axGeoWFxPFfgS4F", "mYqGH4p2srVuq881RCWf"],
          createdAt: Timestamp.fromDate(new Date("2025-04-08T18:36:52Z")),
        };

        await setDoc(ref, payload);
        console.log(`✅ Guardian doc created for ${uid}`);
      } catch (error) {
        console.error("🔥 Error creating guardian doc:", error);
      }
    })();
  }, []);
  //////////////////////////////////////////////////////////

  const generateStaffId = async (): Promise<string> => {
    const counterDocRef = doc(db, "counters", "staff");

    try {
      const counterSnap = await getDoc(counterDocRef);

      let newStaffId = 1;

      if (counterSnap.exists()) {
        const lastId = counterSnap.data().lastStaffId || 0;
        newStaffId = lastId + 1;
      }

      await setDoc(
        counterDocRef,
        { lastStudentId: newStaffId },
        { merge: true }
      );

      return `STAFF-${String(newStaffId).padStart(4, "0")}`;
    } catch (error) {
      showAlert("Could not generate staff ID", "error");
      console.error("Error generating staff ID:", error);
      throw new Error("Failed to generate staff ID");
    }
  };

  ///////////////////////////////////////

  const createStaffAcct = async (data: staffFormData) => {
    console.log("🚀 Register function triggered!", data);

    setUploading(true);
    try {
      const staffId = await generateStaffId();
      if (!data.role) {
        throw new Error("Role is required.");
      }
      console.log("📝 Role:", data.role);
      setUserRole(data.role);

      // const staffRole = data.role;

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      const { subjectAssignments, formTeacherClass, ...otherData } = data;

      const updatedData = {
        ...otherData,
        staffId,
        subjectAssignments: subjectAssignments || [], // Ensure it's always an array
        formTeacherClass: formTeacherClass || [], // Ensure it's always an array
        uid: userCredential.user.uid,
      };

      await setDoc(doc(db, "staff", userCredential.user.uid), updatedData);

      setAddNewStaff(true);

      showAlert("Teacher registered successfully!", "success");
      navigate(`/staff/${userCredential.user.uid}`);
    } catch (error) {
      console.error("🔥 Registration error:", error);
      showAlert(
        `${
          error instanceof Error ? error.message : "An unknown error occurred."
        }`,
        "error"
      );
    } finally {
      setUploading(false);
    }
  };

  /////////////////////////////////////////////////

  const login = async () => {
    try {
      setIsLoading(true);
      const userCredential = await signInWithEmailAndPassword(
        auth,
        logInEmail,
        logInPassword
      );
      const loggedInUser = userCredential.user;
      setStaffId(loggedInUser.uid);

      // Fetch full teacher data
      const userDocRef = doc(db, "staff", loggedInUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        throw new Error("No staff document found.");
      }

      const userData = userDoc.data() as StaffType;
      setUser(userData);

      setUserRole(userData.role || "");
      setIsAuthenticated(true);

      showAlert("Login successful!", "success");

      navigate("/staff-dashboard");
    } catch (error: unknown) {
      if (error instanceof Error) {
        showAlert(`${error.message}`, "error");
      } else {
        showAlert("An unknown error occurred.", "error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  ////////////////////////////////////////////////////////

  const loginAsGuardian = async () => {
    try {
      setIsLoading(true);
      const userCredential = await signInWithEmailAndPassword(
        auth,
        logInEmail,
        logInPassword
      );
      const loggedInUser = userCredential.user;

      // Fetch full teacher data
      const userDocRef = doc(db, "guardians", loggedInUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        throw new Error("No guardian document found.");
      }

      const userData = userDoc.data() as GuardianType;

      setGuardianUser({
        ...userData,
        guardianId: loggedInUser.uid,
      });

      setGuardianUserId(loggedInUser.uid);

      setIsAuthenticated(true);
      navigate("/guardian-dashboard");
      showAlert("Login successful!", "success");
    } catch (error: unknown) {
      if (error instanceof Error) {
        showAlert(`${error.message}`, "error");
      } else {
        showAlert("An unknown error occurred.", "error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  ////////////////////////////////////////////////////////////////

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setIsAuthenticated(false);
      setUserRole("");
      navigate("/log-in");
    } catch (error: unknown) {
      if (error instanceof Error) {
        showAlert(`${error.message}`, "error");
      } else {
        showAlert("An unknown error occurred.", "error");
      }
    }
  };
  /////////////////////////////////////////////////
  const syncStudents = async () => {
    try {
      const classSnap = await getDocs(collection(db, "classes"));

      for (const classDoc of classSnap.docs) {
        const classId = classDoc.id;
        const studentsRef = collection(db, "classes", classId, "students");
        const studentsSnap = await getDocs(studentsRef);

        for (const studentDoc of studentsSnap.docs) {
          const studentData = studentDoc.data();
          const studentId = studentDoc.id;

          const flatRef = doc(db, "students", studentId);
          await setDoc(
            flatRef,
            {
              ...studentData,
            },
            { merge: true }
          );
        }
      }

      console.log("✅ Synced students to /students");
    } catch (err) {
      console.error("🔥 Sync error:", err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        curGuardian,
        setCurGuardian,
        user,
        isLoading,
        setIsLoading,
        curMonth,
        setCurMonth,
        guardianUser,
        staffId,
        guardianUserId,
        logInEmail,
        setLogInEmail,
        logInPassword,
        setLogInPassword,
        login,
        loginAsGuardian,
        logout,
        createStaffAcct,
        formMethods,
        uploading,
        userRole,
        isAuthenticated,
        staffRoles,
        subjects,
        addNewStaff,
        generateStaffId,
        classOptions,
        syncStudents,
        userRoles,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
