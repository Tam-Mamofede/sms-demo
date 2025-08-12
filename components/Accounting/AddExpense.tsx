import { useState } from "react";
import { useFinance } from "../../src/context/FinanceContext";
import { useAuth } from "../../src/context/AuthContext";
import { useAlert } from "../../src/context/AlertContext";

export default function AddExpense() {
  const { addExpense } = useFinance();
  const { user } = useAuth();
  const { showAlert } = useAlert();
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amountNum = Number(amount);
    if (!amount || isNaN(amountNum))
      return showAlert("Invalid amount", "warning");
    if (!category) return showAlert("Category is required", "warning");

    await addExpense({
      amount: amountNum,
      category,
      date: new Date().toISOString(),
      addedBy: user?.lastName || "unknown",
    });

    setAmount("");
    setCategory("");
    showAlert("Expense recorded", "success");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[#FDE68A] border border-yellow-300 p-6 rounded-2xl shadow-md space-y-5"
    >
      <h3 className="font-bold text-2xl text-red-700">Add Expense</h3>
      <label className="block text-sm font-semibold text-[#78350F] mb-1">
        Amount (₦)
      </label>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="e.g. 50000"
        className="w-full p-3 rounded-md border border-gray-300 bg-white text-gray-800 focus:ring-2 focus:ring-amber-400 focus:outline-none"
        required
      />
      <label className="block text-sm font-semibold text-[#78350F] mb-1">
        Category
      </label>
      <input
        type="text"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        placeholder="e.g., Printing"
        className="w-full p-3 rounded-md border border-gray-300 bg-white text-gray-800 focus:ring-2 focus:ring-amber-400 focus:outline-none"
        required
      />
      <button
        type="submit"
        className="w-full bg-red-500 hover:bg-red-700 text-white py-3 rounded-lg font-semibold transition"
      >
        Add Expense
      </button>
    </form>
  );
}
