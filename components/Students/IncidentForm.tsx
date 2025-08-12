import { addDoc, collection, doc, serverTimestamp } from "firebase/firestore";
import { useState } from "react";
import { db } from "../../firebase.config";
import { useStudent } from "../../src/context/StudentContext";
import { useAlert } from "../../src/context/AlertContext";

const IncidentForm = () => {
  // Form state for each field
  const [incidentDate, setIncidentDate] = useState("");
  const [description, setDescription] = useState("");
  const [incidentType, setIncidentType] = useState("minor"); // Default value
  const [actionTaken, setActionTaken] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { currentStudent } = useStudent();
  const { showAlert } = useAlert();

  interface IncidentData {
    incidentDate: string;
    description: string;
    incidentType: string;
    actionTaken: string;
  }

  const logIncident = async (incidentData: IncidentData) => {
    try {
      if (!currentStudent || !currentStudent.class || !currentStudent.id) {
        console.error("Current student is not fully defined");
        return;
      }

      const studentDocRef = doc(
        db,
        "classes",
        currentStudent?.class,
        "students",
        currentStudent?.id
      );
      await addDoc(collection(studentDocRef, "incidents"), {
        ...incidentData,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error logging incident:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const incidentData = {
      incidentDate,
      description,
      incidentType,
      actionTaken,
    };

    try {
      await logIncident(incidentData);

      setIncidentDate("");
      setDescription("");
      setIncidentType("minor");
      setActionTaken("");
      showAlert("Incident logged successfully!", "success");
    } catch (error) {
      console.error("Error logging incident:", error);
      showAlert("There was an error logging the incident.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[#FFF7ED] p-6 rounded-2xl shadow-md border border-yellow-200 space-y-6"
    >
      <h2 className="text-2xl font-bold text-[#065F46] mb-2">
        🚨 Log New Incident
      </h2>

      <div>
        <label className="block text-sm font-semibold text-[#78350F] mb-1">
          Incident Date
        </label>
        <input
          type="date"
          value={incidentDate}
          onChange={(e) => setIncidentDate(e.target.value)}
          className="w-full p-3 rounded-md border bg-white text-gray-800"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-[#78350F] mb-1">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-3 rounded-md border bg-white text-gray-800 min-h-[100px]"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-[#78350F] mb-1">
          Incident Type
        </label>
        <select
          value={incidentType}
          onChange={(e) => setIncidentType(e.target.value)}
          className="w-full p-3 rounded-md border bg-white text-gray-800"
        >
          <option value="minor">Minor</option>
          <option value="major">Major</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-[#78350F] mb-1">
          Action Taken
        </label>
        <input
          type="text"
          value={actionTaken}
          onChange={(e) => setActionTaken(e.target.value)}
          className="w-full p-3 rounded-md border bg-white text-gray-800"
          required
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full px-4 py-3 rounded-lg text-white font-medium transition ${
          isSubmitting
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-[#10B981] hover:bg-emerald-700"
        }`}
      >
        {isSubmitting ? "Logging..." : "Log Incident"}
      </button>
    </form>
  );
};

export default IncidentForm;
