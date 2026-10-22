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
    salaryType?: SalaryType; // ✅ NEW: Filter by MONTHLY, DAILY, HOURLY
    startPeriod?: string;    // ✅ NEW: ISO Date string (e.g., "2026-09-01")
    endPeriod?: string;      // ✅ NEW: ISO Date string (e.g., "2026-09-30")
}