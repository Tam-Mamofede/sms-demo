import { useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase.config";
import { StudentType } from "../../src/types/StudentType";
import { useAlert } from "../../src/context/AlertContext";

interface RecordPaymentProps {
  studentDocId: string;
  termId: string;
  staffId: string;
  studentData: StudentType;
}

const RecordPayment: React.FC<RecordPaymentProps> = ({
  studentDocId,
  termId,
  staffId,
  studentData,
}) => {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("cash");

  const { showAlert } = useAlert();

  const handleRecordPayment = async () => {
    const amountNum = Number(amount);
    if (!amount || isNaN(amountNum) || amountNum <= 0)
      return showAlert("Invalid amount", "warning");

    if (!studentDocId) {
      showAlert("Student record not found", "warning");
      return;
    }

    const feeRef = doc(db, "students", studentDocId, "fees", termId);
    const snap = await getDoc(feeRef);

    if (!snap.exists()) {
      showAlert("No tuition record found", "warning");
      return;
    }

    const data = snap.data();
    const newPaid = data.amountPaid + amountNum;
    const newBalance = data.totalDue - newPaid;

    const updatedHistory = [
      ...data.paymentHistory,
      {
        amount: amountNum,
        method,
        date: new Date().toLocaleString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }),

        receivedBy: staffId,
      },
    ];

    await updateDoc(feeRef, {
      amountPaid: newPaid,
      balance: newBalance,
      status: newBalance <= 0 ? "paid" : "partial",
      paymentHistory: updatedHistory,
    });

    showAlert("Payment recorded successfully", "success");
    setAmount("");
  };

  return (
    <div className="bg-[#FDE68A] border border-yellow-300 rounded-2xl p-6 shadow space-y-5">
      <h2 className="text-xl font-bold text-[#78350F]">💳 Record Payment</h2>

      {/* Student Info */}
      {studentData ? (
        <div className="bg-white p-4 rounded-md border border-gray-200 shadow-sm space-y-1 text-sm text-gray-700">
          <p>
            <span className="font-semibold text-[#065F46]">👤 Name:</span>{" "}
            {studentData.firstName} {studentData.lastName}
          </p>
          <p>
            <span className="font-semibold text-[#065F46]">🏫 Class:</span>{" "}
            {studentData.class}
          </p>
          <p>
            <span className="font-semibold text-[#065F46]">👪 Guardian:</span>{" "}
            {studentData.guardianName} ({studentData.guardianPhone})
          </p>
        </div>
      ) : (
        <p className="italic text-gray-500">No student info loaded yet.</p>
      )}

      {/* Payment Input */}
      <div className="space-y-3">
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount paid (₦)"
          className="w-full p-3 rounded-md border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
          required
        />

        <select
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          className="w-full p-3 rounded-md border border-gray-300 bg-white text-gray-800"
        >
          <option value="cash">Cash</option>
          <option value="transfer">Transfer</option>
          <option value="POS">POS</option>
        </select>
      </div>

      {/* Submit Button */}
      <button
        onClick={handleRecordPayment}
        disabled={!amount}
        className={`w-full py-3 rounded-lg font-semibold transition ${
          !amount
            ? "bg-gray-300 text-white cursor-not-allowed"
            : "bg-[#10B981] hover:bg-emerald-700 text-white"
        }`}
      >
        💰 Record Payment
      </button>
    </div>
  );
};

export default RecordPayment;
