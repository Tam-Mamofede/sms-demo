import { useEffect, useState } from "react";
import { useAuth } from "../../src/context/AuthContext";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "../../firebase.config";
import NavBar from "../../components/NavBar";
import { useStudent } from "../../src/context/StudentContext";
import { useNavigate } from "react-router-dom";
import { StudentType } from "../../src/types/StudentType";
import SubmittedAssignmentsReview from "../../components/Classes/SubmittedAssignmentsReview";
import { Button } from "../../src/components/ui/button";
import { useAlert } from "../../src/context/AlertContext";
import Loader from "../../components/Loader";

type PartialStudent = Pick<
  StudentType,
  "id" | "firstName" | "lastName" | "class"
>;

export default function SubStudentList() {
  const { user } = useAuth();
  const [students, setStudents] = useState<PartialStudent[]>([]);
  const [filtered, setFiltered] = useState<PartialStudent[]>([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedClass, setSelectedClass] = useState("All");
  const [loading, setLoading] = useState(true);
  const [loadingStudentId, setLoadingStudentId] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 10;

  const { setCurrentStudent } = useStudent();
  const { showAlert } = useAlert();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudents = async () => {
      if (!user?.subjectAssignments) return;

      const allFetched: PartialStudent[] = [];

      for (const { class: className } of user.subjectAssignments) {
        const studentsRef = collection(db, "classes", className, "students");
        const snapshot = await getDocs(studentsRef);

        snapshot.forEach((doc) => {
          const data = doc.data();
          allFetched.push({
            id: doc.id,
            firstName: data.firstName,
            lastName: data.lastName,
            class: className,
          });
        });
      }

      setStudents(allFetched);
      setLoading(false);
    };

    fetchStudents();
  }, [user]);

  useEffect(() => {
    setCurrentPage(1); // reset pagination
    if (selectedClass === "All") {
      setFiltered(students);
    } else {
      setFiltered(students.filter((s) => s.class === selectedClass));
    }
  }, [students, selectedClass]);

  const handleStudentClick = async (student: PartialStudent) => {
    try {
      setLoadingStudentId(student.id);
      const studentRef = doc(
        db,
        "classes",
        student.class!,
        "students",
        student.id
      );
      const studentDoc = await getDoc(studentRef);

      if (!studentDoc.exists()) {
        showAlert("Student record not found.", "warning");
        return;
      }

      const fullStudent = {
        id: student.id,
        ...studentDoc.data(),
      } as StudentType;

      setCurrentStudent(fullStudent);
      navigate("/student-details");
    } catch (error) {
      console.error("Error loading student:", error);
      showAlert("Failed to load student. Please try again.", "error");
    } finally {
      setLoadingStudentId(null);
    }
  };

  const paginatedStudents = filtered.slice(
    (currentPage - 1) * studentsPerPage,
    currentPage * studentsPerPage
  );
  const totalPages = Math.ceil(filtered.length / studentsPerPage);

  const availableClasses = Array.from(
    new Set(students.map((s) => s.class))
  ).sort();

  return (
    <div className=" bg-[#FFF7ED] text-[#065F46]">
      <NavBar />
      <div className="max-w-5xl mx-auto p-6 mt-20">
        <h1 className="text-3xl font-bold mb-6">Students Taking My Subjects</h1>

        <div className="mb-6 flex flex-wrap gap-4">
          <div>
            <label className="font-medium mr-2">Filter by class:</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="border rounded p-2 bg-white"
            >
              <option value="All">All</option>
              {availableClasses.map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
          </div>

          {user?.subjectAssignments && (
            <div>
              <label className="font-medium mr-2">Filter by subject:</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="border rounded p-2 bg-white"
              >
                <option value="">-- Choose a subject --</option>
                {Array.from(
                  new Set(user.subjectAssignments.map((s) => s.subject))
                ).map((subj) => (
                  <option key={subj} value={subj}>
                    {subj}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-full w-full">
            <Loader />
          </div>
        ) : paginatedStudents.length === 0 ? (
          <p>No students found.</p>
        ) : (
          <>
            <ul className="space-y-3">
              {paginatedStudents.map((student) => (
                <li
                  key={student.id}
                  className="p-3 bg-white border rounded-md hover:bg-[#f0fdf4] cursor-pointer flex justify-between items-center transition"
                  onClick={() => handleStudentClick(student)}
                >
                  <span>
                    {student.firstName} {student.lastName} – {student.class}
                  </span>
                  {loadingStudentId === student.id && (
                    <span className="text-sm text-gray-500 animate-pulse">
                      Loading...
                    </span>
                  )}
                </li>
              ))}
            </ul>

            {/* Pagination Controls */}

            <div className="flex justify-center gap-2 mt-6">
              <Button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="bg-[#10B981] text-white"
              >
                Prev
              </Button>
              {Array.from({ length: totalPages }, (_, i) => (
                <Button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`${
                    i + 1 === currentPage
                      ? "bg-[#F59E0B] text-white"
                      : "bg-white text-[#78350F] border"
                  } px-4 py-2`}
                >
                  {i + 1}
                </Button>
              ))}
              <Button
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="bg-[#10B981] text-white"
              >
                Next
              </Button>
            </div>
          </>
        )}

        {selectedSubject && selectedClass !== "All" && (
          <div className="mt-10">
            <SubmittedAssignmentsReview
              classId={selectedClass}
              subjectName={selectedSubject}
            />
          </div>
        )}
      </div>
    </div>
  );
}
