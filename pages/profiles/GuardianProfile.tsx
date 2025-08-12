import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase.config";
import Navbar from "../../components/NavBar";
import { GuardianType } from "../../src/types/GuardianType";
import { useAuth } from "../../src/context/AuthContext";
import { StudentType } from "../../src/types/StudentType";
import { useStudent } from "../../src/context/StudentContext";
import AddStudentToGuardianForm from "../../pages/registrations/AddStudentToGuardian";
import { useAlert } from "../../src/context/AlertContext";
import Loader from "../../components/Loader";

export default function GuardianProfile() {
  const { curGuardian } = useAuth();
  const { showAlert } = useAlert();
  const { setCurrentStudent } = useStudent();
  const navigate = useNavigate();

  const [guardian, setGuardian] = useState<GuardianType | null>(null);
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<StudentType[]>([]);
  const [showAddStudent, setShowAddStudent] = useState(false);

  const id = curGuardian?.id;

  useEffect(() => {
    const fetchGuardian = async () => {
      try {
        const docRef = doc(db, "guardians", id!);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const guardianData = docSnap.data() as GuardianType;
          setGuardian(guardianData);

          // Fetch linked students
          const fetchedStudents: StudentType[] = [];
          for (const studentId of guardianData.studentIds || []) {
            const studentDoc = await getDoc(doc(db, "students", studentId));
            if (studentDoc.exists()) {
              fetchedStudents.push({
                id: studentDoc.id,
                ...studentDoc.data(),
              } as StudentType);
            }
          }
          setStudents(fetchedStudents);
        } else {
          showAlert("Guardian not found.", "error");
          navigate("/all-guardians");
        }
      } catch (error) {
        console.error("Error fetching guardian profile:", error);
        showAlert("Something went wrong.", "error");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchGuardian();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen w-full">
        <Loader />
      </div>
    );
  }

  if (!curGuardian) return <p>You have not selected a guardian...</p>;

  return (
    <div className="min-h-screen bg-[#FFF7ED] text-[#065F46]">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-10 mt-24">
        <div className="bg-[#fde996] p-8 rounded-xl shadow-md">
          <h2 className="text-3xl font-bold text-center text-[#78350F] mb-6">
            Guardian Profile
          </h2>

          {guardian ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-lg bg-amber-100 p-6 rounded-xl shadow-md border">
                <div className="flex flex-col">
                  <span className="text-sm text-[#78350F] font-semibold uppercase">
                    Full Name
                  </span>
                  <span className="text-[#065F46] font-medium">
                    {guardian.guardianName}
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="text-sm text-[#78350F] font-semibold uppercase">
                    Email
                  </span>
                  <span className="text-[#065F46] font-medium">
                    {guardian.guardianEmail}
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="text-sm text-[#78350F] font-semibold uppercase">
                    Phone
                  </span>
                  <span className="text-[#065F46] font-medium">
                    {guardian.guardianPhone}
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="text-sm text-[#78350F] font-semibold uppercase">
                    Home Address
                  </span>
                  <span className="text-[#065F46] font-medium">
                    {guardian.guardianAddress || "N/A"}
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="text-sm text-[#78350F] font-semibold uppercase">
                    Work Address
                  </span>
                  <span className="text-[#065F46] font-medium">
                    {guardian.guardianWorkAddress || "N/A"}
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="text-sm text-[#78350F] font-semibold uppercase">
                    Linked Students
                  </span>
                  <span className="text-[#065F46] font-medium">
                    {guardian.studentIds?.length || 0}
                  </span>
                </div>
              </div>

              {students.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-xl font-semibold text-[#78350F] mb-2">
                    Linked Students
                  </h3>
                  <ul className="space-y-3">
                    {students.map((student) => (
                      <li
                        key={student.id}
                        className="bg-amber-100 px-4 py-3 rounded-xl shadow border hover:cursor-pointer space-y-1"
                        onClick={() => {
                          setCurrentStudent(student);
                          navigate("/student-details");
                        }}
                      >
                        <p className="text-md font-extrabold">
                          {student.firstName} {student.lastName}
                        </p>
                        <p className="text-sm text-gray-600 font-medium">
                          Class: {student.class} | DOB: {student.dateOfBirth}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <p className="text-center text-red-600">Guardian not found.</p>
          )}

          <div className="text-center mt-6 px-26 justify-between  flex">
            <button
              onClick={() => navigate(-1)}
              className="bg-[#10B981] text-white px-6 py-2 rounded-xl hover:bg-[#059669]"
            >
              ← Back
            </button>
            <button
              onClick={() => setShowAddStudent(!showAddStudent)}
              className="bg-[#065F46] text-white px-6 py-2 rounded-xl hover:bg-[#059669]"
            >
              {showAddStudent ? "Close" : "Add Student to Guardian"}
            </button>
          </div>
        </div>
      </div>
      <div className="w-screen flex justify-center items-center">
        {showAddStudent && (
          <div className="mt-10 w-3/5">
            <AddStudentToGuardianForm
              guardianId={curGuardian?.id}
              onSuccess={() => {
                // Re-fetch students after adding
                setLoading(true);
                navigate(0); // quick page reload to trigger useEffect again
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
