import { useState } from "react";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "../../firebase.config";
import { useAuth } from "../../src/context/AuthContext";
import { useStudent } from "../../src/context/StudentContext";
import { useAlert } from "../../src/context/AlertContext";

export default function SendGuardianNotice() {
  const { user } = useAuth();
  const { showAlert } = useAlert();
  const { currentStudent } = useStudent();
  const [form, setForm] = useState({
    guardianId: "",
    title: "",
    content: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  if (currentStudent?.guardianId) {
    form.guardianId = currentStudent.guardianId;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { guardianId, title, content } = form;

    if (!guardianId || !title || !content) {
      showAlert("Fill in all fields.", "warning");
      return;
    }

    try {
      setLoading(true);
      const guardianNoticeRef = collection(
        db,
        "guardians",
        guardianId.trim(),
        "notices"
      );

      await addDoc(guardianNoticeRef, {
        title,
        content,
        createdAt: Timestamp.now(),
        sentBy: user?.uid,
        senderName: user?.lastName || user?.email,
      });

      showAlert("Notice sent to guardian!", "success");
      setForm({
        guardianId: "",
        title: "",
        content: "",
      });
    } catch (error) {
      console.error("Error sending notice:", error);
      showAlert("Error sending notice.", "success");
    } finally {
      setLoading(false);
    }
  };

  if (
    !user ||
    !["FormTeacher", "IT", "Proprietor", "Accountant"].includes(user.role)
  ) {
    return <div className="text-center">Access Denied</div>;
  }

  return (
    <div className="mt-8 flex justify-center items-center  px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-[#FDE68A] p-8 rounded-2xl shadow-xl w-full max-w-xl space-y-6 border border-yellow-300"
      >
        <h2 className="text-3xl font-bold text-[#065F46] text-center">
          📩 Send Private Notice
        </h2>

        <div>
          <label className="block text-sm font-semibold text-[#78350F] mb-1">
            Notice Title
          </label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Enter a short title"
            className="w-full p-3 rounded-md border bg-white text-gray-800"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#78350F] mb-1">
            Message
          </label>
          <textarea
            name="content"
            value={form.content}
            onChange={handleChange}
            placeholder="Enter your message here..."
            className="w-full p-3 rounded-md border bg-white text-gray-800 min-h-[120px]"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 text-white font-semibold rounded-lg transition ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-[#10B981] hover:bg-emerald-700"
          }`}
        >
          {loading ? "Sending..." : "Send Notice"}
        </button>
      </form>
    </div>
  );
}
