export interface InvoiceType {
  createdAt: string;
  term: string;
  dueDate: string;
  status: string;
  items: { description: string; amount: string }[];
  totalDue: string;
  amountPaid: string;
  balance: string;
}
