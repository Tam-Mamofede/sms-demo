import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase.config";
import { useAuth } from "../src/context/AuthContext";
import { EvaluationType } from "../src/types/EvaluationType";
import Loader from "../components/Loader";

type StaffEvaluations = {
  staffId: string;
  firstName: string;
  lastName: string;
  evaluations: EvaluationType[];
};

const AllStaffEvaluation: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<StaffEvaluations[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllEvaluations = async () => {
      if (!user || user.role !== "Proprietor") return;

      const staffSnapshot = await getDocs(collection(db, "staff"));
      const result: StaffEvaluations[] = [];

      for (const docSnap of staffSnapshot.docs) {
        const staffId = docSnap.id;
        const { firstName, lastName } = docSnap.data();
        const evalsRef = collection(db, "staff", staffId, "evaluations");
        const evalsSnap = await getDocs(evalsRef);
        const evaluations: EvaluationType[] = evalsSnap.docs.map(
          (doc) => doc.data() as EvaluationType
        );

        result.push({ staffId, firstName, lastName, evaluations });
      }

      setData(result);
      setLoading(false);
    };

    fetchAllEvaluations();
  }, [user]);

  const filteredData = data.filter((staff) => {
    const fullName = `${staff.firstName} ${staff.lastName}`.toLowerCase();
    return searchTerm && fullName.includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full w-full">
        <Loader />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8 bg-[#FFF7ED] min-h-screen m-10 rounded-2xl">
      <h2 className="text-3xl font-bold text-[#065F46] text-center">
        Staff Evaluation Lookup
      </h2>

      {/* Search Input */}
      <div className="flex justify-center">
        <input
          type="text"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-1/2 px-5 py-3 border border-gray-300 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
      </div>

      {/* No Match Message */}
      {searchTerm && filteredData.length === 0 && (
        <p className="text-center text-gray-500 text-sm italic mt-4">
          No matching staff found.
        </p>
      )}

      {/* Staff Evaluation Cards */}
      {filteredData.map(({ staffId, firstName, lastName, evaluations }) => (
        <div
          key={staffId}
          className="bg-white border border-amber-200 rounded-2xl p-6 shadow space-y-4"
        >
          <h3 className="text-xl font-semibold text-[#78350F]">
            {firstName} {lastName}
          </h3>

          {evaluations.length === 0 ? (
            <p className="text-gray-500 text-sm italic">
              No evaluations found.
            </p>
          ) : (
            <ul className="space-y-4">
              {evaluations.map((evalItem, index) => (
                <li
                  key={index}
                  className="p-4 rounded-lg border border-gray-200 bg-[#FFFBF0] shadow-sm space-y-2"
                >
                  <div className="text-sm text-gray-700">
                    <strong>Date:</strong>{" "}
                    {new Date(evalItem.date).toLocaleDateString()}
                    <span className="mx-2">|</span>
                    <strong>Evaluator:</strong> {evalItem.evaluatorName}
                    <span className="mx-2">|</span>
                    <strong>Score:</strong> {evalItem.overallScore}/10
                  </div>

                  <div className="text-sm text-gray-800 space-y-1 pt-1">
                    <p>
                      <strong>Strengths:</strong> {evalItem.strengths}
                    </p>
                    <p>
                      <strong>Weaknesses:</strong> {evalItem.weaknesses}
                    </p>
                    <p>
                      <strong>Recommendations:</strong>{" "}
                      {evalItem.recommendations}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
};

export default AllStaffEvaluation;
