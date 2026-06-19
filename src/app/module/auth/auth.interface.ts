

export interface IRegisterSuperAdminPayload {
    name: string;
    email: string;
    password: string;
    phone?: string;
    address?: string;
    maxEmployees: number;
}