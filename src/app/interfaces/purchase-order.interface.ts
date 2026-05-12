export interface PurchaseOrder {
    id?: number | string;
    supplier: number | string;
    warehouse: number | string;
    status?: 'DRAFT' | 'CONFIRMED' | 'RECEIVED' | 'CANCELLED';
    freight_cost?: number;
    insurance_cost?: number;
    tax_rate: number;
    lines?: PurchaseOrderLine[];
}

export interface PurchaseOrderLine {
    id?: number | string;
    order?: number | string;
    sku: number | string;
    quantity: number;
    unit_price: number;
}
