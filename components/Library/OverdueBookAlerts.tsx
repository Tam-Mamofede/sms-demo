import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../../firebase.config";
import { useLibrary } from "../../src/context/LibraryContext";
import Loader from "../Loader";

type OverdueRecord = {
  bookId: string;
  bookTitle: string;
  studentId: string;
  studentName: string;
  dueDate: string;
  borrowId: string;
  daysLate: number;
};

export default function OverdueBookshowAlerts() {
  const [overdues, setOverdues] = useState<OverdueRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { markAsReturned } = useLibrary();

  useEffect(() => {
    const fetchOverdues = async () => {
      setLoading(true);
      const allBooksSnap = await getDocs(collection(db, "library"));
      const overdueList: OverdueRecord[] = [];

      for (const bookDoc of allBooksSnap.docs) {
        const bookId = bookDoc.id;
        const bookTitle = bookDoc.data().title;

        const borrowSnap = await getDocs(
          collection(db, "library", bookId, "borrowedBy")
        );

        borrowSnap.forEach((borrowDoc) => {
          const data = borrowDoc.data();
          const dueDate = new Date(data.dueDate);
          const today = new Date();
          const isReturned = data.isReturned;

          if (!isReturned && dueDate < today) {
            const daysLate = Math.ceil(
              (today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
            );

            overdueList.push({
              bookId,
              bookTitle,
              borrowId: borrowDoc.id,
              studentId: data.studentId,
              studentName: data.studentName,
              dueDate: dueDate.toLocaleDateString(),
              daysLate,
            });
          }
        });
      }

      setOverdues(overdueList);
      setLoading(false);
    };

    fetchOverdues();
  }, []);

  const handleReturn = async (bookId: string, borrowId: string) => {
    await markAsReturned(bookId, borrowId);
    setOverdues((prev) =>
      prev.filter(
        (entry) => !(entry.bookId === bookId && entry.borrowId === borrowId)
      )
    );
  };

  return (
    <div className="p-6 space-y-6 bg-[#FFF7ED] rounded-2xl grid sm:grid-cols-3 md:grid-cols-5">
      {loading ? (
        <div className="flex justify-center items-center h-full w-full">
          <Loader />
        </div>
      ) : overdues.length === 0 ? (
        <p className="text-center text-emerald-700 font-semibold text-lg">
          🎉 No overdue books!
        </p>
      ) : (
        overdues.map((entry, index) => (
          <div
            key={`${entry.bookId}-${entry.borrowId}`}
            className="border border-rose-300 bg-rose-50 rounded-xl p-5 shadow-sm space-y-2"
          >
            {/* Book title + ID */}
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-rose-800">
                {entry.bookTitle}
              </h3>
              <span className="text-xs text-gray-500">#{index + 1}</span>
            </div>

            {/* Student info */}
            <p className="text-gray-700">
              <strong>{entry.studentName}</strong> ({entry.studentId})
            </p>

            {/* Due info */}
            <p>
              Due Date:{" "}
              <span className="font-medium text-[#78350F]">
                {entry.dueDate}
              </span>
            </p>

            {/* Days late */}
            <p className="text-rose-700 font-semibold">
              {entry.daysLate} day{entry.daysLate > 1 ? "s" : ""} overdue
            </p>

            {/* Action button */}
            <button
              onClick={() => handleReturn(entry.bookId, entry.borrowId)}
              className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition"
            >
              Mark as Returned
            </button>
          </div>
        ))
      )}
    </div>
  );
}
