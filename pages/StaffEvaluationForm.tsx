// components/StaffEvaluationForm.tsx
import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase.config";
import { useAuth } from "../src/context/AuthContext";
import { useStaff } from "../src/context/StaffContext";
import Navbar from "../components/NavBar";
import { useAlert } from "../src/context/AlertContext";

const StaffEvaluationForm: React.FC = () => {
  const { user } = useAuth(); // Proprietor
  const [form, setForm] = useState({
    overallScore: "",
    strengths: "",
    weaknesses: "",
    recommendations: "",
  });
  const { allStaff } = useStaff();
  const { showAlert } = useAlert();
  const [selectedStaffId, setSelectedStaffId] = useState("");

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    if (name === "staffId") {
      setSelectedStaffId(value);
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async () => {
    if (!user || user.role !== "Proprietor") {
      showAlert("Only Proprietors can submit evaluations.", "warning");
      return;
    }
    if (!selectedStaffId) {
      showAlert("Please select a staff member.", "warning");
      return;
    }
    const selectedStaff = allStaff.find(
      (staff) => staff.uid === selectedStaffId
    );
    if (!selectedStaff) {
      showAlert("Staff not found.", "warning");
      return;
    }
    const evaluationsRef = collection(
      db,
      "staff",
      selectedStaffId,
      "evaluations"
    );
    await addDoc(evaluationsRef, {
      evaluatorId: user.uid,
      evaluatorName: user.lastName,
      date: new Date().toISOString(),
      ...form,
      overallScore: parseFloat(form.overallScore),
      firstName: selectedStaff.firstName,
      lastName: selectedStaff.lastName,
    });

    showAlert("Evaluation submitted", "success");
    setForm({
      overallScore: "",
      strengths: "",
      weaknesses: "",
      recommendations: "",
    });
    setSelectedStaffId("");
  };

  return (
    <>
      <Navbar />

      <div className="mt-26 mb-10 max-w-3xl mx-auto  bg-[#FFF7ED] p-6 rounded-2xl shadow-md border border-amber-300 space-y-6">
        <h2 className="text-2xl font-bold text-center text-[#065F46]">
          📝 Staff Evaluation Form
        </h2>

        {/* Staff Selector */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#78350F]">
            Select Staff
          </label>
          <select
            name="staffId"
            value={selectedStaffId}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
            required
          >
            <option value="">-- Choose Staff --</option>
            {allStaff.map((staff) => (
              <option key={staff.uid} value={staff.uid}>
                {staff.lastName} {staff.firstName}
              </option>
            ))}
          </select>
        </div>

        {/* Score Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#78350F]">
            Overall Score (out of 10)
          </label>
          <input
            type="number"
            name="overallScore"
            value={form.overallScore}
            onChange={handleChange}
            placeholder="e.g. 8"
            min={1}
            max={10}
            className="w-full px-4 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
            required
          />
        </div>

        {/* Strengths */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#78350F]">
            Strengths
          </label>
          <textarea
            name="strengths"
            value={form.strengths}
            onChange={handleChange}
            rows={3}
            placeholder="What is this staff member doing well?"
            className="w-full px-4 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
        </div>

        {/* Weaknesses */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#78350F]">
            Weaknesses
          </label>
          <textarea
            name="weaknesses"
            value={form.weaknesses}
            onChange={handleChange}
            rows={3}
            placeholder="Areas for improvement..."
            className="w-full px-4 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>

        {/* Recommendations */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#78350F]">
            Recommendations
          </label>
          <textarea
            name="recommendations"
            value={form.recommendations}
            onChange={handleChange}
            rows={3}
            placeholder="Suggestions to support their growth"
            className="w-full px-4 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition"
        >
          📩 Submit Evaluation
        </button>
      </div>
    </>
  );
};

export default StaffEvaluationForm;
