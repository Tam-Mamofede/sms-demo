import AddExpense from "./AddExpense";
import AddIncome from "./AddIncome";
import TransactionLog from "./TransactionLogs";
import FinanceChart from "./FinanceChart";

export default function FinanceDashboard() {
  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold text-center text-[#065F46]">
        School Finance Dashboard
      </h1>

      {/* Income and Expense Forms */}
      <div className="grid md:grid-cols-2 gap-6">
        <AddIncome />
        <AddExpense />
      </div>

      {/* Chart */}
      <FinanceChart />

      {/* Transaction Log */}
      <TransactionLog />
    </div>
  );
}
