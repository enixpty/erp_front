export interface User {
    id: number | null;
    first_name: string;
    last_name: string;
    email: string; 
    is_active: boolean;
    role_id: number | null;
    password: string | null,
    rpassword: string | null;
}  