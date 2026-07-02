// types/report.types.ts

export interface IGetDashboardStatsPayload {
    attendanceDate?: Date;  // 🆕 Exact date (e.g., 2024-01-05)
    payrollMonth?: number;   // Optional: month for payroll
    payrollYear?: number;    // Optional: year for payroll
}

export interface IRecentActivity {
    id: string;
    action: string;
    description: string;
    timestamp: Date;
    user: {
        name: string;
        email: string;
    };
}

export interface IHeadcountReport {
    departmentId: string;
    departmentName: string;
    totalEmployees: number;
    male: number;
    female: number;
    other: number;
    active: number;
    inactive: number;
    percentage: number;
}

export interface IAttendanceReport {
    date: Date;
    totalEmployees: number;
    present: number;
    absent: number;
    late: number;
    halfDay: number;
    attendanceRate: number;
    departmentWise: {
        departmentName: string;
        total: number;
        present: number;
        rate: number;
    }[];
}

export interface ILeaveReport {
    leaveTypeId: string;
    leaveTypeName: string;
    totalRequested: number;
    approved: number;
    rejected: number;
    pending: number;
    totalDays: number;
    usedDays: number;
    remainingDays: number;
}

export interface IPayrollReport {
    totalEmployees: number;
    totalGrossSalary: number;
    totalNetSalary: number;
    totalTaxDeduction: number;
    totalPfDeduction: number;
    totalDeductions: number;
    averageSalary: number;
    byDepartment: {
        departmentName: string;
        totalEmployees: number;
        totalGross: number;
        totalNet: number;
    }[];
    byStatus: {
        draft: number;
        approved: number;
        paid: number;
        cancelled: number;
    };
    monthlyTrend: {
        month: string;
        year: number;
        totalNet: number;
    }[];
}

export interface IEmployeeSelfReport {
    employeeName: string;
    employeeCode: string;
    department: string;
    designation: string;
    joinDate: Date;
    attendanceSummary: {
        totalPresent: number;
        totalAbsent: number;
        totalLate: number;
        totalHalfDay: number;
        totalWorkingDays: number;
        attendanceRate: number;
    };
    leaveSummary: {
        totalTaken: number;
        totalPending: number;
        byType: {
            leaveType: string;
            taken: number;
            remaining: number;
        }[];
    };
    payrollSummary: {
        lastSixMonths: {
            month: string;
            year: number;
            netSalary: number;
            status: string;
        }[];
        totalEarned: number;
        averageSalary: number;
    };
}