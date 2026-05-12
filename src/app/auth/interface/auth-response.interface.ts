import { User } from "@src/app/auth/interface/user.interface";

export interface AuthResponse {
    first_name : string,
    last_name: string,
    email : string,
    tokens: string
}