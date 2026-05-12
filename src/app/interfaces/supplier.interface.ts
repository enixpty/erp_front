export interface Supplier {
    id?: number | string;
    name: string;
    ruc?: string;
    phone?: string;
    email?: string;
    address?: string;
    status: string;
    created?: string;
    modified?: string;
}

export interface SupplierResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: Supplier[];
}
