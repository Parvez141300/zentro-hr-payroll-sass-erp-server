import { EmploymentType, Gender, HrScope } from "../../../generated/prisma/enums";

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

export interface IUpdateHRManagerPayload {
    name?: string;
    phone?: string;
    photoUrl?: string;
    hrLicenseNumber?: string;
    officePhone?: string;
    bio?: string;
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

export interface IUpdateAccountantPayload {
    name?: string;
    phone?: string;
    photoUrl?: string;
    caLicenseNumber?: string;
    taxIdNumber?: string;
    bankName?: string;
    bankAccount?: string;
}

export interface ICreateCompanyDepartmentHeadPayload {
    companyId: string;
    departmentId: string;
    designationId: string;
    name: string;
    email: string;
    password: string;
    phone?: string;
    photoUrl?: string;
    joinDate?: Date;
    officeLocation?: string;
    linkedinUrl?: string;
    bio?: string;
}

export interface IUpdateDepartmentHeadPayload {
    name?: string;
    phone?: string;
    photoUrl?: string;
    officeLocation?: string;
    linkedinUrl?: string;
    bio?: string;
}

export interface ICreateCompanyEmployeePayload {
    companyId: string;
    departmentId: string;
    designationId: string;

    name: string;
    email: string;
    password: string;

    phone?: string;
    photoUrl?: string;
    dateOfBirth?: Date;
    gender: Gender;
    address?: string;
    nidNumber?: string;
    bloodGroup?: string;

    employmentType: EmploymentType;
    joinDate?: Date;

    basicSalary: number;
    houseAllowance: number;
    medicalAllowance: number;
    transportAllowance: number;

    bankName?: string;
    bankAccount?: string;

    emergencyName?: string;
    emergencyPhone?: string;
    emergencyRelation?: string;
}

export interface IUpdateEmployeePayload {
    name?: string;
    phone?: string;
    photoUrl?: string;
    dateOfBirth?: Date;
    gender?: Gender;
    address?: string;
    nidNumber?: string;
    bloodGroup?: string;
    employmentType?: EmploymentType;
    basicSalary?: number;
    houseAllowance?: number;
    medicalAllowance?: number;
    transportAllowance?: number;
    bankName?: string;
    bankAccount?: string;
    emergencyName?: string;
    emergencyPhone?: string;
    emergencyRelation?: string;
}