export interface VendorInvoice {
  id?: number;
  order: number;
  receipt: number;
  supplier: number;
  invoice_number: string;
  invoice_date: string;
  total_amount: number;
  tax_amount: number;
  status?: string;
  supplier_name?: string;
}
