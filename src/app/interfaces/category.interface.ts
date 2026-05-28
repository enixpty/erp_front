export interface Category {
    id?: number | string;
    name: string;
    parent?: number | string | null;
    stock_min_default?: number;
    stock_max_default?: number;
    tax_percent?: number;
    status: string;
    created?: string;
    modified?: string;
}

export interface CategoryResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: Category[];
}
