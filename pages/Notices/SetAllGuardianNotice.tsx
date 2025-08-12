import { useState } from "react";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "../../firebase.config";
import { useAuth } from "../../src/context/AuthContext";
import Navbar from "../../components/NavBar";
import { useAlert } from "../../src/context/AlertContext";

export default function SetAllGuardianNotice() {
  const { user } = useAuth();
  const { showAlert } = useAlert();

  const [form, setForm] = useState({
    title: "",
    content: "",
    startDate: "",
    endDate: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title || !form.content || !form.startDate || !form.endDate) {
      showAlert("Please fill all fields", "warning");
      return;
    }

    try {
      setLoading(true);
      await addDoc(collection(db, "notices"), {
        ...form,
        role: "guardian",
        targetClass: "all",
        startDate: Timestamp.fromDate(new Date(form.startDate)),
        endDate: Timestamp.fromDate(new Date(form.endDate)),
        createdAt: Timestamp.now(),
        sentBy: user?.uid,
        senderName: user?.lastName || user?.email,
      });

      showAlert("Notice sent to all guardians!", "success");
      setForm({
        title: "",
        content: "",
        startDate: "",
        endDate: "",
      });
    } catch (err) {
      console.error("Failed to send notice:", err);
      showAlert("Error sending notice", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />{" "}
      <div className="max-w-2xl mx-auto bg-[#FFF7ED] p-8 rounded-2xl shadow-md border border-yellow-200 mt-26">
        <h2 className="text-3xl font-bold text-center text-[#065F46] mb-6">
          📢 Broadcast Notice to All Guardians
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-[#78350F] mb-1">
              Title
            </label>
            <input
              type="text"
              name="title"
              placeholder="e.g. PTA Meeting Notification"
              value={form.title}
              onChange={handleChange}
              className="w-full p-3 rounded-md border border-gray-300 bg-white text-gray-800 focus:ring-2 focus:ring-amber-400 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#78350F] mb-1">
              Message
            </label>
            <textarea
              name="content"
              placeholder="Write the full details of the notice..."
              value={form.content}
              onChange={handleChange}
              className="w-full p-3 rounded-md border border-gray-300 bg-white text-gray-800 h-32 resize-none focus:ring-2 focus:ring-amber-400 focus:outline-none"
              required
            />
          </div>

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

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-bold transition ${
              loading
                ? "bg-gray-300 text-white cursor-not-allowed"
                : "bg-[#10B981] text-white hover:bg-emerald-700"
            }`}
          >
            {loading ? "Sending..." : "📨 Send Notice"}
          </button>
        </form>
      </div>
    </>
  );
}
