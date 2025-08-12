import { Timestamp } from "firebase/firestore";

export type PayrollRecord = {
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
