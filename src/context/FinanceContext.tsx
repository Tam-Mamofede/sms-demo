// src/context/FinanceContext.tsx
import {
  createContext,
  ReactNode,
  useContext,
  useState,
  useEffect,
} from "react";
import { addDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase.config";
import { InvoiceType } from "../types/invoiceType";
import jsPDF from "jspdf";
import { useAlert } from "./AlertContext";

export interface IncomeEntryInput {
  amount: number;
  source: string;
  date: string;
  addedBy: string;
}

export interface IncomeEntry extends IncomeEntryInput {
  id: string;
}

// This is the shape for a new entry being submitted
export interface ExpenseEntryInput {
  amount: number;
  category: string;
  date: string;
  addedBy: string;
}

// This is the full shape of a stored entry (with Firestore ID)
export interface ExpenseEntry extends ExpenseEntryInput {
  id: string;
}

interface FinanceContextType {
  addIncome: (entry: IncomeEntryInput) => Promise<void>;
  addExpense: (entry: ExpenseEntryInput) => Promise<void>;
  incomeList: IncomeEntry[];
  expenseList: ExpenseEntry[];
  fetchIncome: () => Promise<void>;
  fetchExpenses: () => Promise<void>;
  handleCreateInvoice: (
    amount: number,
    termId: string,
    studentDocId: string
  ) => Promise<void>;
  generateInvoicePDF: (invoice: InvoiceType) => void;
  refreshFinance: () => Promise<void>;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

interface FinanceProviderProps {
  children: ReactNode;
}

const FinanceProvider = ({ children }: FinanceProviderProps) => {
  const [incomeList, setIncomeList] = useState<IncomeEntry[]>([]);
  const [expenseList, setExpenseList] = useState<ExpenseEntry[]>([]);
  const [updateFinance, setUpdateFinance] = useState(false);

  ////////////////////////////////////////////
  const refreshFinance = async () => {
    await Promise.all([fetchIncome(), fetchExpenses()]);
  };

  const generateInvoicePDF = (invoice: InvoiceType) => {
    const doc = new jsPDF();
    const marginLeft = 20;
    const lineSpacing = 8;

    // 🔹 Header
    doc.setFontSize(22);
    doc.setTextColor(33, 37, 41);
    doc.text(" XYZ International School", 105, 20, { align: "center" });

    doc.setFontSize(14);
    doc.text("INVOICE", 105, 30, { align: "center" });

    // 🔹 Meta Info
    doc.setFontSize(11);
    doc.setTextColor(50);
    doc.text(`Date Issued: ${invoice.createdAt}`, marginLeft, 45);
    doc.text(`Term: ${invoice.term}`, marginLeft, 45 + lineSpacing);
    doc.text(`Due Date: ${invoice.dueDate}`, marginLeft, 45 + lineSpacing * 2);
    doc.text(
      `Status: ${invoice.status.toUpperCase()}`,
      marginLeft,
      45 + lineSpacing * 3
    );

    // 🔹 Items Table Header
    let y = 90;
    doc.setFillColor("rgb(240, 240, 240)");
    doc.rect(marginLeft, y - 10, 170, 10, "F");
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text("Description", marginLeft + 5, y - 2);
    doc.text("Amount (N)", 170, y - 2, { align: "right" });

    // 🔹 Items Table Rows
    doc.setFontSize(11);
    invoice.items.forEach((item, index) => {
      y += 10;
      doc.text(`${index + 1}. ${item.description}`, marginLeft + 5, y);
      doc.text(`N${item.amount}`, 170, y, { align: "right" });
    });

    y += 20;

    // 🔹 Totals
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text("Total Due:", marginLeft + 5, y);
    doc.text(`N${invoice.totalDue}`, 170, y, { align: "right" });

    y += lineSpacing;
    doc.text("Amount Paid:", marginLeft + 5, y);
    doc.text(`N${invoice.amountPaid}`, 170, y, { align: "right" });

    y += lineSpacing;
    doc.text("Balance:", marginLeft + 5, y);
    doc.text(`N${invoice.balance}`, 170, y, { align: "right" });

    // 🔹 Footer
    y += 30;
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("Thank you for choosing XYZ International School!", 105, y, {
      align: "center",
    });

    doc.save(`Invoice-${invoice.term}.pdf`);
  };

  ///////////////////////////

  const { showAlert } = useAlert();
  //////////////////////////////////////////////
  const handleCreateInvoice = async (
    amount: number,
    termId: string,
    studentDocId: string
  ) => {
    try {
      const invoiceData = {
        createdAt: new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        totalDue: amount,
        amountPaid: 0,
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

      await addDoc(
        collection(db, "students", studentDocId, "invoices"),
        invoiceData
      );
      showAlert("Invoice created successfully", "success");
    } catch (error) {
      console.error("Error creating invoice:", error);
      showAlert("Failed to create invoice", "error");
    }
  };
  ///////////////////////////////////
  const addIncome = async (entry: IncomeEntryInput) => {
    setUpdateFinance(true);
    try {
      await addDoc(collection(db, "finance", "income", "records"), {
        ...entry,
      });
    } catch (error) {
      console.error("Error adding income entry: ", error);
    } finally {
      setUpdateFinance(false);
    }
  };
  ///////////////////////////////
  const addExpense = async (entry: ExpenseEntryInput) => {
    setUpdateFinance(true);
    try {
      await addDoc(collection(db, "finance", "expenses", "records"), {
        ...entry,
      });
    } catch (error) {
      console.error("Error adding income entry: ", error);
    } finally {
      setUpdateFinance(false);
    }
  };
  /////////////////////////////////////////////////
  const fetchIncome = async () => {
    const snap = await getDocs(collection(db, "finance", "income", "records"));
    const data = snap.docs.map((doc) => ({
      ...(doc.data() as IncomeEntry),
      id: doc.id,
    }));
    setIncomeList(data);
  };
  /////////////////////////////////////////////////
  const fetchExpenses = async () => {
    const snap = await getDocs(
      collection(db, "finance", "expenses", "records")
    );
    const data = snap.docs.map((doc) => ({
      ...(doc.data() as ExpenseEntry),
      id: doc.id,
    }));
    setExpenseList(data);
  };
  ////////////////////////////////////////////////////
  useEffect(() => {
    fetchIncome();
    fetchExpenses();
  }, [updateFinance]);

  return (
    <FinanceContext.Provider
      value={{
        addIncome,
        addExpense,
        incomeList,
        expenseList,
        fetchIncome,
        fetchExpenses,
        handleCreateInvoice,
        generateInvoicePDF,
        refreshFinance,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

const useFinance = (): FinanceContextType => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error("useFinance must be used within a FinanceProvider");
  }
  return context;
};

export { useFinance, FinanceProvider };
