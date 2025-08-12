import { useState } from "react";
import { useLibrary } from "../../src/context/LibraryContext";
import { useAuth } from "../../src/context/AuthContext";
import { useAlert } from "../../src/context/AlertContext";

export default function AddBookForm() {
  const { classOptions } = useAuth();
  const { showAlert } = useAlert();
  const { addBook } = useLibrary();

  const [form, setForm] = useState({
    title: "",
    author: "",
    quantity: 1,
    classLevels: [] as string[],
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "quantity" ? Number(value) : value,
    }));
  };

  const handleClassSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = Array.from(e.target.selectedOptions, (opt) => opt.value);
    setForm((prev) => ({ ...prev, classLevels: selected }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addBook(form);
      showAlert("Book added to the library!", "error");
      setForm({ title: "", author: "", quantity: 1, classLevels: [] });
    } catch (error) {
      console.error("Failed to add book", error);
      showAlert("Failed to add book", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-lg mx-auto p-6 bg-[#FFF7ED] shadow-lg rounded-2xl border border-amber-200 space-y-6"
    >
      <h2 className="text-2xl font-bold text-center text-[#065F46]">
        📚 Add a New Book
      </h2>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-[#78350F] mb-1">
          Book Title
        </label>
        <input
          type="text"
          name="title"
          placeholder="e.g. Things Fall Apart"
          value={form.title}
          onChange={handleChange}
          required
          className="w-full p-3 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
        />
      </div>

      {/* Author */}
      <div>
        <label className="block text-sm font-medium text-[#78350F] mb-1">
          Author
        </label>
        <input
          type="text"
          name="author"
          placeholder="e.g. Chinua Achebe"
          value={form.author}
          onChange={handleChange}
          required
          className="w-full p-3 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
        />
      </div>

      {/* Quantity */}
      <div>
        <label className="block text-sm font-medium text-[#78350F] mb-1">
          Quantity
        </label>
        <input
          type="number"
          name="quantity"
          placeholder="e.g. 10"
          value={form.quantity}
          onChange={handleChange}
          required
          min={1}
          className="w-full p-3 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
      </div>

      {/* Class Levels */}
      <div>
        <label className="block text-sm font-medium text-[#78350F] mb-1">
          Class Levels
        </label>
        <select
          multiple
          value={form.classLevels}
          onChange={handleClassSelect}
          className="w-full p-3 rounded-lg border border-gray-300 h-40 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
        >
          {classOptions.map((cls) => (
            <option key={cls} value={cls}>
              {cls}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500 mt-1">
          Hold Ctrl or Cmd to select multiple classes
        </p>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#10B981] hover:bg-emerald-600 text-white py-3 rounded-lg font-semibold transition"
      >
        {loading ? "Adding..." : "📥 Add Book"}
      </button>
    </form>
  );
}
