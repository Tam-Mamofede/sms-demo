import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { useStudent } from "../../src/context/StudentContext";
import { useFinance } from "../../src/context/FinanceContext";
import { db } from "../../firebase.config";
// src/types/InvoiceType.ts
export interface StudentInvoiceType {
  id: string;
  createdAt: string;
  term: string;
  dueDate: string;
  status: "paid" | "partial" | "unpaid";
  totalDue: string;
  amountPaid: string;
  balance: string;
  items: {
    description: string;
    amount: string;
  }[];
}

export default function StudentInvoices() {
  const [invoices, setInvoices] = useState<StudentInvoiceType[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const { currentStudent } = useStudent();
  const { generateInvoicePDF } = useFinance();

  const totalPages = Math.ceil(invoices.length / itemsPerPage);
  const paginatedInvoices = invoices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    const fetchInvoices = async () => {
      if (!currentStudent?.id) return;
      try {
        const invoiceRef = collection(
          db,
          "students",
          currentStudent.id,
          "invoices"
        );
        const snap = await getDocs(invoiceRef);
        const data = snap.docs.map(
          (doc): StudentInvoiceType => ({
            id: doc.id,
            ...(doc.data() as Omit<StudentInvoiceType, "id">),
          })
        );
        setInvoices(data);
      } catch (err) {
        console.error("Failed to fetch invoices:", err);
      }
    };

    fetchInvoices();
  }, [currentStudent?.id]);

  return (
    <div>
      {invoices.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-[#065F46]">
            💳 Invoices
          </h2>

          <ul className="space-y-4">
            {paginatedInvoices.map((invoice) => (
              <li
                key={invoice.id}
                className="border p-4 rounded-lg shadow-sm flex flex-col md:flex-row justify-between md:items-center bg-[#FFF7ED]"
              >
                <div className="text-sm space-y-1 text-[#78350F]">
                  <p>
                    <strong>Term:</strong> {invoice.term}
                  </p>
                  <p>
                    <strong>Date Issued:</strong> {invoice.createdAt}
                  </p>
                  <p>
                    <strong>Status:</strong> {invoice.status}
                  </p>
                  <p>
                    <strong>Balance:</strong> ₦{invoice.balance}
                  </p>
                </div>
                <button
                  className="mt-4 md:mt-0 bg-[#3B82F6] text-white px-4 py-2 rounded-lg"
                  onClick={() => generateInvoicePDF(invoice)}
                >
                  Download
                </button>
              </li>
            ))}
          </ul>

          {totalPages > 1 && (
            <div className="flex justify-center mt-6 space-x-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-[#10B981] text-white rounded disabled:opacity-50"
              >
                Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-4 py-2 rounded ${
                    currentPage === i + 1
                      ? "bg-[#F59E0B] text-white"
                      : "bg-white text-[#78350F] border"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-[#10B981] text-white rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
