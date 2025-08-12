import { useState } from "react";
import { useLibrary } from "../../src/context/LibraryContext";

interface BorrowBookProps {
  bookId: string;
  onClose: () => void;
}

export default function BorrowBook({ bookId, onClose }: BorrowBookProps) {
  const { borrowBook } = useLibrary();

  const [studentId, setStudentId] = useState("");
  const [studentName, setStudentName] = useState("");
  const [dueDate, setDueDate] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await borrowBook(bookId, { studentId, studentName }, dueDate);
    onClose();
  };

  return (
    <div className="flex items-center justify-center bg-[#FFF7ED] px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg bg-white p-8 rounded-2xl shadow-2xl border border-amber-300 space-y-6"
      >
        <h2 className="text-2xl font-bold text-[#065F46] text-center">
          Borrow a Book
        </h2>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Student ID
          </label>
          <input
            type="text"
            placeholder="Enter student ID"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-[#FFFBF0]"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Student Name
          </label>
          <input
            type="text"
            placeholder="Enter student name"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-[#FFFBF0]"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Return Date
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 bg-[#FFFBF0]"
            required
          />
        </div>

        <div className="flex justify-between pt-4">
          <button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-2 rounded-xl transition"
          >
            Confirm
          </button>
          <button
            type="button"
            onClick={onClose}
            className="bg-red-600 text-white px-5 rounded-xl  hover:underline font-medium"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );

  // return (
  //   <div className="  flex items-center justify-center">
  //     <form
  //       onSubmit={handleSubmit}
  //       className="bg-white p-6 rounded-xl shadow-lg space-y-4 w-[90%] max-w-md"
  //     >
  //       <h2 className="text-xl font-bold">Borrow Book</h2>

  //       <input
  //         type="text"
  //         placeholder="Student ID"
  //         value={studentId}
  //         onChange={(e) => setStudentId(e.target.value)}
  //         className="w-full p-2 border rounded"
  //         required
  //       />

  //       <input
  //         type="text"
  //         placeholder="Student Name"
  //         value={studentName}
  //         onChange={(e) => setStudentName(e.target.value)}
  //         className="w-full p-2 border rounded"
  //         required
  //       />
  //       <h3 className="mb-2"> Return Date</h3>
  //       <input
  //         type="date"
  //         value={dueDate}
  //         onChange={(e) => setDueDate(e.target.value)}
  //         className="w-full p-2 border rounded"
  //         required
  //       />

  //       <div className="flex justify-between">
  //         <button
  //           type="submit"
  //           className="bg-green-600 text-white px-4 py-2 rounded"
  //         >
  //           Confirm Borrow
  //         </button>
  //         <button type="button" onClick={onClose} className="text-red-500">
  //           Cancel
  //         </button>
  //       </div>
  //     </form>
  //   </div>
  // );
}
