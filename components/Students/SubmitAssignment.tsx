import { useState } from "react";
import { useAuth } from "../../src/context/AuthContext";
import { db } from "../../firebase.config";
import { addDoc, collection } from "firebase/firestore";
import { useStudent } from "../../src/context/StudentContext";
import { useAlert } from "../../src/context/AlertContext";

type Props = {
  assignment: {
    id: string;
    title: string;
    subject: string;
    dueDate: string;
    class: string;
  };
  onClose: () => void;
};

export default function SubmitAssignment({ assignment, onClose }: Props) {
  const { guardianUser } = useAuth();
  const { currentStudent } = useStudent();
  const [answer, setAnswer] = useState("");
  const { showAlert } = useAlert();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!currentStudent || !answer.trim()) {
      return showAlert("Please enter your assignment.", "warning");
    }

    setSubmitting(true);

    await addDoc(collection(db, "assignment_submissions"), {
      studentId: currentStudent.id,
      studentName: `${currentStudent.firstName} ${currentStudent.lastName}`,
      guardianId: guardianUser?.id,
      assignmentId: assignment.id,
      assignmentTitle: assignment.title,
      subject: assignment.subject,
      class: currentStudent?.class,
      answer,
      submittedAt: new Date().toISOString(),
    });

    showAlert("Assignment submitted successfully", "success");
    setAnswer("");
    setSubmitting(false);
    onClose();
  };

  return (
    <div className="p-6 max-w-2xl mx-auto border rounded shadow bg-white">
      <h2 className="text-2xl font-bold mb-4">
        Submit Assignment:{" "}
        <span className="text-amber-700">{assignment.title}</span>
      </h2>

      <p className="mb-2 text-gray-700">
        <strong>Subject:</strong> {assignment.subject}
      </p>
      <p className="mb-4 text-gray-700">
        <strong>Due:</strong> {assignment.dueDate}
      </p>

      <label htmlFor="answer" className="block font-medium mb-2">
        Type your assignment below:
      </label>
      <textarea
        id="answer"
        rows={10}
        className="w-full p-3 border rounded mb-4"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Type your answer here..."
      />

      <button
        onClick={handleSubmit}
        disabled={submitting || !answer.trim()}
        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded mr-4 disabled:opacity-50"
      >
        {submitting ? "Submitting..." : "Submit Assignment"}
      </button>

      <button onClick={onClose} className="text-sm text-rose-600 underline">
        ← Back to assignment list
      </button>
    </div>
  );
}
