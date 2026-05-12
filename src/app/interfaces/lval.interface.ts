export interface Lval {
    id?: number | string;
    category: string;
    name: string;
    value: string;
    order: number;
    status: string;
    status_name?: string;
    created?: string;
    modified?: string;
}

export interface LvalResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: Lval[];
}
