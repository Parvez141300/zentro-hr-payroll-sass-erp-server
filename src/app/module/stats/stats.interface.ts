// types/report.types.ts

export interface IGetDashboardStatsPayload {
    attendanceDate?: Date;  // 🆕 Exact date (e.g., 2024-01-05)
    payrollMonth?: number;   // Optional: month for payroll
    payrollYear?: number;    // Optional: year for payroll
}
