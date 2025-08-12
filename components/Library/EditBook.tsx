import { useState, useEffect } from "react";
import { useLibrary } from "../../src/context/LibraryContext";
import { BookType } from "../../src/types/BookType";
import { useAuth } from "../../src/context/AuthContext";
import { useAlert } from "../../src/context/AlertContext";

interface EditBookModalProps {
  book: BookType;
  onClose: () => void;
}

export default function EditBook({ book, onClose }: EditBookModalProps) {
  const { updateBook } = useLibrary();
  const { showAlert } = useAlert();
  const { classOptions } = useAuth();

  const [form, setForm] = useState({ ...book });

  useEffect(() => {
    setForm({ ...book });
  }, [book]);

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
    await updateBook(book.id!, {
      title: form.title,
      author: form.author,
      quantity: form.quantity,
      classLevels: form.classLevels,
    });
    showAlert("Book updated!", "error");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow-lg space-y-4 w-[90%] max-w-md"
      >
        <h2 className="text-xl font-bold">Edit Book</h2>

        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />

        <input
          name="author"
          value={form.author}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />

        <input
          type="number"
          name="quantity"
          value={form.quantity}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />

        <select
          multiple
          value={form.classLevels}
          onChange={handleClassSelect}
          className="w-full h-32 p-2 border rounded"
        >
          {classOptions.map((cls) => (
            <option key={cls} value={cls}>
              {cls}
            </option>
          ))}
        </select>

        <div className="flex justify-between">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Save
          </button>
          <button type="button" onClick={onClose} className="text-red-500">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
