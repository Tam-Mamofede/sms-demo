import { useState } from "react";
import { useFinance } from "../../src/context/FinanceContext";
import { useAuth } from "../../src/context/AuthContext";
import { useAlert } from "../../src/context/AlertContext";

export default function AddIncome() {
  const { addIncome } = useFinance();
  const { user } = useAuth();
  const { showAlert } = useAlert();

  const [amount, setAmount] = useState("");
  const [source, setSource] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amountNum = Number(amount);
    if (!amount || isNaN(amountNum))
      return showAlert("Invalid amount", "warning");
    if (!source) return showAlert("Source is required", "warning");

    await addIncome({
      amount: amountNum,
      source,
      date: new Date().toISOString(),
      addedBy: user?.lastName || "unknown",
    });

    setAmount("");
    setSource("");
    showAlert("Income recorded", "success");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[#FDE68A] border border-yellow-300 p-6 rounded-2xl shadow-md space-y-5"
    >
      <h3 className="text-2xl font-bold text-[#065F46]">Add Income</h3>

      <div>
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
      </div>

      <div>
        <label className="block text-sm font-semibold text-[#78350F] mb-1">
          Source
        </label>
        <input
          type="text"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          placeholder="e.g. Tuition, Donation, PTA"
          className="w-full p-3 rounded-md border border-gray-300 bg-white text-gray-800 focus:ring-2 focus:ring-amber-400 focus:outline-none"
          required
        />
      </div>

      <button
        type="submit"
        className="w-full bg-[#10B981] hover:bg-emerald-700 text-white py-3 rounded-lg font-semibold transition"
      >
        Add Income
      </button>
    </form>
  );
}
