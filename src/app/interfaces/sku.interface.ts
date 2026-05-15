export interface SKU {
    id?: number | string;
    product: number | string;
    code: string;
    name: string;
    cost_price: number;
    sell_price: number;
    tax_exempt: boolean;
    supplier?: number | string | null;
    stock_min_override?: number | null;
    stock_max_override?: number | null;
    effective_stock_limits?: { min: number; max: number };
    status: string;
    eans?: ProductEAN[];
    attribute_values?: any[];
}

export interface ProductEAN {
    id?: number | string;
    sku: number | string;
    code: string;
    is_main: boolean;
}
