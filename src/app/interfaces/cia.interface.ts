export interface Cia {
    id?: number;
    name: string;
    ruc?: string;
    dv?: string;
    logo?: string | File;
    address?: string;
    phone?: string;
    email?: string;
    status?: string;
}

export interface CiaResponse {
    data: Cia;
}

export interface CiasListResponse {
    data: Cia[];
}
