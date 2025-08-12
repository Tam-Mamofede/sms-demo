import { useState, useMemo, useEffect } from "react";
import { useLibrary } from "../../src/context/LibraryContext";
import EditBook from "./EditBook";
import { BookType } from "../../src/types/BookType";
import BorrowBook from "./BorrowBook";
import { useAuth } from "../../src/context/AuthContext";
import Loader from "../Loader";

export default function BookList() {
  const { books, loading, fetchAllBooks, fetchBooksByClass } = useLibrary();
  const { classOptions } = useAuth();
  const [editingBook, setEditingBook] = useState<BookType | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [classFilter, setClassFilter] = useState("All Classes");
  const [borrowingBookId, setBorrowingBookId] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      const matchesClass =
        classFilter === "All Classes" ||
        (Array.isArray(book.classLevels) &&
          book.classLevels.some(
            (cls) => cls.toLowerCase() === classFilter.toLowerCase()
          ));

      if (!matchesClass) return false;

      if (!searchQuery) return true;

      const matchesSearch =
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesSearch;
    });
  }, [books, searchQuery, classFilter]);

  const totalPages = Math.ceil(filteredBooks.length / itemsPerPage);

  const paginatedBooks = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredBooks.slice(start, end);
  }, [filteredBooks, currentPage]);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  useEffect(() => {
    if (classFilter === "All Classes") {
      fetchAllBooks();
    } else {
      fetchBooksByClass(classFilter);
    }
  }, [classFilter]);

  return (
    <div className="p-6 space-y-6 bg-[#FFF7ED] rounded-2xl shadow-md mt-10">
      {/* 🔍 Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <input
          type="text"
          placeholder="🔎 Search by title or author..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 p-3 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
        <select
          value={classFilter}
          onChange={(e) => setClassFilter(e.target.value)}
          className="p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-emerald-400"
        >
          <option value="All Classes">All Classes</option>
          {classOptions.map((cls) => (
            <option key={cls} value={cls}>
              {cls}
            </option>
          ))}
        </select>
      </div>

      {/* 📖 Book List */}
      {loading ? (
        <div className="flex justify-center items-center h-full w-full">
          <Loader />
        </div>
      ) : paginatedBooks.length === 0 ? (
        <p className="text-center text-gray-500 italic">
          No books match your filters.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3 md:grid-cols-5 lg:grid-col-7">
          {paginatedBooks.map((book) => (
            <div
              key={book.id}
              className="p-4 bg-white rounded-xl border shadow hover:shadow-md transition space-y-2"
            >
              <h3 className="text-lg font-bold text-[#065F46]">{book.title}</h3>
              <p className="text-sm text-gray-700">👤 Author: {book.author}</p>
              <p className="text-sm text-gray-700">
                📦 Quantity: {book.quantity}
              </p>
              <p className="text-sm text-gray-500">
                🎓 Classes: {book.classLevels.join(", ")}
              </p>

              <div className="flex gap-4 pt-2">
                <button
                  onClick={() => setBorrowingBookId(book.id!)}
                  className="text-emerald-700 text-sm font-medium hover:underline"
                >
                  Borrow
                </button>

                <button
                  onClick={() => setEditingBook(book)}
                  className="text-blue-600 text-sm font-medium hover:underline"
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ➕ Load More */}
      <div className="flex justify-center mt-6 space-x-2">
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 rounded bg-gray-200 text-sm disabled:opacity-50"
        >
          ⬅ Prev
        </button>
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => goToPage(i + 1)}
            className={`px-3 py-1 rounded text-sm ${
              currentPage === i + 1
                ? "bg-amber-400 text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            {i + 1}
          </button>
        ))}
        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 rounded bg-gray-200 text-sm disabled:opacity-50"
        >
          Next ➡
        </button>
      </div>
      {/* 📥 Modals */}
      {borrowingBookId && (
        <BorrowBook
          bookId={borrowingBookId}
          onClose={() => setBorrowingBookId(null)}
        />
      )}

      {editingBook && (
        <EditBook book={editingBook} onClose={() => setEditingBook(null)} />
      )}
    </div>
  );
}
