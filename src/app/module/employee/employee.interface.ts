import { EmployeeStatus, EmploymentType, Gender } from "../../../generated/prisma/enums";

export interface IGetAllOrQueryEmployeePayload {
    search: string | undefined;
    page: number;
    limit: number;
    skip: number;
    sortBy: string;
    sortOrder: string;
    employmentType: EmploymentType | undefined;
    status: EmployeeStatus | undefined;
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
    departmentId?: string;
    designationId?: string;
}