import { PayrollStatus } from "../../../generated/prisma/enums";

export interface IGeneratePayrollPayload {
    month: number;
    year: number;
    employeeId: string;
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
    departmentId?: string;
    designationId?: string;
}

export interface IUpdatePayrollPayload {
    basicSalary?: number;
    houseAllowance?: number;
    medicalAllowance?: number;
    transportAllowance?: number;
    overtimePay?: number;
    taxDeduction?: number;
    pfDeduction?: number;
    otherDeductions?: number;
    status?: PayrollStatus;
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