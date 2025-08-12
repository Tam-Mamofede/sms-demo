import { useEffect, useState } from "react";
import { useStudent } from "../../src/context/StudentContext";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/NavBar";
import { Input } from "../../src/components/ui/input";
import { Button } from "../../src/components/ui/button";
import { Card, CardContent } from "../../src/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../src/components/ui/select";
import { useAuth } from "../../src/context/AuthContext";
import { deleteDoc, doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase.config";
import { useAlert } from "../../src/context/AlertContext";

export default function AllStudents() {
  const [showSearch, setShowSearch] = useState(false);
  const [selectedName, setSelectedName] = useState("");
  const [selectedClass, setSelectedClass] = useState("");

  const { user } = useAuth();
  const { showAlert } = useAlert();
  const navigate = useNavigate();
  const { students, fetchAllStudents, isLoading, addNewSt, setCurrentStudent } =
    useStudent();

  const deleteStudent = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this student?"))
      return;

    try {
      const studentDocRef = doc(db, "students", id);
      const studentSnap = await getDoc(studentDocRef);

      if (!studentSnap.exists()) {
        showAlert("Student record not found.", "warning");
        return;
      }

      const studentData = studentSnap.data();
      const classId = studentData.class;

      await deleteDoc(studentDocRef);

      if (classId) {
        await deleteDoc(doc(db, "classes", classId, "students", id));
      }

      showAlert("Student deleted successfully!", "success");
      fetchAllStudents();
    } catch (error) {
      console.error("Error deleting student:", error);
      showAlert("Failed to delete student.", "error");
    }
  };
  /////////////////////////////////////////
  const filteredStudents = students.filter((student) => {
    const matchesClass =
      selectedClass && selectedClass !== "all"
        ? student.class === selectedClass
        : true;
    const matchesName = selectedName
      ? student.firstName.toLowerCase().includes(selectedName.toLowerCase()) ||
        student.lastName.toLowerCase().includes(selectedName.toLowerCase())
      : true;
    return matchesClass && matchesName;
  });
  ////////////////////////////////////////
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 10;

  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);

  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * studentsPerPage,
    currentPage * studentsPerPage
  );

  /////////////////////////////
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

  useEffect(() => {
    if (addNewSt) fetchAllStudents(); // only run again when a new student is added
  }, [addNewSt]);
  ////////////////////////////////
  useEffect(() => {
    setCurrentPage(1); // reset to page 1 when filters change
  }, [selectedClass, selectedName]);

  useEffect(() => {
    fetchAllStudents();
  }, []);

  return (
    <div className="min-h-screen bg-[#FFF7ED] text-[#065F46]">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8  mt-20">
        <div className="flex justify-between items-center mb-6">
          <Button
            disabled={isLoading}
            onClick={fetchAllStudents}
            className={`bg-[#F59E0B] text-white ${
              isLoading ? "opacity-60" : "hover:bg-amber-500"
            }`}
          >
            {isLoading ? "Refreshing..." : "Refresh"}
          </Button>
        </div>

        <Card className="bg-[#FDE68A] border-none shadow-xl rounded-2xl mb-6">
          <CardContent className="py-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="w-full md:w-1/2">
                <h2 className="text-xl font-bold mb-2">
                  Select a class to view students
                </h2>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger className="w-full bg-white">
                    <SelectValue placeholder="All Classes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Classes</SelectItem>
                    {classOptions.map((className, index) => (
                      <SelectItem key={index} value={className}>
                        {className}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full md:w-1/2 text-right">
                <Button
                  variant="ghost"
                  className="text-[#78350F] underline hover:text-black"
                  onClick={() => setShowSearch(!showSearch)}
                >
                  {showSearch ? "Hide Search" : "Search by Name"}
                </Button>
              </div>
            </div>

            {showSearch && (
              <div className="flex flex-col md:flex-row gap-4">
                <Input
                  type="text"
                  value={selectedName}
                  onChange={(e) => setSelectedName(e.target.value)}
                  placeholder="Enter first or last name"
                  className="bg-white"
                />
                <Button
                  onClick={() => setSelectedName("")}
                  className="bg-red-500 text-white hover:bg-red-600"
                >
                  Clear
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {selectedClass || selectedName ? (
          <div className="overflow-x-auto rounded-lg shadow-lg border border-gray-200">
            <table className="min-w-full bg-white text-sm text-left text-gray-800">
              <thead className="bg-[#FDE68A] text-[#78350F] font-semibold">
                <tr>
                  <th className="px-4 py-3">First Name</th>
                  <th className="px-4 py-3">Last Name</th>
                  <th className="px-4 py-3">DOB</th>
                  <th className="px-4 py-3">Gender</th>
                  <th className="px-4 py-3">Nationality</th>
                  <th className="px-4 py-3">Guardian Email</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Address</th>
                  <th className="px-4 py-3">Class</th>
                  <th className="px-4 py-3">Guardian Name</th>
                  <th className="px-4 py-3">Guardian Phone</th>
                  {(user?.role === "Receptionist" ||
                    user?.role === "IT" ||
                    user?.role === "Proprietor") && (
                    <th className="px-4 py-3">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {paginatedStudents.length > 0 ? (
                  paginatedStudents.map((student, index) => (
                    <tr
                      key={index}
                      className="hover:bg-[#f0fdf4] cursor-pointer transition"
                      onClick={() => {
                        setCurrentStudent(student);
                        navigate("/student-details");
                      }}
                    >
                      <td className="px-4 py-2">{student.firstName}</td>
                      <td className="px-4 py-2">{student.lastName}</td>
                      <td className="px-4 py-2">{student.dateOfBirth}</td>
                      <td className="px-4 py-2">{student.gender}</td>
                      <td className="px-4 py-2">{student.nationality}</td>
                      <td className="px-4 py-2">{student.guardianEmail}</td>
                      <td className="px-4 py-2">{student.phoneNumber}</td>
                      <td className="px-4 py-2">{student.address}</td>
                      <td className="px-4 py-2">{student.class}</td>
                      <td className="px-4 py-2">{student.guardianName}</td>
                      <td className="px-4 py-2">{student.guardianPhone}</td>
                      {(user?.role === "Receptionist" ||
                        user?.role === "IT" ||
                        user?.role === "Proprietor") && (
                        <td className="px-4 py-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteStudent(student.id);
                            }}
                            className="bg-red-400 text-white px-3 py-1 rounded-2xl hover:bg-red-500"
                          >
                            Delete
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={11} className="text-center py-4 text-gray-500">
                      No students available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <h3 className="text-xl text-center mt-4 text-gray-700">
            Select a class to view students
          </h3>
        )}
      </div>
      {(selectedClass || selectedName) && (
        <div className="flex justify-center mt-10 space-x-2">
          <Button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="bg-[#10B981] text-white px-4 py-2 rounded hover:bg-emerald-700"
          >
            Prev
          </Button>
          {Array.from({ length: totalPages }, (_, i) => (
            <Button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-4 py-2 rounded ${
                currentPage === i + 1
                  ? "bg-[#F59E0B] text-white"
                  : "bg-white border text-[#78350F]"
              }`}
            >
              {i + 1}
            </Button>
          ))}
          <Button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="bg-[#10B981] text-white px-4 py-2 rounded hover:bg-emerald-700"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
