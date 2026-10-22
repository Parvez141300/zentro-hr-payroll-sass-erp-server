// types/report.types.ts

import { PayrollStatus, SalaryType } from "../../../generated/prisma/enums";

export interface IGetDashboardStatsPayload {
    attendanceDate?: Date;  // 🆕 Exact date (e.g., 2024-01-05)
    payrollMonth?: number;   // Optional: month for payroll
    payrollYear?: number;    // Optional: year for payroll
}

export interface IGetPayrollReportPayload {
    month?: number;
    year?: number;
    departmentId?: string;
    status?: PayrollStatus;
    salaryType?: SalaryType;
    startDate?: string;  // ✅ NEW: ISO Date string (filters by createdAt)
    endDate?: string;    // ✅ NEW: ISO Date string (filters by createdAt)
}