import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase.config";
import { useLibrary } from "../../src//context/LibraryContext";
import Loader from "../Loader";

interface BorrowEntry {
  bookId: string;
  bookTitle: string;
  borrowId: string;
  studentId: string;
  studentName: string;
  dateBorrowed: string;
  dueDate: string;
  isReturned: boolean;
  returnedAt?: string | null;
}

export default function AllBorrowedBooks() {
  const [borrowedBooks, setBorrowedBooks] = useState<BorrowEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentIdFilter, setStudentIdFilter] = useState("");

  const { markAsReturned } = useLibrary();

  useEffect(() => {
    const fetchAllBorrows = async () => {
      setLoading(true);
      const allBooksSnap = await getDocs(collection(db, "library"));
      const result: BorrowEntry[] = [];

      for (const bookDoc of allBooksSnap.docs) {
        const bookId = bookDoc.id;
        const bookTitle = bookDoc.data().title;
        const borrowedSnap = await getDocs(
          collection(db, "library", bookId, "borrowedBy")
        );

        borrowedSnap.forEach((borrowDoc) => {
          const data = borrowDoc.data();
          result.push({
            bookId,
            bookTitle,
            borrowId: borrowDoc.id,
            studentId: data.studentId,
            studentName: data.studentName,
            dateBorrowed: new Date(
              data.dateBorrowed?.seconds * 1000
            ).toLocaleDateString(),
            dueDate: new Date(data.dueDate).toLocaleDateString(),
            isReturned: data.isReturned,
            returnedAt: data.returnedAt
              ? new Date(data.returnedAt.seconds * 1000).toLocaleDateString()
              : null,
          });
        });
      }

      setBorrowedBooks(result);
      setLoading(false);
    };

    fetchAllBorrows();
  }, []);

  const handleReturn = async (bookId: string, borrowId: string) => {
    await markAsReturned(bookId, borrowId);
    setBorrowedBooks((prev) =>
      prev.map((entry) =>
        entry.bookId === bookId && entry.borrowId === borrowId
          ? {
              ...entry,
              isReturned: true,
              returnedAt: new Date().toLocaleDateString(),
            }
          : entry
      )
    );
  };

  const filteredBorrowedBooks = borrowedBooks.filter((entry) =>
    entry.studentId.toLowerCase().includes(studentIdFilter.toLowerCase())
  );

  return (
    <div className="p-6 max-w-6xl mx-auto bg-[#FFF7ED] min-h-screen">
      <h2 className="text-3xl font-bold text-[#065F46] mb-6 text-center">
        Borrowed Books Overview
      </h2>

      {loading ? (
        <div className="flex justify-center items-center h-full w-full">
          <Loader />
        </div>
      ) : borrowedBooks.length === 0 ? (
        <p className="text-center text-emerald-700 font-semibold text-lg">
          🎉 No books have been borrowed!
        </p>
      ) : (
        <>
          {/* 🔍 Filter */}
          <div className="flex justify-center mb-6">
            <input
              type="text"
              placeholder="🔎 Filter by Student ID..."
              value={studentIdFilter}
              onChange={(e) => setStudentIdFilter(e.target.value)}
              className="w-full md:w-96 p-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          {/* Borrowed List */}
          <ul className="space-y-5">
            {filteredBorrowedBooks.map((entry) => (
              <li
                key={`${entry.bookId}-${entry.borrowId}`}
                className="bg-white p-5 rounded-2xl shadow border border-gray-200 space-y-2"
              >
                <h3 className="text-xl font-bold text-[#78350F]">
                  {entry.bookTitle}
                </h3>

                <div className="text-sm text-gray-700 space-y-1">
                  <p>
                    <strong>{entry.studentName}</strong> ({entry.studentId})
                  </p>
                  <p>Borrowed: {entry.dateBorrowed}</p>
                  <p>Due: {entry.dueDate}</p>
                </div>

                {entry.isReturned ? (
                  <p className="text-sm font-medium text-emerald-600">
                    Returned on {entry.returnedAt}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {new Date(entry.dueDate) < new Date() && (
                      <p className="text-red-600 font-semibold text-sm">
                        🚨 Overdue!
                      </p>
                    )}
                    <button
                      onClick={() => handleReturn(entry.bookId, entry.borrowId)}
                      className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 transition"
                    >
                      Mark as Returned
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
