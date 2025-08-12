// 🔧 File: components/Students/StudentInvoiceList.tsx
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase.config";

interface Invoice {
  createdAt: string;
  term: string;
  dueDate: string;
  status: string;
  totalDue: string;
  amountPaid: string;
  balance: string;
  items: { description: string; amount: string }[];
}

interface StudentInvoiceListProps {
  studentDocId: string;
}

const StudentInvoiceList: React.FC<StudentInvoiceListProps> = ({
  studentDocId,
}) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const invoiceRef = collection(db, "students", studentDocId, "invoices");
        const snapshot = await getDocs(invoiceRef);
        const invoiceList = snapshot.docs.map((doc) => doc.data() as Invoice);
        setInvoices(invoiceList);
      } catch (error) {
        console.error("Error fetching invoices:", error);
      }
    };

    if (studentDocId) fetchInvoices();
  }, [studentDocId]);

  if (!invoices.length) {
    return (
      <p className="text-gray-600 italic">
        No invoices found for this student.
      </p>
    );
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Invoice History</h2>
      <ul className="divide-y border rounded-md">
        {invoices.map((inv, index) => (
          <li key={index} className="px-4 py-2 space-y-1">
            <p>
              <strong>Term:</strong> {inv.term}
            </p>
            <p>
              <strong>Date Issued:</strong> {inv.createdAt}
            </p>
            <p>
              <strong>Due:</strong> ₦{inv.totalDue} — <strong>Paid:</strong> ₦
              {inv.amountPaid} — <strong>Balance:</strong> ₦{inv.balance}
            </p>
            <p>
              <strong>Status:</strong>{" "}
              <span
                className={`px-2 py-1 rounded text-white text-xs font-bold ${
                  inv.status === "paid"
                    ? "bg-green-500"
                    : inv.status === "partial"
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
              >
                {inv.status.toUpperCase()}
              </span>
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StudentInvoiceList;
