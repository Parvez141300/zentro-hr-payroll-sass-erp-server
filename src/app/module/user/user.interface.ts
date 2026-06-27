import { HrScope } from "../../../generated/prisma/enums";

export interface ICreateHRManagerPayload {
    // User fields
    email: string;
    password: string;
    
    // Profile fields
    name: string;
    phone?: string;
    photoUrl?: string;
    
    // Job fields
    joinDate?: Date;
    hrLicenseNumber?: string;
    officePhone?: string;
    bio?: string;
    
    // 🆕 Scope & Department
    scope: HrScope;  // "COMPANY_WIDE" or "DEPARTMENT_SPECIFIC"
    departmentId?: string;  // Required if scope is "DEPARTMENT_SPECIFIC"
    designationId?: string;
    
    // System fields
    isActive?: boolean;
}

export interface ICreateCompanyAccountantPayload {
    userId: string;
    name: string;
    email: string;
    password: string;
    phone?: string;
    photoUrl?: string;
    joinDate?: Date;
    caLicenseNumber?: string;
    taxIdNumber?: string;
    bankName?: string;
    bankAccount?: string;
}