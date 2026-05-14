export interface User {
    id: number;
    company_id: number;
    first_name: string;
    last_name: string;
    username: string;
    email: string;
}

export interface LoginUser {
    email: string;
    password: string;
}
