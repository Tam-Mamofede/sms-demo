import { useState } from "react";
import { useStaff } from "../../src/context/StaffContext";
import { useAuth } from "../../src/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useStudent } from "../../src/context/StudentContext";
import Navbar from "../../components/NavBar";

export default function AssignedStudents() {
  const [showSearch, setShowSearch] = useState(false);
  const [selectedName, setSelectedName] = useState("");

  const { assignedStudents } = useStaff();
  const { user } = useAuth();
  const { setCurrentStudent } = useStudent();

  const navigate = useNavigate();

  const filteredStudents = assignedStudents.filter((student) => {
    const matchesName = selectedName
      ? student.firstName.toLowerCase().includes(selectedName.toLowerCase()) ||
        student.lastName.toLowerCase().includes(selectedName.toLowerCase())
      : true;
    return matchesName;
  });

  const studentsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);
  const startIndex = (currentPage - 1) * studentsPerPage;
  const paginatedStudents = filteredStudents.slice(
    startIndex,
    startIndex + studentsPerPage
  );

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <>
      <Navbar />{" "}
      <div className="w-full min-h-screen bg-[#FFF7ED] px-4 py-8 mt-20">
        <div className="max-w-7xl mx-auto">
          {/* Title */}
          <h1 className="text-3xl font-bold text-[#065F46] text-center mb-2">
            Students in{" "}
            <span className="text-[#78350F]">{user?.formTeacherClass}</span>
          </h1>

          {/* Search Toggle */}
          <div className="text-center my-4">
            <h3
              onClick={() => setShowSearch(!showSearch)}
              className="text-[#78350F] hover:text-black font-semibold cursor-pointer inline-block transition hover:scale-105 px-4 py-1 border border-amber-400 rounded-full bg-[#fde68a]"
            >
              {showSearch ? "Hide Search" : "Search by Name"}
            </h3>
          </div>

          {/* Search Box */}
          {showSearch && (
            <div className="flex flex-col sm:flex-row justify-center items-center gap-3 mb-6">
              <input
                type="text"
                value={selectedName}
                onChange={(e) => setSelectedName(e.target.value)}
                placeholder="Enter first or last name"
                className="border border-gray-300 p-2 rounded-md w-full sm:w-80 bg-white shadow-sm"
              />
              <button
                onClick={() => setSelectedName("")}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
              >
                Clear
              </button>
            </div>
          )}

          {/* Student Table */}
          <div className="overflow-x-auto shadow-lg rounded-lg border border-amber-200 bg-white">
            <table className="min-w-full text-sm text-left text-gray-800">
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
                </tr>
              </thead>
              <tbody>
                {paginatedStudents.length > 0 ? (
                  paginatedStudents.map((student, index) => (
                    <tr
                      key={index}
                      className="border-b hover:bg-[#f0fdf4] cursor-pointer"
                      onClick={() => {
                        setCurrentStudent(student);
                        navigate(`/student-details`);
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
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={11} className="text-center py-6 text-gray-500">
                      😕 No students available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex justify-center items-center mt-10 gap-4">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-md ${
                currentPage === 1
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-[#F59E0B] text-white hover:bg-amber-600"
              }`}
            >
              ← Previous
            </button>
            <span className="font-medium text-[#065F46]">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-xl bg-[#10B981] text-white disabled:opacity-50"
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
