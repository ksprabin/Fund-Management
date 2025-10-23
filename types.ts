
export enum Role {
    ADMIN = 'ADMIN',
    USER = 'USER',
}

export interface User {
    id: string;
    username: string;
    name: string;
    password?: string; // Optional because we don't want to expose it everywhere
    role: Role;
}

export interface Transaction {
    id: string;
    userId: string;
    description: string;
    amount: number;
    date: string;
}