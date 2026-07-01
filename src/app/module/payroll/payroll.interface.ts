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