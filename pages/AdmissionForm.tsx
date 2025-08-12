import { useState } from "react";
import { db } from "../firebase.config"; // adjust if needed
import { addDoc, collection, Timestamp } from "firebase/firestore";
import { useAuth } from "../src/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useAlert } from "../src/context/AlertContext";

export default function AdmissionForm() {
  const { classOptions } = useAuth();
  const { showAlert } = useAlert();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    dateOfBirth: "",
    classApplying: "",
    guardianName: "",
    guardianPhone: "",
  });

  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    try {
      const admissionRef = collection(db, "admissions");
      await addDoc(admissionRef, {
        ...formData,
        submittedAt: Timestamp.now(),
        status: "pending",
      });

      showAlert("Application submitted successfully!", "success");
      navigate("/");
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        dateOfBirth: "",
        classApplying: "",
        guardianName: "",
        guardianPhone: "",
      });
    } catch (error) {
      console.error("❌ Error submitting application:", error);
      showAlert("Something went wrong. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF7ED] flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-md w-full max-w-2xl space-y-4"
      >
        <h2 className="text-2xl font-bold text-[#065F46] mb-6 text-center">
          Admission Application Form
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            name="firstName"
            value={formData.firstName}
            placeholder="First Name"
            className="p-3 rounded-xl border border-gray-300"
            onChange={handleChange}
            required
          />
          <input
            name="lastName"
            value={formData.lastName}
            placeholder="Last Name"
            className="p-3 rounded-xl border border-gray-300"
            onChange={handleChange}
            required
          />
          <input
            name="email"
            value={formData.email}
            type="email"
            placeholder="Email Address"
            className="p-3 rounded-xl border border-gray-300"
            onChange={handleChange}
            required
          />
          <input
            name="dateOfBirth"
            value={formData.dateOfBirth}
            type="date"
            className="p-3 rounded-xl border border-gray-300"
            onChange={handleChange}
            required
          />
          <select
            name="classApplying"
            value={formData.classApplying}
            className="p-3 rounded-xl border border-gray-300"
            onChange={handleChange}
            required
          >
            <option value="">Select Class</option>
            {classOptions.map((cls) => (
              <option key={cls} value={cls}>
                {cls}
              </option>
            ))}
          </select>
          <input
            name="guardianName"
            value={formData.guardianName}
            placeholder="Guardian Full Name"
            className="p-3 rounded-xl border border-gray-300"
            onChange={handleChange}
            required
          />
          <input
            name="guardianPhone"
            value={formData.guardianPhone}
            placeholder="Guardian Phone"
            className="p-3 rounded-xl border border-gray-300"
            onChange={handleChange}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`mt-6 w-full ${
            loading ? "bg-gray-400" : "bg-[#10B981] hover:bg-[#0e9e6f]"
          } text-white py-3 rounded-2xl font-bold`}
        >
          {loading ? "Submitting..." : "Submit Application"}
        </button>
      </form>
    </div>
  );
}
