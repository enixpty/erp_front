export interface QuotationDetail {
    id?: number;
    sku: number;
    sku_name?: string;
    sku_code?: string;
    quantity: number;
    price: number;
    discount: number;
    tax_exempt: boolean;
    subtotal: number;
}

export interface Quotation {
    id?: number;
    document_number?: string;
    client: number;
    client_name?: string;
    date?: string;
    expiration_date: string;
    status: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED' | 'INVOICED';
    status_display?: string;
    subtotal: number;
    tax: number;
    total: number;
    global_discount: number;
    notes?: string;
    details: QuotationDetail[];
}

export interface QuotationResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: Quotation[];
}
