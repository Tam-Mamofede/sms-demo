import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase.config";
import { jsPDF } from "jspdf";

import { FeeRecord, PaymentRecord } from "../../src/types//FeeType";

interface FeeSummaryProps {
  studentId: string;
  studentDocId: string;
  termId: string;
}

const FeeSummary: React.FC<FeeSummaryProps> = ({
  studentDocId,
  termId,
  studentId,
}) => {
  const [feeData, setFeeData] = useState<FeeRecord | null>(null);
  const fetchFeeData = async () => {
    const feeRef = doc(db, "students", studentDocId, "fees", termId);

    const snap = await getDoc(feeRef);
    if (snap.exists()) {
      setFeeData(snap.data() as FeeRecord);
    } else {
      setFeeData(null);
    }
  };

  useEffect(() => {
    fetchFeeData();
  }, [studentDocId, termId]);

  const generateReceipt = (payment: PaymentRecord) => {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(16);
    doc.text("Payment Receipt", 105, 20, { align: "center" });

    // Body content
    doc.setFontSize(12);
    doc.text(`Student ID: ${studentId}`, 20, 40);
    doc.text(`Term: ${termId}`, 20, 50);
    doc.text(`Amount: N${payment.amount}`, 20, 60);
    doc.text(`Method: ${payment.method}`, 20, 70);
    doc.text(`Date: ${payment.date}`, 20, 80);
    doc.text(`Received By: ${payment.receivedBy}`, 20, 90);

    // Save the file
    doc.save(`receipt-${studentId}-${termId}.pdf`);
  };

  if (!feeData)
    return (
      <>
        <button
          onClick={fetchFeeData}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Refresh records
        </button>
        <p>No fees recorded yet.</p>
      </>
    );

  const {
    totalDue,
    amountPaid,
    balance,
    status,
    paymentHistory = [],
  } = feeData;

  return (
    <div className="bg-[#FFF7ED] p-6 rounded-2xl border border-yellow-200 shadow-md space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[#065F46]">Tuition Summary</h2>
        <button
          onClick={fetchFeeData}
          className="bg-[#10B981] text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition"
        >
          Refresh
        </button>
      </div>

      {/* Tuition Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded-xl border shadow-sm">
        <div className="space-y-2 text-[#78350F]">
          <p>
            <strong>Total Due:</strong> ₦{totalDue}
          </p>
          <p>
            <strong>Amount Paid:</strong> ₦{amountPaid}
          </p>
          <p>
            <strong>Balance:</strong> ₦{balance}
          </p>
        </div>
        <div className="flex md:justify-end items-center">
          <span
            className={`px-4 py-2 rounded-xl font-semibold text-sm shadow-sm ${
              status === "paid"
                ? "bg-green-200 text-green-900"
                : status === "partial"
                ? "bg-yellow-200 text-yellow-900"
                : "bg-red-200 text-red-900"
            }`}
          >
            STATUS: {status.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Payment History */}
      <div>
        <h3 className="text-xl font-semibold text-[#065F46] mb-2">
          Payment History
        </h3>
        {paymentHistory.length === 0 ? (
          <p className="italic text-gray-500">No payments recorded yet.</p>
        ) : (
          <ul className="space-y-4">
            {paymentHistory.map((payment, index) => (
              <li
                key={index}
                className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm flex flex-col md:flex-row justify-between gap-4"
              >
                <div className="space-y-1 text-sm text-gray-700">
                  <p>
                    <strong>Amount:</strong> ₦{payment.amount}
                  </p>
                  <p>
                    <strong>Method:</strong> {payment.method}
                  </p>
                  <p>
                    <strong>Date:</strong>{" "}
                    {typeof payment.date === "string"
                      ? payment.date
                      : payment.date?.seconds
                      ? new Date(payment.date.seconds * 1000).toLocaleString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true,
                          }
                        )
                      : "N/A"}
                  </p>
                  <p>
                    <strong>Received By:</strong> {payment.receivedBy}
                  </p>
                </div>

                <div className="self-start md:self-center">
                  <button
                    onClick={() => generateReceipt(payment)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    🧾 Receipt
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default FeeSummary;
