import { useEffect, useState } from "react";
import { db } from "../../firebase.config";
import { collection, deleteDoc, doc, getDocs } from "firebase/firestore";
import Navbar from "../../components/NavBar";
import { useAuth } from "../../src/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { GuardianType } from "../../src/types/GuardianType";
import { useAlert } from "../../src/context/AlertContext";
import Loader from "../../components/Loader";

export default function AllGuardians() {
  const [guardians, setGuardians] = useState<GuardianType[]>([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const { user, setCurGuardian } = useAuth();
  const { showAlert } = useAlert();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentGuardians = guardians.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(guardians.length / itemsPerPage);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const deleteGuardian = async (guardianId: string) => {
    if (!window.confirm("Are you sure you want to delete this guardian?"))
      return;

    try {
      await deleteDoc(doc(db, "guardians", guardianId));
      setGuardians((prev) => prev.filter((g) => g.id !== guardianId));
      showAlert("Guardian deleted successfully!", "success");
    } catch (error) {
      console.error("Error deleting guardian:", error);
      showAlert("Failed to delete guardian.", "error");
    }
  };

  useEffect(() => {
    const fetchGuardians = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "guardians"));
        const data: GuardianType[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as GuardianType[];
        setGuardians(data);
      } catch (error) {
        console.error("Error fetching guardians:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGuardians();
  }, []);

  return (
    <div className="min-h-screen bg-[#FFF7ED] text-[#065F46]">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-10 mt-20">
        <h1 className="text-3xl font-bold mb-6 text-center text-[#78350F]">
          All Guardians
        </h1>

        {loading ? (
          <div className="flex justify-center items-center h-screen w-full">
            <Loader />
          </div>
        ) : currentGuardians.length === 0 ? (
          <p className="text-center text-gray-500">No guardians found.</p>
        ) : (
          <div className="overflow-x-auto shadow-lg rounded-2xl border border-gray-200 bg-white">
            <table className="min-w-full text-sm text-left text-gray-800">
              <thead className="bg-[#FDE68A] text-[#78350F] font-semibold">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Address</th>
                  <th className="px-4 py-3">Work Address</th>
                  {(user?.role === "Receptionist" ||
                    user?.role === "IT" ||
                    user?.role === "Proprietor") && (
                    <th className="px-4 py-3">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {currentGuardians.map((guardian) => (
                  <tr
                    key={guardian.id}
                    className="hover:bg-[#f0fdf4] transition border-b"
                    onClick={() => {
                      setCurGuardian(guardian);
                      navigate(`/guardian/${guardian.id}`);
                    }}
                  >
                    <td className="px-4 py-3">{guardian.guardianName}</td>
                    <td className="px-4 py-3">{guardian.guardianEmail}</td>
                    <td className="px-4 py-3">{guardian.guardianPhone}</td>
                    <td className="px-4 py-3">
                      {guardian.guardianAddress || "-"}
                    </td>
                    <td className="px-4 py-3">
                      {guardian.guardianWorkAddress || "-"}
                    </td>
                    {(user?.role === "Receptionist" ||
                      user?.role === "IT" ||
                      user?.role === "Proprietor") && (
                      <td className="px-4 py-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteGuardian(guardian.id);
                          }}
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex justify-center mt-4 space-x-2">
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 rounded-xl bg-[#10B981] text-white disabled:opacity-50"
        >
          Prev
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => goToPage(page)}
            className={`px-3 py-1 rounded-xl ${
              page === currentPage
                ? "bg-[#F59E0B] text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            {page}
          </button>
        ))}
        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-4 py-2 rounded-xl bg-[#10B981] text-white disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
