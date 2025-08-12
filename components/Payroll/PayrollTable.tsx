// components/Admin/PayrollTable.tsx

import { usePayroll } from "../../src/context/PayrollContext";
import PayslipGenerator from "./PayslipGenerator"; // adjust import path as needed
import Loader from "../Loader";
import { useState } from "react";

export default function PayrollTable({
  selectedMonth,
  selectedYear,
}: {
  selectedMonth: string;
  selectedYear: string;
}) {
  const [showPayslip, setShowPayslip] = useState(false);

  const { payroll, markAsPaid, loading } = usePayroll();

  const handleMarkAsPaid = async (staffId: string) => {
    await markAsPaid(staffId, selectedMonth, selectedYear);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full w-full">
        <Loader />
      </div>
    );
  }

  if (payroll.length === 0) {
    return <p className="text-center mt-4">No payroll data for this period.</p>;
  }

  return (
    <div className="overflow-x-auto mt-8 rounded-xl shadow-lg bg-white border border-amber-100">
      <table className="min-w-full text-sm text-left">
        <thead className="bg-[#FDE68A] text-[#78350F] uppercase text-xs tracking-wider">
          <tr>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Role</th>
            <th className="px-4 py-3">Salary</th>
            <th className="px-4 py-3">Allowances</th>
            <th className="px-4 py-3">Bonuses</th>
            <th className="px-4 py-3">Deductions</th>
            <th className="px-4 py-3">Net Pay</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>

        <tbody className="bg-white divide-y divide-gray-200">
          {payroll.map((record) => (
            <tr key={record.staffId} className="hover:bg-[#FFFBEB] transition">
              <td className="px-4 py-3">{record.name}</td>
              <td className="px-4 py-3">{record.role}</td>
              <td className="px-4 py-3 text-gray-800">
                ₦{record.baseSalary.toLocaleString()}
              </td>
              <td className="px-4 py-3 text-gray-800">
                ₦{record.allowances.toLocaleString()}
              </td>
              <td className="px-4 py-3 text-gray-800">
                ₦{record.bonuses.toLocaleString()}
              </td>
              <td className="px-4 py-3 text-gray-800">
                ₦{record.deductions.toLocaleString()}
              </td>
              <td className="px-4 py-3 font-bold text-emerald-700">
                ₦{record.netPay.toLocaleString()}
              </td>
              <td className="px-4 py-3">
                {record.paid ? (
                  <span className="bg-green-100 text-green-700 font-medium px-3 py-1 rounded-full text-xs">
                    Paid
                  </span>
                ) : (
                  <span className="bg-red-100 text-red-600 font-medium px-3 py-1 rounded-full text-xs">
                    Pending
                  </span>
                )}
              </td>
              <td className="px-4 py-3 flex flex-col md:flex-row gap-2">
                {!record.paid && (
                  <button
                    onClick={() => handleMarkAsPaid(record.staffId)}
                    className="bg-emerald-600 text-white px-3 py-1 rounded hover:bg-emerald-700 transition"
                  >
                    ✅ Mark as Paid
                  </button>
                )}
                <button
                  onClick={() => setShowPayslip(!showPayslip)}
                  className="bg-[#065F46] text-white px-3 py-1 rounded hover:bg-[#064e3b] transition max-h-fit"
                >
                  🧾 Show Payslip
                </button>
                {showPayslip && <PayslipGenerator record={record} />}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // return (
  //   <div className="overflow-x-auto mt-6">
  //     <table className="w-full table-auto border border-gray-300 text-sm">
  //       <thead className="bg-gray-100">
  //         <tr>
  //           <th className="p-2 border">Name</th>
  //           <th className="p-2 border">Role</th>
  //           <th className="p-2 border">Salary</th>
  //           <th className="p-2 border">Allowances</th>
  //           <th className="p-2 border">Bonuses</th>
  //           <th className="p-2 border">Deductions</th>
  //           <th className="p-2 border">Net Pay</th>
  //           <th className="p-2 border">Status</th>
  //           <th className="p-2 border">Actions</th>
  //         </tr>
  //       </thead>
  //       <tbody>
  //         {payroll.map((record) => (
  //           <tr key={record.staffId} className="text-center border-b">
  //             <td className="p-2 border">{record.name}</td>
  //             <td className="p-2 border">{record.role}</td>
  //             <td className="p-2 border">
  //               ₦{record.baseSalary.toLocaleString()}
  //             </td>
  //             <td className="p-2 border">
  //               ₦{record.allowances.toLocaleString()}
  //             </td>
  //             <td className="p-2 border">₦{record.bonuses.toLocaleString()}</td>
  //             <td className="p-2 border">
  //               ₦{record.deductions.toLocaleString()}
  //             </td>
  //             <td className="p-2 border font-bold text-emerald-700">
  //               ₦{record.netPay.toLocaleString()}
  //             </td>
  //             <td className="p-2 border">
  //               {record.paid ? (
  //                 <span className="text-green-700 font-semibold">Paid</span>
  //               ) : (
  //                 <span className="text-red-500 font-semibold">Pending</span>
  //               )}
  //             </td>
  //             <td className="p-2 border space-y-1">
  //               {!record.paid && (
  //                 <button
  //                   onClick={() => handleMarkAsPaid(record.staffId)}
  //                   className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1 rounded-md mb-1"
  //                 >
  //                   Mark as Paid
  //                 </button>
  //               )}
  //               <button
  //                 onClick={() => setShowPayslip(!showPayslip)}
  //                 className="bg-[#065F46] hover:bg-[#065F46] text-white px-3 py-1 rounded-md mb-1 mx-2"
  //               >
  //                 Show payslip
  //               </button>
  //               {showPayslip && <PayslipGenerator record={record} />}
  //             </td>
  //           </tr>
  //         ))}
  //       </tbody>
  //     </table>
  //   </div>
  // );
}
