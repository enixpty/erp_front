export interface Client {
    id?: number;
    identification: string;
    first_name: string;
    last_name?: string;
    email: string;
    phone: string;
    client_type: 'NATURAL' | 'JURIDICO';
    parent?: number | null;
    parent_name?: string;
    payment_term: 'CASH' | 'CREDIT';
    credit_days?: number;
    credit_limit: number;
    require_authorization: boolean;
    status: 'ACTIVE' | 'INACTIVE';
    created?: string;
    modified?: string;
}

export interface ClientResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: Client[];
}
