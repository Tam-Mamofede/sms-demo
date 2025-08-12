import { useState } from "react";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "../../firebase.config";
import { useAuth } from "../../src/context/AuthContext";
import Navbar from "../../components/NavBar";
import { useAlert } from "../../src/context/AlertContext";

const staffRoles: string[] = [
  "FormTeacher",
  "SubjectTeacher",
  "Accountant",
  "HOD",
  "IT",
  "Receptionist",
  "Librarian",
];

export default function SetStaffRoleNotice() {
  const { user } = useAuth();
  const { showAlert } = useAlert();

  const [form, setForm] = useState({
    title: "",
    content: "",
    startDate: "",
    endDate: "",
  });

  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRoleToggle = (role: string) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !form.title ||
      !form.content ||
      !form.startDate ||
      !form.endDate ||
      selectedRoles.length === 0
    ) {
      showAlert(
        "Please fill all fields and select at least one role.",
        "warning"
      );
      return;
    }

    try {
      setLoading(true);
      await addDoc(collection(db, "notices"), {
        ...form,
        role: "staff",
        targetRoles: selectedRoles,
        startDate: Timestamp.fromDate(new Date(form.startDate)),
        endDate: Timestamp.fromDate(new Date(form.endDate)),
        createdAt: Timestamp.now(),
        sentBy: user?.uid,
        senderName: user?.lastName || user?.email,
      });

      showAlert("Notice sent to selected staff roles!", "success");
      setForm({ title: "", content: "", startDate: "", endDate: "" });
      setSelectedRoles([]);
    } catch (err) {
      console.error("Failed to send staff notice:", err);
      showAlert("Something went wrong while sending the notice.", "error");
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <Navbar />
      <div className="max-w-2xl mx-auto bg-[#FFF7ED] p-8 rounded-2xl border border-yellow-200 shadow mt-26">
        <h2 className="text-3xl font-bold text-center text-[#065F46] mb-6">
          Send Notice to Specific Staff
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-[#78350F] mb-1">
              Title
            </label>
            <input
              type="text"
              name="title"
              placeholder="e.g. Staff Meeting Announcement"
              value={form.title}
              onChange={handleChange}
              className="w-full p-3 rounded-md border border-gray-300 bg-white text-gray-800 focus:ring-2 focus:ring-amber-400 focus:outline-none"
              required
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-semibold text-[#78350F] mb-1">
              Message
            </label>
            <textarea
              name="content"
              placeholder="Write the full message..."
              value={form.content}
              onChange={handleChange}
              className="w-full p-3 rounded-md border border-gray-300 bg-white text-gray-800 h-32 resize-none focus:ring-2 focus:ring-amber-400 focus:outline-none"
              required
            />
          </div>

          {/* Dates */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-[#78350F] mb-1">
                Start Date
              </label>
              <input
                type="datetime-local"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
                className="w-full p-3 rounded-md border border-gray-300 bg-white text-gray-800 focus:ring-2 focus:ring-amber-400 focus:outline-none"
                required
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold text-[#78350F] mb-1">
                End Date
              </label>
              <input
                type="datetime-local"
                name="endDate"
                value={form.endDate}
                onChange={handleChange}
                className="w-full p-3 rounded-md border border-gray-300 bg-white text-gray-800 focus:ring-2 focus:ring-amber-400 focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Role Selection */}
          <div>
            <p className="font-semibold text-[#78350F] mb-2">
              Select Target Roles:
            </p>
            <div className="flex flex-wrap gap-2">
              {staffRoles.map((role) => (
                <label
                  key={role}
                  className={`px-4 py-2 text-sm rounded-full border cursor-pointer transition ${
                    selectedRoles.includes(role)
                      ? "bg-[#10B981] text-white border-emerald-600"
                      : "bg-gray-100 text-gray-800 border-gray-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={selectedRoles.includes(role)}
                    onChange={() => handleRoleToggle(role)}
                  />
                  {role}
                </label>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-semibold transition ${
              loading
                ? "bg-gray-300 text-white cursor-not-allowed"
                : "bg-[#10B981] text-white hover:bg-emerald-700"
            }`}
          >
            {loading ? "Sending..." : "📨 Send Staff Notice"}
          </button>
        </form>
      </div>
    </>
  );
}
