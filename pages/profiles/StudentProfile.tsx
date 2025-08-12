import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase.config";
import { doc, updateDoc } from "firebase/firestore";

import { useStudent } from "../../src/context/StudentContext";
import { useAuth } from "../../src/context/AuthContext";

import StudentIDCard from "../../components/StudentIDCard";
import IncidentReport from "../../components/Students/incidentReport";
import IncidentForm from "../../components/Students/IncidentForm";
import MyAssignments from "../../components/Students/MyAssignments";
import StudentAttendance from "../../components/Students/StudentAttendance";
import Navbar from "../../components/NavBar";
import GuardianNavbar from "../../components/GuardianNavbar";
import SendGuardianNotice from "../../components/Notices/SendGuardianNotice";
import StudentBorrowedBooks from "../../components/Library/StudentBorrowedBooks";
import StudentGrades from "../../components/Grading/StudentGrades";
import ReportCardGenerator from "../../components/Students/ReportCardGenerator";
import StudentInvoices from "../../components/Students/StudentInvoices";
const StudentProfile = () => {
  const { currentStudent } = useStudent();
  const { user, guardianUser } = useAuth();

  const navigate = useNavigate();
  const [selectedTerm, setSelectedTerm] = useState("");
  const [teacherComment, setTeacherComment] = useState("");
  const [showGrade, setShowGrade] = useState(false);

  const [showId, setShowId] = useState(false);
  const [showSetNotice, setShowSetNotice] = useState(false);
  const [studentStatus, setStudentStatus] = useState<
    "Active" | "Expelled" | "Transferred" | "Withdrawn"
  >(currentStudent?.status || "Active");
  const [isEditingStatus, setIsEditingStatus] = useState(false);

  const termOptions = ["Term 1", "Term 2", "Term 3"];
  const currentYear = new Date().getFullYear();

  const canEditStatus =
    user?.role === "FormTeacher" &&
    user?.formTeacherClass === currentStudent?.class;

  const handleSaveStatus = async () => {
    setIsEditingStatus(false);

    if (!currentStudent?.id || !currentStudent?.class) {
      console.error("Missing current student id or class");
      return;
    }

    try {
      const studentDocRef = doc(
        db,
        "classes",
        currentStudent.class,
        "students",
        currentStudent.id
      );
      await updateDoc(studentDocRef, { status: studentStatus });
      console.log("Updated student status:", studentStatus);
    } catch (error) {
      console.error("Error updating student status:", error);
    }
  };

  ///////////////////////////////////////////////////

  //////////////////////////
  if (!currentStudent) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <h1 className="text-2xl font-bold text-gray-700">
          No Student Selected
        </h1>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          ← Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF7ED] text-[#065F46]">
      {guardianUser ? (
        <div className="mb-20 bg-[#FFF7ED]">
          <GuardianNavbar />
        </div>
      ) : (
        <div className="mb-20 bg-[#FFF7ED]">
          <Navbar />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 max-w-7xl mx-auto px-4 py-10">
        {/* LEFT SIDEBAR – Profile Summary */}
        <div className="lg:col-span-1 bg-[#FDE68A] border border-[#F59E0B] rounded-3xl shadow-xl p-6 flex flex-col items-center text-center justify-between">
          <div className="w-full flex flex-col items-center">
            <img
              src={
                currentStudent.pfp ||
                "https://www.svgrepo.com/show/475707/boy.svg"
              }
              alt="Profile"
              className="w-28 h-28 rounded-full border-4 border-[#10B981] mb-4 object-cover shadow"
            />
            <h1 className="text-2xl font-extrabold mb-1">
              {currentStudent.firstName} {currentStudent.lastName}
            </h1>
            <p className="text-[#78350F] text-lg mb-3">
              {currentStudent.class}
            </p>
            <div className="w-full mb-4">
              <h3 className="text-sm font-bold mb-1">Student Status:</h3>
              {isEditingStatus ? (
                <div className="space-y-2">
                  <select
                    value={studentStatus}
                    onChange={(e) =>
                      setStudentStatus(
                        e.target.value as
                          | "Active"
                          | "Expelled"
                          | "Transferred"
                          | "Withdrawn"
                      )
                    }
                    className="w-full px-4 py-2 rounded-lg bg-white border border-gray-300"
                  >
                    <option value="Active">Active</option>
                    <option value="Expelled">Expelled</option>
                    <option value="Transferred">Transferred</option>
                    <option value="Withdrawn">Withdrawn</option>
                  </select>
                  <button
                    onClick={handleSaveStatus}
                    className="w-full bg-[#10B981] text-white py-2 rounded-full"
                  >
                    💾 Save
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <span
                    className={`inline-block w-full py-2 rounded-full text-white font-bold ${
                      studentStatus === "Active"
                        ? "bg-[#10B981]"
                        : studentStatus === "Expelled"
                        ? "bg-red-500"
                        : "bg-yellow-500"
                    }`}
                  >
                    {studentStatus}
                  </span>
                  {canEditStatus && (
                    <button
                      onClick={() => setIsEditingStatus(true)}
                      className="w-2/5 bg-[#3B82F6] opacity-40 hover:bg-blue-700 text-white py-2 rounded-full"
                    >
                      ✏️ Edit
                    </button>
                  )}
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2 w-full">
              <button
                onClick={() => setShowId(!showId)}
                className="bg-[#F59E0B] hover:bg-[#D97706] text-white py-2 rounded-full"
              >
                {showId ? "Close ID Card" : "Show ID Card"}
              </button>
              <button
                onClick={() => navigate(-1)}
                className="bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-full"
              >
                ← Go Back
              </button>
            </div>
          </div>

          <div className="w-full">
            <button
              onClick={() => setShowGrade(!showGrade)}
              className="bg-[#065F46] hover:cursor-pointer text-white py-2 px-3 rounded-2xl"
            >
              {showGrade ? "Close" : "Show Grade Report"}
            </button>
          </div>
        </div>

        {/* MAIN AREA */}
        <div className="lg:col-span-3 space-y-10">
          {/* ID Card */}
          {showId && (
            <div className="bg-white rounded-xl shadow-md p-4">
              <StudentIDCard />
            </div>
          )}

          {/* Info Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            <Detail label="Date of Birth" value={currentStudent.dateOfBirth} />
            <Detail label="Gender" value={currentStudent.gender} />
            <Detail label="Nationality" value={currentStudent.nationality} />
            <Detail label="Phone" value={currentStudent.phoneNumber} />
            <Detail label="Address" value={currentStudent.address} />
            <Detail label="Guardian Name" value={currentStudent.guardianName} />
            <Detail
              label="Guardian Phone"
              value={currentStudent.guardianPhone}
            />
            <Detail
              label="Guardian Email"
              value={currentStudent.guardianEmail}
            />
          </div>

          {/* Attendance */}
          <div className="bg-white rounded-xl shadow-md p-4">
            <StudentAttendance
              classId={currentStudent.class}
              studentId={currentStudent.studentId}
              student={{
                firstName: currentStudent.firstName,
                lastName: currentStudent.lastName,
              }}
            />
          </div>

          {/* Invoices */}
          {(guardianUser ||
            user?.role === "FormTeacher" ||
            user?.role === "IT" ||
            user?.role === "Proprietor" ||
            user?.role === "Accountant") && (
            <div>
              <StudentInvoices />
            </div>
          )}

          {/* Assignments, Incidents, Library, Notice */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card title="📘 Assignments">
              <MyAssignments />
            </Card>
            <Card title="🚦 Behavior Incidents">
              <IncidentReport />
              {user?.role === "FormTeacher" &&
                user?.formTeacherClass === currentStudent.class && (
                  <IncidentForm />
                )}
            </Card>
            {(guardianUser ||
              user?.role === "IT" ||
              user?.role === "Proprietor" ||
              user?.role === "Librarian") && (
              <Card title="📚 Borrowed Books">
                <StudentBorrowedBooks studentId={currentStudent?.studentId} />
              </Card>
            )}
            {!guardianUser && (
              <Card title="📩 Send Notice to Parent">
                <button
                  className="text-[#10B981] font-semibold underline"
                  onClick={() => setShowSetNotice(!showSetNotice)}
                >
                  {showSetNotice ? "Close" : "Write a Notice"}
                </button>
                {showSetNotice && <SendGuardianNotice />}
              </Card>
            )}
          </div>

          {/* Grades & Report Card */}
          {showGrade && (
            <div className="space-y-6">
              <StudentGrades
                classId={currentStudent.class}
                studentId={currentStudent.id}
              />

              <div className="grid md:grid-cols-2 gap-4 items-start">
                <select
                  value={selectedTerm}
                  onChange={(e) => setSelectedTerm(e.target.value)}
                  className="border p-3 rounded-lg w-full bg-white shadow"
                >
                  <option>Select a term</option>
                  {termOptions.map((term) => (
                    <option key={term} value={term}>
                      {term} {currentYear}
                    </option>
                  ))}
                </select>
                <div>
                  <label className="block mb-1 font-semibold text-[#78350F]">
                    📝 Teacher's Comment
                  </label>
                  <textarea
                    value={teacherComment}
                    onChange={(e) => setTeacherComment(e.target.value)}
                    rows={3}
                    className="w-full border border-gray-300 p-3 rounded-lg shadow-sm"
                    placeholder="Leave something wholesome or hilarious..."
                  />
                </div>
              </div>

              {selectedTerm && (
                <ReportCardGenerator
                  studentId={currentStudent.id}
                  classId={currentStudent.class}
                  firstName={currentStudent.firstName}
                  lastName={currentStudent.lastName}
                  term={selectedTerm}
                  teacherName={`${user?.firstName} ${user?.lastName}`}
                  teacherComment={teacherComment}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Detail = ({ label, value }: { label: string; value?: string }) => (
  <div className="bg-[#FFF7ED] border border-[#FDE68A] p-4 rounded-xl shadow-sm">
    <p className="text-sm text-[#78350F]">{label}</p>
    <p className="font-semibold text-[#065F46]">{value || "—"}</p>
  </div>
);

const Card: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <div className="bg-white rounded-2xl shadow-md p-6">
    <h2 className="text-xl font-bold mb-4 text-[#065F46]">{title}</h2>
    {children}
  </div>
);

export default StudentProfile;
