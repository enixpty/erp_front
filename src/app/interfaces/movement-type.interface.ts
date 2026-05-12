export interface MovementType {
    id?: number | string;
    name: string;
    direction: 'IN' | 'OUT' | 'TRANSFER';
    needs_source: boolean;
    needs_destination: boolean;
}

export interface MovementTypeResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: MovementType[];
}
