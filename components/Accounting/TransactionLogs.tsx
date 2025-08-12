import { useMemo, useState } from "react";
import { useFinance } from "../../src/context/FinanceContext";
import { useAuth } from "../../src/context/AuthContext";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "../../firebase.config";
import { useAlert } from "../../src/context/AlertContext";

type IncomeTransaction = {
  id: string;
  type: "income";
  amount: number;
  source: string;
  date: string;
  addedBy: string;
};

type ExpenseTransaction = {
  id: string;
  type: "expense";
  amount: number;
  category: string;
  date: string;
  addedBy: string;
};

type Transaction = IncomeTransaction | ExpenseTransaction;

export default function TransactionLog() {
  const { incomeList, expenseList, refreshFinance } = useFinance();
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth()
  ); // 0-indexed
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );
  const [openDates, setOpenDates] = useState<Record<string, boolean>>({});

  const { user } = useAuth();
  const { showAlert } = useAlert();

  const handleDelete = async (tx: Transaction) => {
    if (!user || user.role !== "Proprietor") return;

    const collectionPath =
      tx.type === "income"
        ? "finance/income/records"
        : "finance/expenses/records";

    try {
      if (confirm("Are you sure you want to delete this transaction?")) {
        await deleteDoc(doc(db, collectionPath, tx.id));
        await refreshFinance();
        showAlert("Transaction deleted successfully", "success");
      }
    } catch (err) {
      console.error("Failed to delete transaction:", err);
      showAlert("Error deleting transaction", "error");
    }
  };

  const filteredIncome = useMemo(
    () =>
      incomeList.filter((i) => {
        const date = new Date(i.date);
        return (
          date.getFullYear() === selectedYear &&
          date.getMonth() === selectedMonth
        );
      }),
    [incomeList, selectedMonth, selectedYear]
  );

  const filteredExpense = useMemo(
    () =>
      expenseList.filter((e) => {
        const date = new Date(e.date);
        return (
          date.getFullYear() === selectedYear &&
          date.getMonth() === selectedMonth
        );
      }),
    [expenseList, selectedMonth, selectedYear]
  );

  const totalIncome = filteredIncome.reduce((sum, i) => sum + i.amount, 0);
  const totalExpense = filteredExpense.reduce((sum, e) => sum + e.amount, 0);

  const combinedTransactions: Transaction[] = useMemo(() => {
    const incomeLogs = incomeList.map((entry) => ({
      ...entry,
      type: "income" as const,
    }));
    const expenseLogs = expenseList.map((entry) => ({
      ...entry,
      type: "expense" as const,
    }));

    return [...incomeLogs, ...expenseLogs].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [incomeList, expenseList]);

  // 🔍 Filtered by selected month and year
  const filteredTransactions = useMemo(() => {
    return combinedTransactions.filter((tx) => {
      const txDate = new Date(tx.date);
      return (
        txDate.getFullYear() === selectedYear &&
        txDate.getMonth() === selectedMonth
      );
    });
  }, [combinedTransactions, selectedMonth, selectedYear]);

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

  const groupedByDate = useMemo(() => {
    const map: Record<string, Transaction[]> = {};

    filteredTransactions.forEach((tx) => {
      const dateKey = new Date(tx.date).toLocaleDateString("en-GB");
      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push(tx);
    });

    return map;
  }, [filteredTransactions]);

  return (
    <div className="bg-[#FFF7ED] p-6 rounded-2xl border border-yellow-200 shadow space-y-6">
      <h2 className="text-2xl font-bold text-[#065F46]">
        💼 Transaction History
      </h2>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex flex-col">
          <label className="text-sm text-[#78350F] font-medium">Month</label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="p-2 rounded-md border border-gray-300 bg-white text-gray-800 shadow-sm"
          >
            {monthOptions.map((month, idx) => (
              <option key={month} value={idx}>
                {month}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-sm text-[#78350F] font-medium">Year</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="p-2 rounded-md border border-gray-300 bg-white text-gray-800 shadow-sm"
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
      </div>

      {/* Totals Summary */}
      <div className="sticky top-0 z-10 bg-[#FFF7ED] py-3 border-b border-yellow-200 flex justify-between text-sm text-[#065F46] font-medium">
        <p>💰 Income: ₦{totalIncome.toLocaleString()}</p>
        <p>💸 Expense: ₦{totalExpense.toLocaleString()}</p>
        <p className="font-semibold text-[#78350F]">
          Balance: ₦{(totalIncome - totalExpense).toLocaleString()}
        </p>
      </div>

      {/* No Transactions */}
      {filteredTransactions.length === 0 ? (
        <p className="text-sm italic text-gray-500">
          No transactions recorded yet.
        </p>
      ) : (
        <div className="space-y-4 max-h-[500px] overflow-y-auto">
          {Object.entries(groupedByDate).map(([date, txs]) => {
            const dayIncome = txs
              .filter((t) => t.type === "income")
              .reduce((sum, t) => sum + t.amount, 0);
            const dayExpense = txs
              .filter((t) => t.type === "expense")
              .reduce((sum, t) => sum + t.amount, 0);

            return (
              <div
                key={date}
                className="border border-gray-200 rounded-xl shadow-sm bg-white"
              >
                {/* Date Header */}
                <button
                  onClick={() =>
                    setOpenDates((prev) => ({
                      ...prev,
                      [date]: !prev[date],
                    }))
                  }
                  className="w-full text-left p-3 bg-[#FDE68A] rounded-t-xl flex justify-between items-center hover:bg-yellow-100 transition"
                >
                  <span className="font-semibold text-[#78350F]">{date}</span>
                  <span className="text-sm text-gray-700">
                    +₦{dayIncome.toLocaleString()} | -₦
                    {dayExpense.toLocaleString()}
                  </span>
                </button>

                {/* Transactions */}
                {openDates[date] && (
                  <ul className="divide-y">
                    {txs.map((tx, i) => (
                      <li
                        key={i}
                        className="p-4 flex justify-between items-start gap-4"
                      >
                        <div className="text-sm text-gray-800 space-y-1">
                          <p>
                            <strong>
                              {tx.type === "income" ? "Income" : "Expense"}:
                            </strong>{" "}
                            ₦{tx.amount.toLocaleString()}
                          </p>
                          <p>
                            <strong>
                              {tx.type === "income" ? "Source" : "Category"}:
                            </strong>{" "}
                            {tx.type === "income" ? tx.source : tx.category}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(tx.date).toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })}
                          </p>
                        </div>

                        <div className="flex flex-col items-end space-y-2">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              tx.type === "income"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {tx.type.toUpperCase()}
                          </span>
                          {(user?.role === "Proprietor" ||
                            user?.role === "IT") && (
                            <button
                              onClick={() => handleDelete(tx)}
                              className="text-xs text-red-500 hover:underline"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  //   return (
  //     <div className="p-4 border rounded-xl bg-white shadow space-y-4">
  //       <h2 className="text-xl font-bold">💼 Transaction History</h2>

  //       {/* Filter UI */}
  //       <div className="flex gap-4 flex-wrap">
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

  //       <div className="sticky top-0 z-10 bg-white py-2 border-b flex justify-between text-sm text-gray-600">
  //         <p>Total Income: ₦{totalIncome.toLocaleString()}</p>
  //         <p>Total Expense: ₦{totalExpense.toLocaleString()}</p>
  //         <p className="font-semibold">
  //           Balance: ₦{(totalIncome - totalExpense).toLocaleString()}
  //         </p>
  //       </div>

  //       {filteredTransactions.length === 0 ? (
  //         <p className="text-sm italic text-gray-500">
  //           No transactions recorded yet.
  //         </p>
  //       ) : (
  //         <div className="space-y-4 max-h-[500px] overflow-y-auto">
  //           {Object.entries(groupedByDate).map(([date, txs]) => {
  //             const dayIncome = txs
  //               .filter((t) => t.type === "income")
  //               .reduce((sum, t) => sum + t.amount, 0);
  //             const dayExpense = txs
  //               .filter((t) => t.type === "expense")
  //               .reduce((sum, t) => sum + t.amount, 0);

  //             return (
  //               <div key={date} className="border rounded-md">
  //                 <button
  //                   onClick={() =>
  //                     setOpenDates((prev) => ({
  //                       ...prev,
  //                       [date]: !prev[date],
  //                     }))
  //                   }
  //                   className="hover:cursor-pointer w-full text-left p-2 bg-gray-100 flex justify-between items-center"
  //                 >
  //                   <span className="font-semibold">{date}</span>
  //                   <span className="text-sm text-gray-600">
  //                     Income: ₦{dayIncome.toLocaleString()} | Expense: ₦
  //                     {dayExpense.toLocaleString()}
  //                   </span>
  //                 </button>

  //                 {openDates[date] && (
  //                   <ul className="divide-y">
  //                     {txs.map((tx, i) => (
  //                       <li
  //                         key={i}
  //                         className="p-3 flex justify-between items-start"
  //                       >
  //                         <div>
  //                           <p>
  //                             <strong>
  //                               {tx.type === "income" ? "Income" : "Expense"}:
  //                             </strong>{" "}
  //                             ₦{tx.amount.toLocaleString()}
  //                           </p>
  //                           <p>
  //                             <strong>
  //                               {tx.type === "income" ? "Source" : "Category"}:
  //                             </strong>{" "}
  //                             {tx.type === "income" ? tx.source : tx.category}
  //                           </p>
  //                           <p className="text-sm text-gray-500">
  //                             {new Date(tx.date).toLocaleTimeString("en-US", {
  //                               hour: "2-digit",
  //                               minute: "2-digit",
  //                               hour12: true,
  //                             })}
  //                           </p>
  //                         </div>
  //                         <div className="flex flex-col items-end gap-2">
  //                           <span
  //                             className={`px-3 py-1 text-xs rounded-full ${
  //                               tx.type === "income"
  //                                 ? "bg-green-100 text-green-700"
  //                                 : "bg-red-100 text-red-700"
  //                             }`}
  //                           >
  //                             {tx.type.toUpperCase()}
  //                           </span>
  //                           {(user?.role === "Proprietor" ||
  //                             user?.role === "IT") && (
  //                             <button
  //                               onClick={() => handleDelete(tx)}
  //                               className="text-xs text-red-500 hover:underline"
  //                             >
  //                               Delete
  //                             </button>
  //                           )}
  //                         </div>
  //                       </li>
  //                     ))}
  //                   </ul>
  //                 )}
  //               </div>
  //             );
  //           })}
  //         </div>
  //       )}
  //     </div>
  //   );
}
