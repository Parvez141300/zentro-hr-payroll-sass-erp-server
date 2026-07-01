

export interface IRegisterSuperAdminPayload {
    name: string;
    companyName: string;
    email: string;
    password: string;
    phone?: string;
    address?: string;
    maxEmployees: number;
}

export interface ILoginUserPayload {
    email: string;
    password: string;
}

export interface IChangePasswordPayload {
    currentPassword: string;
    newPassword: string;
}