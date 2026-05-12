export interface Brand {
    id?: number | string;
    name: string;
    status: string;
    created?: string;
    modified?: string;
}

export interface BrandResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: Brand[];
}
