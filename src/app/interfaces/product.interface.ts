export interface Product {
    id?: number | string;
    name: string;
    description?: string;
    brand?: number | string | null;
    brand_name?: string;
    category?: number | string | null;
    category_name?: string;
    status: string;
    created?: string;
    modified?: string;
}

export interface ProductResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: Product[];
}
