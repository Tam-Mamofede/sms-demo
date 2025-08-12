export interface PaymentRecord {
  amount: number;
  method: "cash" | "transfer" | "POS";
  date: {
    seconds: number;
    nanoseconds: number;
  };
  receivedBy: string;
}

export interface FeeRecord {
  term: string;
  totalDue: number;
  amountPaid: number;
  balance: number;
  status: "unpaid" | "partial" | "paid";
  dueDate?: {
    seconds: number;
    nanoseconds: number;
  };
  paymentHistory: PaymentRecord[];
}
