import { PayrollStatus, SalaryType } from "../../../generated/prisma/enums";

export interface IGeneratePayrollPayload {
    employeeId: string;
    month: number;
    year: number;
    periodStart: Date;
    periodEnd: Date;
}

export interface IGeneratePayrollForAllPayload {
    month: number;
    year: number;
}

export interface IGetAllOrQueryPayrollsPayload {
    search?: string;
    page?: number;
    skip?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
    month?: number;
    year?: number;
    status?: PayrollStatus;
    startDate?: Date;
    endDate?: Date;
    salaryType?: SalaryType;
    departmentId?: string;
    designationId?: string;
}

export interface IUpdatePayrollPayload {
    month?: number | null;
    year?: number | null;
    periodStart?: string; // ISO string
    periodEnd?: string;   // ISO string
    status?: PayrollStatus;
    paidAt?: string | null; // ISO string
}

export interface IPayslipData {
    employeeName: string;
    employeeCode: string;
    department: string;
    designation: string;
    month: number;
    year: number;
    basicSalary: number;
    houseAllowance: number;
    medicalAllowance: number;
    transportAllowance: number;
    overtimePay: number;
    grossSalary: number;
    taxDeduction: number;
    pfDeduction: number;
    otherDeductions: number;
    totalDeductions: number;
    netSalary: number;
    status: string;
    paidAt?: Date;
    generatedAt: Date;
}