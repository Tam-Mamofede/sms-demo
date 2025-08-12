import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase.config";
import Loader from "../Loader";

interface Props {
  studentId: string;
}

type BorrowRecord = {
  bookId: string;
  bookTitle: string;
  dateBorrowed: string;
  dueDate: string;
  isReturned: boolean;
};

export default function StudentBorrowedBooks({ studentId }: Props) {
  const [borrowedBooks, setBorrowedBooks] = useState<BorrowRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBorrowedBooks = async () => {
      setLoading(true);
      const librarySnap = await getDocs(collection(db, "library"));
      const borrowedData: BorrowRecord[] = [];

      for (const bookDoc of librarySnap.docs) {
        const bookId = bookDoc.id;
        const bookTitle = bookDoc.data().title;

        const borrowedBySnap = await getDocs(
          collection(db, "library", bookId, "borrowedBy")
        );

        borrowedBySnap.forEach((borrowDoc) => {
          const data = borrowDoc.data();
          if (data.studentId === studentId) {
            borrowedData.push({
              bookId,
              bookTitle,
              dateBorrowed: new Date(
                data.dateBorrowed?.seconds * 1000
              ).toLocaleDateString(),
              dueDate: new Date(data.dueDate).toLocaleDateString(),
              isReturned: data.isReturned,
            });
          }
        });
      }

      setBorrowedBooks(borrowedData);
      setLoading(false);
    };

    if (studentId) fetchBorrowedBooks();
  }, [studentId]);

  return (
    <div className="mt-6 space-y-3">
      <h2 className="text-lg font-bold">Borrowed Library Books</h2>
      {loading ? (
        <div className="flex justify-center items-center h-full w-full">
          <Loader />
        </div>
      ) : borrowedBooks.length === 0 ? (
        <p>No borrowed books.</p>
      ) : (
        borrowedBooks.map((record, idx) => (
          <div key={idx} className="border p-4 rounded bg-white shadow-sm">
            <h3 className="font-semibold text-lg">{record.bookTitle}</h3>
            <p>Borrowed on: {record.dateBorrowed}</p>
            <p>Due on: {record.dueDate}</p>
            {record.isReturned ? (
              <p className="text-green-600 font-medium">✅ Returned</p>
            ) : (
              <p className="text-red-600 font-medium">❌ Not yet returned</p>
            )}
          </div>
        ))
      )}
    </div>
  );
}
