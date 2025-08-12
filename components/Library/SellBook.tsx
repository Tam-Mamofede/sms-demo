import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  increment,
} from "firebase/firestore";
import { db } from "../../firebase.config";
import { useFinance } from "../../src/context/FinanceContext";
import { useAuth } from "../../src/context/AuthContext";
import { BookType } from "../../src/types/BookType";
import { useAlert } from "../../src/context/AlertContext";

export default function SellBook() {
  const [books, setBooks] = useState<BookType[]>([]);
  const [selectedBookId, setSelectedBookId] = useState("");
  const [buyer, setBuyer] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [quantitySold, setQuantitySold] = useState<number>(1);
  const [selectedClass, setSelectedClass] = useState("");

  const { showAlert } = useAlert();
  const { user } = useAuth();
  const { addIncome } = useFinance();

  const filteredBooks = books.filter((book) =>
    book.classLevels.includes(selectedClass)
  );

  useEffect(() => {
    const fetchBooks = async () => {
      const snap = await getDocs(collection(db, "library"));
      const data = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as BookType[];
      setBooks(data);
    };

    fetchBooks();
  }, []);

  const handleSell = async (e: React.FormEvent) => {
    e.preventDefault();

    const book = books.find((b) => b.id === selectedBookId);
    if (!book || quantitySold > book.quantity) {
      showAlert("Invalid book or not enough stock", "warning");
      return;
    }

    try {
      const bookRef = doc(db, "library", selectedBookId);
      await updateDoc(bookRef, {
        quantity: increment(-quantitySold),
      });

      if (!user) return showAlert("User not found!", "error");

      await addIncome({
        amount: price * quantitySold,
        source: "Library Sale",
        date: new Date().toISOString(),
        addedBy: user?.lastName,
      });

      showAlert("Transaction registered!", "success");

      setSelectedBookId("");
      setBuyer("");
      setPrice(0);
      setQuantitySold(1);
    } catch (err) {
      console.error("Error selling book: ", err);
      showAlert("Failed to complete sale.", "error");
    }
  };

  return (
    <div className="mt-10 bg-[#FFF7ED] flex items-center justify-center px-4">
      <form
        onSubmit={handleSell}
        className="w-full max-w-lg bg-white rounded-2xl p-8 shadow-2xl border border-amber-300 space-y-6"
      >
        <h2 className="text-2xl font-bold text-[#78350F] text-center">
          Sell a Book
        </h2>

        {/* Step 1: Class Selector */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Select Class
          </label>
          <select
            value={selectedClass}
            onChange={(e) => {
              setSelectedClass(e.target.value);
              setSelectedBookId(""); // Reset book when class changes
            }}
            required
            className="w-full px-4 py-2 border rounded-lg bg-[#FFFBF0] focus:outline-none focus:ring-2 focus:ring-emerald-400"
          >
            <option value="">-- Choose class --</option>
            {Array.from(new Set(books.flatMap((book) => book.classLevels))).map(
              (cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              )
            )}
          </select>
        </div>

        {/* Step 2: Book Selector */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Select Book
          </label>
          <select
            value={selectedBookId}
            onChange={(e) => setSelectedBookId(e.target.value)}
            required
            disabled={!selectedClass}
            className="w-full px-4 py-2 border rounded-lg bg-[#FFFBF0] focus:outline-none focus:ring-2 focus:ring-emerald-400 disabled:bg-gray-100"
          >
            <option value="">-- Choose a book --</option>
            {filteredBooks.map((book) => (
              <option key={book.id} value={book.id}>
                {book.title} (Available: {book.quantity})
              </option>
            ))}
          </select>
        </div>

        {/* Buyer's Name */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Buyer's Name
          </label>
          <input
            type="text"
            placeholder="Enter buyer's name"
            value={buyer}
            onChange={(e) => setBuyer(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg bg-[#FFFBF0] focus:outline-none focus:ring-2 focus:ring-emerald-400"
            required
          />
        </div>

        {/* Price */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Unit Price (₦)
          </label>
          <input
            type="number"
            placeholder="Set unit price"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            className="w-full px-4 py-2 border rounded-lg bg-[#FFFBF0] focus:outline-none focus:ring-2 focus:ring-amber-400"
            required
            min={1}
          />
        </div>

        {/* Quantity */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Quantity
          </label>
          <input
            type="number"
            placeholder="How many copies?"
            value={quantitySold}
            onChange={(e) => setQuantitySold(Number(e.target.value))}
            className="w-full px-4 py-2 border rounded-lg bg-[#FFFBF0] focus:outline-none focus:ring-2 focus:ring-amber-400"
            required
            min={1}
          />
        </div>

        {/* Submit */}
        <div className="pt-4">
          <button
            type="submit"
            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 rounded-xl transition"
          >
            Sell Book
          </button>
        </div>
      </form>
    </div>
  );
}
