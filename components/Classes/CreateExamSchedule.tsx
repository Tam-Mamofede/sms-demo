import { useState } from "react";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "../../firebase.config";
import { useAuth } from "../../src/context/AuthContext";

import FormTeacherExamScheduleView from "./FormTeacherExamScheduleView";
import { useAlert } from "../../src/context/AlertContext";

export default function CreateExamSchedule({ classId }: { classId: string }) {
  const { user, subjects } = useAuth();
  const { showAlert } = useAlert();
  const [form, setForm] = useState({
    subject: "",
    date: "",
    startTime: "",
    endTime: "",
    venue: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || user.role !== "FormTeacher")
      return showAlert("Access Denied", "warning");

    try {
      setLoading(true);
      await addDoc(collection(db, "classes", classId, "examSchedules"), {
        ...form,
        createdAt: Timestamp.now(),
        createdBy: user.uid,
      });

      showAlert("Exam schedule created!", "success");
      setForm({
        subject: "",
        date: "",
        startTime: "",
        endTime: "",
        venue: "",
      });
    } catch (error) {
      console.error("Failed to create schedule:", error);
      showAlert("Something went wrong. Try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <p className="text-red-600 font-bold">You're not logged in...</p>;
  }

  return (
    <div>
      <div className="bg-[#FDE68A] p-6 rounded-2xl shadow-lg w-screen max-w-md mx-auto mt-6">
        <h1 className="text-2xl font-bold text-[#065F46] mb-4 text-center">
          Create Exam Schedule
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#78350F] mb-1">
              Subject
            </label>
            <select
              name="subject"
              value={form.subject}
              onChange={handleChange}
              className="w-full border border-gray-700 rounded-xl p-2"
              required
            >
              <option value="">Select Subject</option>
              {subjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-sm font-medium text-[#78350F] mb-1">
                Date
              </label>
              <input
                name="date"
                type="date"
                value={form.date}
                onChange={handleChange}
                className="w-full border border-gray-700 rounded-xl p-2"
                required
              />
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-[#78350F] mb-1">
                Start Time
              </label>
              <input
                name="startTime"
                type="time"
                value={form.startTime}
                onChange={handleChange}
                className="w-full border border-gray-700 rounded-xl p-2"
                required
              />
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-[#78350F] mb-1">
                End Time
              </label>
              <input
                name="endTime"
                type="time"
                value={form.endTime}
                onChange={handleChange}
                className="w-full border border-gray-700 rounded-xl p-2"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 rounded-xl font-bold transition-colors ${
              loading
                ? "bg-gray-400 text-white cursor-not-allowed"
                : "bg-[#10B981] text-white hover:bg-[#059669]"
            }`}
          >
            {loading ? "Creating..." : "Create Schedule"}
          </button>
        </form>
      </div>
      <div className="mt-10">
        <FormTeacherExamScheduleView classId={user?.formTeacherClass} />
      </div>
    </div>
  );
}
