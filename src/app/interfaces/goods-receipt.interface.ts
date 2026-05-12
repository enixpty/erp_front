export interface GoodsReceipt {
    id?: number | string;
    order: number | string;
    warehouse: number | string;
    lines: GoodsReceiptLine[];
}

export interface GoodsReceiptLine {
    id?: number | string;
    sku: number | string;
    quantity: number;
}
