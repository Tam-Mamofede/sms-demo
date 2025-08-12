// import  { useMemo, useState } from "react";
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
//   CartesianGrid,
// } from "recharts";
// import { useFinance } from "../../src/context/FinanceContext";

// export default function FinanceChart() {
//   const { incomeList, expenseList } = useFinance();

//   const currentDate = new Date();
//   const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
//   const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

//   const monthOptions = [
//     "January",
//     "February",
//     "March",
//     "April",
//     "May",
//     "June",
//     "July",
//     "August",
//     "September",
//     "October",
//     "November",
//     "December",
//   ];

//   // 📊 Filter and format chart data
//   const chartData = useMemo(() => {
//     const map: Record<
//       string,
//       { date: string; income: number; expense: number }
//     > = {};

//     const filterByDate = (entryDate: string) => {
//       const dateObj = new Date(entryDate);
//       return (
//         dateObj.getFullYear() === selectedYear &&
//         dateObj.getMonth() === selectedMonth
//       );
//     };

//     incomeList
//       .filter((i) => filterByDate(i.date))
//       .forEach((entry) => {
//         const key = new Date(entry.date).toLocaleDateString();
//         if (!map[key]) map[key] = { date: key, income: 0, expense: 0 };
//         map[key].income += entry.amount;
//       });

//     expenseList
//       .filter((e) => filterByDate(e.date))
//       .forEach((entry) => {
//         const key = new Date(entry.date).toLocaleDateString();
//         if (!map[key]) map[key] = { date: key, income: 0, expense: 0 };
//         map[key].expense += entry.amount;
//       });

//     return Object.values(map).sort(
//       (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
//     );
//   }, [incomeList, expenseList, selectedMonth, selectedYear]);

//   return (
//     <div className="p-4 border rounded-xl bg-white shadow space-y-4">
//       <h2 className="text-xl font-bold">📈 Income vs Expense Chart</h2>

//       {/* Filters */}
//       <div className="flex gap-4">
//         <select
//           value={selectedMonth}
//           onChange={(e) => setSelectedMonth(Number(e.target.value))}
//           className="border rounded p-1"
//         >
//           {monthOptions.map((month, idx) => (
//             <option key={month} value={idx}>
//               {month}
//             </option>
//           ))}
//         </select>

//         <select
//           value={selectedYear}
//           onChange={(e) => setSelectedYear(Number(e.target.value))}
//           className="border rounded p-1"
//         >
//           {Array.from({ length: 5 }, (_, i) => {
//             const year = new Date().getFullYear() - i;
//             return (
//               <option key={year} value={year}>
//                 {year}
//               </option>
//             );
//           })}
//         </select>
//       </div>

//       {/* Chart */}
//       <ResponsiveContainer width="100%" height={300}>
//         <BarChart data={chartData}>
//           <CartesianGrid strokeDasharray="3 3" />
//           <XAxis dataKey="date" />
//           <YAxis tickFormatter={(v) => `₦${v.toLocaleString()}`} />
//           <Tooltip formatter={(v: number) => `₦${v.toLocaleString()}`} />
//           <Legend />
//           <Bar dataKey="income" fill="#22c55e" name="Income" />
//           <Bar dataKey="expense" fill="#ef4444" name="Expense" />
//         </BarChart>
//       </ResponsiveContainer>
//     </div>
//   );
// }

import { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useFinance } from "../../src/context/FinanceContext";

export default function FinanceChart() {
  const { incomeList, expenseList } = useFinance();

  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [viewMode, setViewMode] = useState<"daily" | "monthly">("daily");

  const monthOptions = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const chartData = useMemo(() => {
    const incomeFiltered = incomeList.filter((entry) => {
      const date = new Date(entry.date);
      return (
        date.getFullYear() === selectedYear && date.getMonth() === selectedMonth
      );
    });

    const expenseFiltered = expenseList.filter((entry) => {
      const date = new Date(entry.date);
      return (
        date.getFullYear() === selectedYear && date.getMonth() === selectedMonth
      );
    });

    if (viewMode === "monthly") {
      const incomeTotal = incomeFiltered.reduce((sum, i) => sum + i.amount, 0);
      const expenseTotal = expenseFiltered.reduce(
        (sum, e) => sum + e.amount,
        0
      );

      return [
        {
          date: `${monthOptions[selectedMonth]} ${selectedYear}`,
          income: incomeTotal,
          expense: expenseTotal,
        },
      ];
    }

    // daily view
    const map: Record<
      string,
      { date: string; income: number; expense: number }
    > = {};

    incomeFiltered.forEach((entry) => {
      const key = new Date(entry.date).toLocaleDateString();
      if (!map[key]) map[key] = { date: key, income: 0, expense: 0 };
      map[key].income += entry.amount;
    });

    expenseFiltered.forEach((entry) => {
      const key = new Date(entry.date).toLocaleDateString();
      if (!map[key]) map[key] = { date: key, income: 0, expense: 0 };
      map[key].expense += entry.amount;
    });

    return Object.values(map).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [incomeList, expenseList, selectedMonth, selectedYear, viewMode]);

  return (
    <div className="bg-[#FFF7ED] p-6 rounded-2xl border border-yellow-200 shadow space-y-6">
      <h2 className="text-2xl font-bold text-[#065F46]">
        Income vs Expense Chart
      </h2>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex flex-col">
          <label className="text-sm font-medium text-[#78350F]">Month</label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="border border-gray-300 bg-white text-gray-800 rounded-md p-2 shadow-sm"
          >
            {monthOptions.map((month, idx) => (
              <option key={month} value={idx}>
                {month}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-[#78350F]">Year</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="border border-gray-300 bg-white text-gray-800 rounded-md p-2 shadow-sm"
          >
            {Array.from({ length: 5 }, (_, i) => {
              const year = new Date().getFullYear() - i;
              return (
                <option key={year} value={year}>
                  {year}
                </option>
              );
            })}
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-[#78350F]">View</label>
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value as "daily" | "monthly")}
            className="border border-gray-300 bg-white text-gray-800 rounded-md p-2 shadow-sm"
          >
            <option value="daily">Daily</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white p-4 rounded-xl shadow-inner border border-gray-100">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis tickFormatter={(v) => `₦${v.toLocaleString()}`} />
            <Tooltip formatter={(v: number) => `₦${v.toLocaleString()}`} />
            <Legend />
            <Bar dataKey="income" fill="#10B981" name="Income" />
            <Bar dataKey="expense" fill="#F59E0B" name="Expense" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  // return (
  //   <div className="p-4 border rounded-xl bg-white shadow space-y-4">
  //     <h2 className="text-xl font-bold">📈 Income vs Expense Chart</h2>

  //     {/* Filters */}
  //     <div className="flex flex-wrap gap-4 items-center">
  //       <select
  //         value={selectedMonth}
  //         onChange={(e) => setSelectedMonth(Number(e.target.value))}
  //         className="border rounded p-1"
  //       >
  //         {monthOptions.map((month, idx) => (
  //           <option key={month} value={idx}>
  //             {month}
  //           </option>
  //         ))}
  //       </select>

  //       <select
  //         value={selectedYear}
  //         onChange={(e) => setSelectedYear(Number(e.target.value))}
  //         className="border rounded p-1"
  //       >
  //         {Array.from({ length: 5 }, (_, i) => {
  //           const year = new Date().getFullYear() - i;
  //           return (
  //             <option key={year} value={year}>
  //               {year}
  //             </option>
  //           );
  //         })}
  //       </select>

  //       {/* Toggle View Mode */}
  //       <div className="flex items-center gap-2">
  //         <label className="text-sm">View:</label>
  //         <select
  //           value={viewMode}
  //           onChange={(e) => setViewMode(e.target.value as "daily" | "monthly")}
  //           className="border rounded p-1"
  //         >
  //           <option value="daily">Daily</option>
  //           <option value="monthly">Monthly</option>
  //         </select>
  //       </div>
  //     </div>

  //     {/* Chart */}
  //     <ResponsiveContainer width="100%" height={300}>
  //       <BarChart data={chartData}>
  //         <CartesianGrid strokeDasharray="3 3" />
  //         <XAxis dataKey="date" />
  //         <YAxis tickFormatter={(v) => `₦${v.toLocaleString()}`} />
  //         <Tooltip formatter={(v: number) => `₦${v.toLocaleString()}`} />
  //         <Legend />
  //         <Bar dataKey="income" fill="#22c55e" name="Income" />
  //         <Bar dataKey="expense" fill="#ef4444" name="Expense" />
  //       </BarChart>
  //     </ResponsiveContainer>
  //   </div>
  // );
}
