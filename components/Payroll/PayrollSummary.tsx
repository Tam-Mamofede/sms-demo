// components/Admin/PayrollSummary.tsx
import { useEffect, useMemo, useState } from "react";
import { usePayroll } from "../../src/context/PayrollContext";
import Loader from "../Loader";

export default function PayrollSummary() {
  const today = new Date();
  const defaultMonth = (today.getMonth() + 1).toString().padStart(2, "0");
  const defaultYear = today.getFullYear().toString();

  const { payroll, fetchPayrollForMonth, loading } = usePayroll();

  const [month, setMonth] = useState(defaultMonth);
  const [year, setYear] = useState(defaultYear);

  useEffect(() => {
    fetchPayrollForMonth(month, year);
  }, [month, year]);

  const summary = useMemo(() => {
    return payroll.reduce(
      (acc, record) => {
        acc.totalSalary += record.baseSalary;
        acc.totalAllowances += record.allowances;
        acc.totalDeductions += record.deductions;
        acc.totalNetPay += record.netPay;
        return acc;
      },
      {
        totalSalary: 0,
        totalAllowances: 0,
        totalDeductions: 0,
        totalNetPay: 0,
      }
    );
  }, [payroll]);

  return (
    <div className="mt-8 space-y-6 bg-[#FFF7ED] p-6 rounded-2xl shadow-md border border-yellow-200">
      {" "}
      <h1 className="text-[#78350F] font-bold text-2xl">See Payroll Summary</h1>
      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-end">
        {/* Month */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-[#78350F] mb-1">
            Month
          </label>
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-amber-400"
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

        {/* Year */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-[#78350F] mb-1">
            Year
          </label>
          <input
            type="text"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder="e.g. 2025"
            className="p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-amber-400"
          />
        </div>
      </div>
      {/* Summary */}
      {loading ? (
        <div className="flex justify-center items-center h-full w-full">
          <Loader />
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <Card
            label="💼 Total Salary"
            value={summary.totalSalary}
            color="emerald"
          />
          <Card
            label="💰 Allowances"
            value={summary.totalAllowances}
            color="amber"
          />
          <Card
            label="➖ Deductions"
            value={summary.totalDeductions}
            color="red"
          />
          <Card label="📊 Net Pay" value={summary.totalNetPay} color="green" />
        </div>
      )}
    </div>
  );

  // return (
  //   <div className="mt-6">
  //     <div className="flex gap-4 mb-4 items-end">
  //       <div>
  //         <label className="block text-sm font-semibold text-gray-700">
  //           Month
  //         </label>
  //         <select
  //           value={month}
  //           onChange={(e) => setMonth(e.target.value)}
  //           className="p-2 border rounded-md"
  //         >
  //           {Array.from({ length: 12 }, (_, i) => {
  //             const val = (i + 1).toString().padStart(2, "0");
  //             return (
  //               <option key={val} value={val}>
  //                 {val}
  //               </option>
  //             );
  //           })}
  //         </select>
  //       </div>

  //       <div>
  //         <label className="block text-sm font-semibold text-gray-700">
  //           Year
  //         </label>
  //         <input
  //           type="text"
  //           value={year}
  //           onChange={(e) => setYear(e.target.value)}
  //           className="p-2 border rounded-md"
  //         />
  //       </div>
  //     </div>

  //     {loading ? (
  //       <p className="text-center">Loading summary...</p>
  //     ) : (
  //       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
  //         <Card
  //           label="Total Salary"
  //           value={summary.totalSalary}
  //           color="emerald"
  //         />
  //         <Card
  //           label="Allowances"
  //           value={summary.totalAllowances}
  //           color="amber"
  //         />
  //         <Card
  //           label="Deductions"
  //           value={summary.totalDeductions}
  //           color="red"
  //         />
  //         <Card label="Net Pay" value={summary.totalNetPay} color="green" />
  //       </div>
  //     )}
  //   </div>
  // );
}

function Card({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className={`bg-${color}-100 p-4 rounded-xl shadow`}>
      <h3 className={`font-bold text-${color}-700`}>{label}</h3>
      <p className={`text-xl font-semibold text-${color}-900`}>
        ₦{value.toLocaleString()}
      </p>
    </div>
  );
}
