import { createContext, useContext, useState, ReactNode } from "react";
import {
  collection,
  doc,
  getDocs,
  setDoc,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../firebase.config";

type PayrollRecord = {
  staffId: string;
  name: string;
  role: string;
  baseSalary: number;
  allowances: number;
  bonuses: number;
  deductions: number;
  netPay: number;
  paid: boolean;
  generatedAt: Timestamp;
  paidAt?: Timestamp;
};

type PayrollContextType = {
  payroll: PayrollRecord[];
  generatePayrollForMonth: (month: string, year: string) => Promise<void>;
  fetchPayrollForMonth: (month: string, year: string) => Promise<void>;
  markAsPaid: (staffId: string, month: string, year: string) => Promise<void>;
  loading: boolean;
};

const PayrollContext = createContext<PayrollContextType | null>(null);

function PayrollProvider({ children }: { children: ReactNode }) {
  const [payroll, setPayroll] = useState<PayrollRecord[]>([]);
  const [loading, setLoading] = useState(false);

  ////////////////////////////////////////
  const generatePayrollForMonth = async (month: string, year: string) => {
    setLoading(true);
    const staffRef = collection(db, "staff");
    const staffSnapshot = await getDocs(staffRef);

    for (const staffDoc of staffSnapshot.docs) {
      const staffData = staffDoc.data();
      const staffId = staffDoc.id;

      const baseSalary = staffData.baseSalary || 0;
      const allowances = staffData.allowances || 0;
      const bonuses = staffData.bonuses || 0;
      const deductions = staffData.deductions || 0;

      const netPay = baseSalary + allowances + bonuses - deductions;
      console.log(staffId);
      const payrollRef = doc(
        collection(db, "payroll", "months", `${year}_${month}`), // ✅
        staffId
      );

      const staffName = `${staffData.firstName} ${staffData.lastName}`;
      await setDoc(payrollRef, {
        staffId,
        name: staffName,
        role: staffData.role,
        baseSalary,
        allowances,
        bonuses,
        deductions,
        netPay,
        paid: false,
        generatedAt: Timestamp.now(),
      });
    }

    await fetchPayrollForMonth(month, year);
    setLoading(false);
  };

  ///////////////////////////////////////////////////////

  const fetchPayrollForMonth = async (month: string, year: string) => {
    setLoading(true);
    const payrollRef = collection(db, "payroll", "months", `${year}_${month}`);
    const snapshot = await getDocs(payrollRef);
    const data = snapshot.docs.map((doc) => doc.data() as PayrollRecord);
    setPayroll(data);
    setLoading(false);
  };

  //////////////////////////////////////////////////

  const markAsPaid = async (staffId: string, month: string, year: string) => {
    const payrollRef = doc(
      collection(db, "payroll", "months", `${year}_${month}`),
      staffId
    );
    await updateDoc(payrollRef, {
      paid: true,
      paidAt: Timestamp.now(),
    });
    await fetchPayrollForMonth(month, year);
  };

  /////////////////////////////////////////////////////////

  return (
    <PayrollContext.Provider
      value={{
        payroll,
        generatePayrollForMonth,
        fetchPayrollForMonth,
        markAsPaid,
        loading,
      }}
    >
      {children}
    </PayrollContext.Provider>
  );
}

const usePayroll = () => {
  const context = useContext(PayrollContext);
  if (!context)
    throw new Error("usePayroll must be used within PayrollProvider");
  return context;
};

export { PayrollProvider, usePayroll };
