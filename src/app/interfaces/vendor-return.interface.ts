export interface VendorReturn {
  id?: number;
  receipt: number;
  reason: string;
  lines: VendorReturnLine[];
}

export interface VendorReturnLine {
  sku: number;
  quantity: number;
}
