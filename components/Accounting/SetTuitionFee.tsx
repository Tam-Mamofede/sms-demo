import { useState } from "react";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase.config";
import { useFinance } from "../../src/context/FinanceContext";
import { useAlert } from "../../src/context/AlertContext";
interface SetTuitionFeeProps {
  studentDocId: string;
  termId: string; // e.g. "2024-Term-1"
}

const SetTuitionFee: React.FC<SetTuitionFeeProps> = ({
  studentDocId,
  termId,
}) => {
  const [amount, setAmount] = useState("");

  const { handleCreateInvoice, generateInvoicePDF } = useFinance();
  const { showAlert } = useAlert();

  const handleSetFee = async () => {
    if (!amount || isNaN(Number(amount)))
      return showAlert("Enter a valid amount", "warning");

    const feeRef = doc(db, "students", studentDocId, "fees", termId);
    await setDoc(feeRef, {
      term: termId,
      totalDue: Number(amount),
      amountPaid: 0,
      balance: Number(amount),
      status: "unpaid",
      paymentHistory: [],
      dueDate: serverTimestamp(),
    });

    showAlert("Tuition fee set successfully", "success");
    setAmount("");
  };

  return (
    <div className="bg-[#FDE68A] border border-yellow-300 rounded-2xl p-6 shadow space-y-4">
      <h2 className="text-xl font-bold text-[#78350F]">💵 Set Tuition Fee</h2>

      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Enter total tuition fee"
        className="w-full p-3 rounded-md border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
        required
      />

      <button
        onClick={async () => {
          const invoiceData = {
            createdAt: new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            }),
            totalDue: amount,
            amountPaid: "0",
            balance: amount,
            status: "unpaid",
            term: termId,
            dueDate: new Date().toLocaleDateString(),
            items: [
              {
                description: "Tuition",
                amount,
              },
            ],
          };

          await handleCreateInvoice(Number(amount), termId, studentDocId);
          await handleSetFee();
          generateInvoicePDF(invoiceData);
        }}
        disabled={!amount}
        className={`w-full py-3 rounded-lg font-semibold transition ${
          !amount
            ? "bg-gray-300 text-white cursor-not-allowed"
            : "bg-[#10B981] text-white hover:bg-emerald-700"
        }`}
      >
        📌 Set Fee
      </button>
    </div>
  );
};

export default SetTuitionFee;
