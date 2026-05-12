export interface AccountPayable {
  id?: number;
  invoice: number;
  total_amount: number;
  amount_paid: number;
  due_date: string;
  status: string;
}
