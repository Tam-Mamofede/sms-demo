import { useState } from "react";
import { useStaff } from "../../src/context/StaffContext";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/NavBar";
import { useAuth } from "../../src/context/AuthContext";
import { useAlert } from "../../src/context/AlertContext";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "../../firebase.config";

const ITEMS_PER_PAGE = 10;

export default function AllStaff() {
  const navigate = useNavigate();
  const { allStaff } = useStaff();
  const { user } = useAuth();
  const { showAlert } = useAlert();

  const [showSearch, setShowSearch] = useState(false);
  const [selectedName, setSelectedName] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredStaff = allStaff
    .filter((staff) => {
      const name = `${staff.firstName} ${staff.lastName}`.toLowerCase();
      return selectedName ? name.includes(selectedName.toLowerCase()) : true;
    })
    .sort((a, b) => a.firstName.localeCompare(b.firstName));

  const totalPages = Math.ceil(filteredStaff.length / ITEMS_PER_PAGE);
  const paginatedStaff = filteredStaff.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleDeleteStaff = async (staffId: string) => {
    try {
      const staffRef = doc(db, "staff", staffId);
      await deleteDoc(staffRef);
      showAlert("Staff member deleted successfully!", "success");
    } catch (error) {
      console.error("Error deleting staff:", error);
      showAlert("Failed to delete staff member.", "error");
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen px-6 py-10 bg-[#FFF7ED] pt-26">
        <div className="max-w-7xl mx-auto space-y-6 ">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <h2 className="text-4xl font-bold text-[#065F46] text-center sm:text-left">
              Staff Directory
            </h2>
          </div>

          {/* Search Toggle */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="text-sm text-[#78350F] border border-[#F59E0B] px-4 py-2 rounded-full bg-white hover:bg-[#FDE68A] transition shadow-sm"
            >
              {showSearch ? "Hide Search" : "Search by Name"}
            </button>

            {showSearch && (
              <div className="flex gap-4 w-full sm:w-auto items-center mt-2 sm:mt-0">
                <input
                  type="text"
                  value={selectedName}
                  onChange={(e) => {
                    setSelectedName(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Enter name..."
                  className="w-full sm:w-64 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white shadow-sm"
                />
                <button
                  onClick={() => {
                    setSelectedName("");
                    setCurrentPage(1);
                  }}
                  className="bg-red-400 hover:bg-red-500 text-white px-4 py-2 rounded-full text-sm transition"
                >
                  Clear
                </button>
              </div>
            )}
          </div>

          {/* Staff Table */}
          <div className="overflow-x-auto border border-gray-200 rounded-2xl shadow-lg bg-white">
            <table className="min-w-full text-sm">
              <thead className="bg-[#FDF6E3] text-[#78350F]">
                <tr>
                  {[
                    "First Name",
                    "Last Name",
                    "DOB",
                    "Gender",
                    "Nationality",
                    "Phone",
                    "Address",
                    "Assigned Class",
                    "Actions",
                  ].map((heading, idx) => (
                    <th key={idx} className="px-5 py-3 text-left font-semibold">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedStaff.length > 0 ? (
                  paginatedStaff.map((staff, index) => (
                    <tr key={index} className="border-t hover:bg-[#FFFDEB]">
                      <td className="px-5 py-3">{staff.firstName}</td>
                      <td className="px-5 py-3">{staff.lastName}</td>
                      <td className="px-5 py-3">{staff.dateOfBirth}</td>
                      <td className="px-5 py-3">{staff.gender}</td>
                      <td className="px-5 py-3">{staff.nationality}</td>
                      <td className="px-5 py-3">{staff.phoneNumber}</td>
                      <td className="px-5 py-3">{staff.address}</td>
                      <td className="px-5 py-3">
                        {staff.formTeacherClass?.length
                          ? staff.formTeacherClass
                          : "Not Assigned"}
                      </td>
                      <td className="px-5 py-3 space-x-2">
                        <button
                          onClick={() => navigate(`/staff/${staff.uid}`)}
                          className="bg-amber-400 hover:bg-amber-500 text-white px-4 py-1.5 rounded-full text-xs shadow transition"
                        >
                          View
                        </button>
                        {(user?.role === "Proprietor" ||
                          user?.role === "IT" ||
                          user?.role === "HOD") && (
                          <button
                            onClick={() => handleDeleteStaff(staff.uid)}
                            className="bg-red-400 hover:bg-red-500 text-white px-4 py-1.5 rounded-full text-xs shadow transition"
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={9}
                      className="text-center py-6 text-gray-500 italic"
                    >
                      No staff members found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}

          <div className="flex justify-center mt-8 gap-2 flex-wrap">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-full bg-gray-200 text-sm disabled:opacity-50 hover:bg-gray-300 transition"
            >
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => handlePageChange(i + 1)}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  currentPage === i + 1
                    ? "bg-emerald-500 text-white"
                    : "bg-gray-100 hover:bg-gray-200"
                } transition`}
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-full bg-gray-200 text-sm disabled:opacity-50 hover:bg-gray-300 transition"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
