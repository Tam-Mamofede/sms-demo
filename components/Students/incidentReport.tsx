import { useCallback, useEffect, useState } from "react";
import { collection, query, orderBy, getDocs, doc } from "firebase/firestore";
import { db } from "../../firebase.config"; // Adjust the path as needed
import { IncidentType } from "../../src/types/IncidentType"; // Adjust the path as needed
import { useStudent } from "../../src/context/StudentContext";
import Loader from "../Loader";

// Define the props type for optional date filtering
interface IncidentReportProps {
  startDate?: string; // Expected in a comparable format (e.g., ISO string)
  endDate?: string; // Expected in a comparable format (e.g., ISO string)
}

const IncidentReport: React.FC<IncidentReportProps> = ({
  startDate,
  endDate,
}) => {
  const [incidents, setIncidents] = useState<IncidentType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { currentStudent } = useStudent();

  // Memoized fetch function to avoid unnecessary re-renders
  const fetchIncidents = useCallback(async () => {
    if (!currentStudent || !currentStudent.class || !currentStudent.id) {
      console.error("Current student is not fully defined");
      return;
    }
    setIsLoading(true);
    try {
      // Create a reference to the student's document
      const studentDocRef = doc(
        db,
        "classes",
        currentStudent.class,
        "students",
        currentStudent.id
      );
      const incidentsRef = collection(studentDocRef, "incidents");

      const q = query(incidentsRef, orderBy("incidentDate", "desc"));

      const querySnapshot = await getDocs(q);
      let fetchedIncidents: IncidentType[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data() as Omit<IncidentType, "id">;
        fetchedIncidents.push({ id: docSnap.id, ...data });
      });

      if (startDate) {
        fetchedIncidents = fetchedIncidents.filter(
          (incident) => incident.incidentDate >= startDate
        );
      }
      if (endDate) {
        fetchedIncidents = fetchedIncidents.filter(
          (incident) => incident.incidentDate <= endDate
        );
      }
      if (currentStudent.studentId) {
        fetchedIncidents = fetchedIncidents.filter(
          (incident) => incident.studentId === currentStudent.studentId
        );
      }
      setIncidents(fetchedIncidents);
    } catch (error) {
      console.error("Error fetching incidents:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentStudent, startDate, endDate]);

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-full w-full">
        <Loader />
      </div>
    );

  return (
    <div className="bg-[#FFF7ED] p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#065F46]">
          📋 Incident Report
        </h2>
        <button
          onClick={fetchIncidents}
          disabled={isLoading}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            isLoading
              ? "bg-gray-400 cursor-not-allowed text-white"
              : "bg-[#F59E0B] text-white hover:bg-amber-500"
          }`}
        >
          {isLoading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {incidents.length === 0 ? (
        <p className="text-gray-600 italic">
          No incidents found for the given criteria.
        </p>
      ) : (
        <ul className="space-y-4">
          {incidents.map((incident) => (
            <li
              key={incident.id}
              className="bg-[#FDE68A] p-4 rounded-xl shadow border border-yellow-300"
            >
              <p className="text-[#78350F] font-semibold">
                Date:{" "}
                <span className="font-normal text-gray-800">
                  {incident.incidentDate}
                </span>
              </p>
              <p className="text-[#78350F] font-semibold">
                Type:{" "}
                <span className="font-normal text-gray-800">
                  {incident.incidentType}
                </span>
              </p>
              <p className="text-[#78350F] font-semibold">
                Description:
                <span className="block font-normal text-gray-800 mt-1 ml-2">
                  {incident.description}
                </span>
              </p>
              <p className="text-[#78350F] font-semibold">
                Action Taken:
                <span className="block font-normal text-gray-800 mt-1 ml-2">
                  {incident.actionTaken}
                </span>
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default IncidentReport;
