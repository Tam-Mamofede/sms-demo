import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  Timestamp,
  doc,
  updateDoc,
  increment,
} from "firebase/firestore";
import { db } from "../../firebase.config";
import { BookType } from "../../src/types/BookType";
import { useAlert } from "./AlertContext";

interface LibraryContextType {
  books: BookType[];
  addBook: (book: Omit<BookType, "id">) => Promise<void>;
  updateBook: (bookId: string, updatedData: Partial<BookType>) => Promise<void>;
  fetchBooksByClass: (classLevel: string) => Promise<void>;
  fetchAllBooks: () => Promise<void>;
  borrowBook: (
    bookId: string,
    borrower: { studentId: string; studentName: string },
    dueDate: string
  ) => Promise<void>;
  markAsReturned: (bookId: string, borrowId: string) => Promise<void>;
  loading: boolean;
}

const LibraryContext = createContext<LibraryContextType | null>(null);

function LibraryProvider({ children }: { children: ReactNode }) {
  const [books, setBooks] = useState<BookType[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentClassFilter, setCurrentClassFilter] = useState<string | null>(
    null
  );

  const { showAlert } = useAlert();

  /////////////////////////////////////////////////////////////////////////
  const markAsReturned = async (bookId: string, borrowId: string) => {
    try {
      const borrowRef = doc(db, "library", bookId, "borrowedBy", borrowId);
      await updateDoc(borrowRef, {
        isReturned: true,
        returnedAt: Timestamp.now(),
      });

      const bookRef = doc(db, "library", bookId);
      await updateDoc(bookRef, {
        quantity: increment(1),
      });

      showAlert("Book marked as returned", "success");

      if (currentClassFilter) {
        await fetchBooksByClass(currentClassFilter);
      }
    } catch (err) {
      console.error("Failed to mark as returned", err);
      showAlert("Something went wrong!", "error");
    }
  };

  ////////////////////////////////////////////
  const borrowBook = async (
    bookId: string,
    borrower: { studentId: string; studentName: string },
    dueDate: string
  ) => {
    try {
      const borrowRef = collection(db, "library", bookId, "borrowedBy");
      await addDoc(borrowRef, {
        ...borrower,
        dateBorrowed: Timestamp.now(),
        dueDate,
        isReturned: false,
        returnedAt: null,
      });

      const bookRef = doc(db, "library", bookId);
      await updateDoc(bookRef, {
        quantity: increment(-1),
      });

      if (currentClassFilter) {
        await fetchBooksByClass(currentClassFilter);
      }

      showAlert("Book marked as borrowed", "success");
    } catch (err) {
      console.error("Failed to borrow book", err);
      showAlert("Failed to borrow book", "error");
    }
  };
  ///////////////////////////////////////
  const addBook = async (book: Omit<BookType, "id">) => {
    try {
      const q = query(
        collection(db, "library"),
        where("title", "==", book.title),
        where("author", "==", book.author)
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        // ✅ Book exists → update classLevels only
        const existingDoc = snap.docs[0];
        const existingData = existingDoc.data();
        const existingClassLevels = existingData.classLevels || [];

        // 🧠 Merge classLevels, avoiding duplicates
        const newClassLevels = Array.from(
          new Set([...existingClassLevels, ...book.classLevels])
        );

        await updateDoc(doc(db, "library", existingDoc.id), {
          classLevels: newClassLevels,
        });

        showAlert("Book already exists. Class list updated.", "info");
      } else {
        await addDoc(collection(db, "library"), {
          ...book,
          quantity: Number(book.quantity),
          addedAt: Timestamp.now(),
        });

        showAlert("IBook added successfully.", "success");
      }
      if (currentClassFilter) {
        fetchBooksByClass(currentClassFilter); // 👈 auto-refresh
      }
    } catch (err) {
      showAlert("Faailed to add book", "error");
      console.error("Failed to add book:", err);
    }
  };
  ////////////////////////////////////

  const updateBook = async (bookId: string, updatedData: Partial<BookType>) => {
    try {
      const bookRef = doc(db, "library", bookId);
      await updateDoc(bookRef, updatedData);
      if (currentClassFilter) {
        await fetchBooksByClass(currentClassFilter); // Refresh list
      }

      showAlert("Book updated successfully", "success");
    } catch (err) {
      showAlert("Failed to update book", "error");
      console.error("Failed to update book:", err);
    }
  };
  ////////////////////////////////////////////////////
  const fetchBooksByClass = async (classLevel: string) => {
    setLoading(true);
    try {
      const q = query(
        collection(db, "library"),
        where("classLevels", "array-contains", classLevel)
      );
      const snapshot = await getDocs(q);
      const result: BookType[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as BookType[];
      setBooks(result);
      setCurrentClassFilter(classLevel);
    } catch (err) {
      console.error("Error fetching books:", err);
    } finally {
      setLoading(false);
    }
  };
  //////////////////////////////////////////////
  const fetchAllBooks = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "library"));
      const result: BookType[] = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as BookType[];
      setBooks(result);
      setCurrentClassFilter(null);
    } catch (err) {
      console.error("Error fetching all books:", err);
    } finally {
      setLoading(false);
    }
  };
  //////////////////////////////////////////////
  useEffect(() => {
    fetchAllBooks();
  }, []);

  ///////////////////////////////////////////////////////////////
  return (
    <LibraryContext.Provider
      value={{
        books,
        addBook,
        fetchBooksByClass,
        loading,
        updateBook,
        borrowBook,
        markAsReturned,
        fetchAllBooks,
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
}

function useLibrary() {
  const context = useContext(LibraryContext);
  if (!context) {
    throw new Error("useLibrary must be used within a LibraryProvider");
  }
  return context;
}

export { useLibrary, LibraryProvider };
