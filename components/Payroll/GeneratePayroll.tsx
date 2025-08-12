import { useState } from "react";
import { usePayroll } from "../../src/context/PayrollContext";
import PayrollTable from "./PayrollTable";
import { useAlert } from "../../src/context/AlertContext";
export default function GeneratePayroll() {
  const { generatePayrollForMonth } = usePayroll();
  const { showAlert } = useAlert();

  const today = new Date();
  const defaultMonth = (today.getMonth() + 1).toString().padStart(2, "0");
  const defaultYear = today.getFullYear().toString();

  const [month, setMonth] = useState(defaultMonth);
  const [year, setYear] = useState(defaultYear);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      await generatePayrollForMonth(month, year);
      showAlert(
        `Payroll for ${month}/${year} generated successfully!`,
        "success"
      );
    } catch (error) {
      console.error("Payroll generation failed:", error);
      showAlert(
        "Oops! Something went wrong while generating payroll.",
        "error"
      );
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Form Card */}
      <div className="max-w-2xl mx-auto bg-[#FFF7ED] p-8 rounded-2xl shadow-md border border-yellow-200">
        <h2 className="text-2xl font-bold text-[#065F46] mb-6">
          Generate Staff Payroll
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Month Selector */}
          <div>
            <label className="block text-sm font-medium text-[#78350F] mb-1">
              Month
            </label>
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-800 focus:ring-2 focus:ring-amber-400"
            >
              {Array.from({ length: 12 }, (_, i) => {
                const val = (i + 1).toString().padStart(2, "0");
                return (
                  <option key={val} value={val}>
                    {val}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Year Input */}
          <div>
            <label className="block text-sm font-medium text-[#78350F] mb-1">
              Year
            </label>
            <input
              type="text"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder="e.g. 2025"
              className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-800 focus:ring-2 focus:ring-amber-400"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleGenerate}
          disabled={loading}
          className={`w-full py-3 rounded-lg font-semibold transition ${
            loading
              ? "bg-gray-400 text-white cursor-not-allowed"
              : "bg-[#10B981] text-white hover:bg-emerald-700"
          }`}
        >
          {loading ? "Generating..." : `Generate Payroll for ${month}/${year}`}
        </button>
      </div>

      {/* Payroll Table Below */}
      <div className="mt-4">
        <PayrollTable selectedMonth={month} selectedYear={year} />
      </div>
    </div>
  );
}
