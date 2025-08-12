import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../../firebase.config";
import { useLibrary } from "../../src/context/LibraryContext";
import Loader from "../Loader";

interface BorrowedEntry {
  id: string;
  studentId: string;
  studentName: string;
  dateBorrowed: { seconds: number };
  dueDate: string;
  isReturned: boolean;
  returnedAt?: { seconds: number };
}

export default function BorrowedList({ bookId }: { bookId: string }) {
  const [borrowers, setBorrowers] = useState<BorrowedEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { markAsReturned } = useLibrary();

  useEffect(() => {
    const fetchBorrowers = async () => {
      const snap = await getDocs(
        collection(db, "library", bookId, "borrowedBy")
      );
      const data = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as BorrowedEntry[];
      setBorrowers(data);
      setLoading(false);
    };

    fetchBorrowers();
  }, [bookId]);

  const handleReturn = async (borrowId: string) => {
    await markAsReturned(bookId, borrowId);
    setBorrowers((prev) =>
      prev.map((b) =>
        b.id === borrowId
          ? {
              ...b,
              isReturned: true,
              returnedAt: { seconds: Date.now() / 1000 },
            }
          : b
      )
    );
  };

  return (
    <div className="mt-6 space-y-3">
      <h3 className="font-bold text-lg">Borrow History</h3>
      {loading ? (
        <div className="flex justify-center items-center h-full w-full">
          <Loader />
        </div>
      ) : borrowers.length === 0 ? (
        <p>No one has borrowed this book yet.</p>
      ) : (
        borrowers.map((entry) => {
          const isOverdue =
            !entry.isReturned && new Date(entry.dueDate) < new Date();

          return (
            <div key={entry.id} className="border p-2 rounded bg-gray-50">
              <p>
                <strong>{entry.studentName}</strong> ({entry.studentId})
              </p>
              <p>
                Borrowed:{" "}
                {new Date(
                  entry.dateBorrowed.seconds * 1000
                ).toLocaleDateString()}
              </p>
              <p>Due: {new Date(entry.dueDate).toLocaleDateString()}</p>

              {entry.isReturned ? (
                <p className="text-green-600">Returned ✅</p>
              ) : isOverdue ? (
                <>
                  <p className="text-red-600 font-semibold">🚨 Overdue!</p>
                  <button
                    onClick={() => handleReturn(entry.id)}
                    className="text-blue-600 underline mt-1"
                  >
                    Mark as Returned
                  </button>
                </>
              ) : (
                <button
                  onClick={() => handleReturn(entry.id)}
                  className="text-blue-600 underline mt-1"
                >
                  Mark as Returned
                </button>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
