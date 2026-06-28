export interface IUpdateAccountantPayload {
    name?: string;
    phone?: string;
    photoUrl?: string;
    caLicenseNumber?: string;
    taxIdNumber?: string;
    bankName?: string;
    bankAccount?: string;
    employeeCode?: string;
    joinDate?: Date;
    fiscalYearAccess?: boolean;
}

export interface IGetAllOrQueryAccountantPayload {
    search: string | undefined;
    page: number;
    limit: number;
    skip: number;
    sortBy: string;
    sortOrder: string;
}