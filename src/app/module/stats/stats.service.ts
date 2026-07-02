import { AttendanceStatus, EmployeeStatus, Gender, HrScope, LeaveStatus, PayrollStatus, Role } from "../../../generated/prisma/enums";
import { AttendanceWhereInput, DepartmentWhereInput, EmployeeWhereInput, LeaveWhereInput, PayrollWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";
import { IGetDashboardStatsPayload } from "./stats.interface";

const getDashboardStatsFromDB = async (
    companyId: string,
    userId: string,
    role: Role,
    payload?: IGetDashboardStatsPayload
) => {
    const today = new Date();

    // 1. ATTENDANCE DATE
    // If date provided, use that date, otherwise use current month
    let attendanceStartDate: Date;
    let attendanceEndDate: Date;

    if (payload?.attendanceDate) {
        // Use the provided date
        const providedDate = new Date(payload.attendanceDate);
        attendanceStartDate = new Date(providedDate.getFullYear(), providedDate.getMonth(), 1);
        attendanceEndDate = new Date(providedDate.getFullYear(), providedDate.getMonth() + 1, 0);
    } else {
        // Default: current month
        attendanceStartDate = new Date(today.getFullYear(), today.getMonth(), 1);
        attendanceEndDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    }

    // 2. PAYROLL DATE
    // If payroll month/year provided, use those, otherwise use current month
    let payrollMonth: number;
    let payrollYear: number;

    if (payload?.payrollMonth && payload?.payrollYear) {
        payrollMonth = payload.payrollMonth;
        payrollYear = payload.payrollYear;
    } else {
        // Default: current month
        payrollMonth = today.getMonth() + 1;
        payrollYear = today.getFullYear();
    }

    // 3. GET ROLE-SPECIFIC EMPLOYEES & DEPARTMENTS

    const employeeIds: string[] = [];
    const departmentIds: string[] = [];

    if (role === Role.EMPLOYEE) {
        const employee = await prisma.employee.findUnique({
            where: { userId: userId }
        });

        if (!employee) {
            throw new Error("Employee not found");
        }

        employeeIds.push(employee.id);
    }

    if (role === Role.DEPARTMENT_HEAD) {
        const departmentHead = await prisma.departmentHead.findUnique({
            where: { userId: userId }
        });

        if (!departmentHead) {
            throw new Error("Department head not found");
        }

        departmentIds.push(departmentHead.id);
        const employees = await prisma.employee.findMany({
            where: {
                departmentId: departmentHead.departmentId,
            }
        });

        employeeIds.push(...employees.map((emp) => emp.id));
    }

    if (role === Role.HR_MANAGER) {
        const hrManager = await prisma.hrManager.findUnique({
            where: { userId: userId }
        });

        if (!hrManager) {
            throw new Error("HR Manager not found");
        }

        if (hrManager.scope === HrScope.DEPARTMENT_SPECIFIC && hrManager.departmentId) {
            departmentIds.push(hrManager.departmentId);
            const employees = await prisma.employee.findMany({
                where: {
                    departmentId: hrManager.departmentId,
                }
            });

            employeeIds.push(...employees.map((emp) => emp.id));
        }
    }

    // 4. TOTAL EMPLOYEES

    const employeeWhere: EmployeeWhereInput = {
        companyId: companyId,
        status: EmployeeStatus.ACTIVE,
    };

    if (employeeIds.length > 0) {
        employeeWhere.id = { in: employeeIds };
    }

    const totalEmployees = await prisma.employee.count({
        where: employeeWhere
    });

    // 5. TOTAL DEPARTMENTS

    const departmentWhere: DepartmentWhereInput = {
        companyId: companyId,
    };

    if (departmentIds.length > 0) {
        departmentWhere.id = { in: departmentIds };
    }

    const totalDepartments = await prisma.department.count({
        where: departmentWhere
    });

    // 6. ATTENDANCE SUMMARY (with date filter)

    const attendanceWhere: AttendanceWhereInput = {
        companyId: companyId,
        date: {
            gte: attendanceStartDate,
            lte: attendanceEndDate
        }
    };

    if (employeeIds.length > 0) {
        attendanceWhere.employeeId = { in: employeeIds };
    }

    const attendances = await prisma.attendance.groupBy({
        by: ["status"],
        where: attendanceWhere,
        _count: {
            id: true
        }
    });

    const attendanceSummary = {
        present: 0,
        late: 0,
        absent: 0,
        halfDay: 0,
        rate: 0,
    };

    attendances.forEach((attendance) => {
        if (attendance.status === AttendanceStatus.PRESENT) {
            attendanceSummary.present = attendance._count.id;
        } else if (attendance.status === AttendanceStatus.LATE) {
            attendanceSummary.late = attendance._count.id;
        } else if (attendance.status === AttendanceStatus.ABSENT) {
            attendanceSummary.absent = attendance._count.id;
        } else if (attendance.status === AttendanceStatus.HALF_DAY) {
            attendanceSummary.halfDay = attendance._count.id;
        }
    });

    const totalAttendance = attendanceSummary.present + attendanceSummary.late +
        attendanceSummary.absent + attendanceSummary.halfDay;

    attendanceSummary.rate = totalAttendance > 0
        ? ((attendanceSummary.present + attendanceSummary.late + attendanceSummary.halfDay) / totalAttendance) * 100
        : 0;

    // 7. LEAVE SUMMARY

    const leaveWhere: LeaveWhereInput = { companyId: companyId };

    if (employeeIds.length > 0) {
        leaveWhere.employeeId = { in: employeeIds };
    }

    const leaves = await prisma.leave.groupBy({
        by: ["status"],
        where: leaveWhere,
        _count: {
            id: true
        }
    });

    const leaveSummary = {
        pending: 0,
        approved: 0,
        rejected: 0,
        total: 0
    };

    leaves.forEach((leave) => {
        if (leave.status === LeaveStatus.PENDING) {
            leaveSummary.pending = leave._count.id;
        } else if (leave.status === LeaveStatus.APPROVED_BY_HEAD) {
            leaveSummary.approved += leave._count.id;
        } else if (leave.status === LeaveStatus.APPROVED) {
            leaveSummary.approved += leave._count.id;
        } else if (leave.status === LeaveStatus.REJECTED) {
            leaveSummary.rejected = leave._count.id;
        }
    });

    leaveSummary.total = leaveSummary.pending + leaveSummary.approved + leaveSummary.rejected;

    // 8. PAYROLL SUMMARY (with date filter)

    let payrollSummary = {
        totalGross: 0,
        totalNet: 0,
        totalEmployees: 0,
    };

    if (role === Role.Super_ADMIN || role === Role.ACCOUNTANT || role === Role.HR_MANAGER) {
        const payrollWhere: PayrollWhereInput = {
            companyId: companyId,
            month: payrollMonth,
            year: payrollYear,
            status: {
                not: PayrollStatus.CANCELLED,
            }
        };

        if (employeeIds.length > 0) {
            payrollWhere.employeeId = { in: employeeIds };
        }

        const payrollData = await prisma.payroll.aggregate({
            where: payrollWhere,
            _sum: {
                grossSalary: true,
                netSalary: true,
            },
            _count: true,
        });

        payrollSummary = {
            totalGross: payrollData._sum.grossSalary || 0,
            totalNet: payrollData._sum.netSalary || 0,
            totalEmployees: payrollData._count || 0,
        };
    }

    // 9. RETURN RESPONSE

    return {
        totalEmployees,
        totalDepartments,
        totalAttendance: attendanceSummary,
        totalLeaves: leaveSummary,
        payroll: payrollSummary,
    };
};

const getDepartmentStatsFromDB = async (
    companyId: string,
    userId: string,
    role: Role,
    departmentId?: string
) => {
    // Get departments based on role
    const departmentFilter: DepartmentWhereInput = { companyId };

    if (role === Role.DEPARTMENT_HEAD) {
        const deptHead = await prisma.departmentHead.findUnique({
            where: { userId }
        });
        if (deptHead?.departmentId) {
            departmentFilter.id = deptHead.departmentId;
        }
    }

    if (role === Role.HR_MANAGER) {
        const hrManager = await prisma.hrManager.findUnique({
            where: { userId }
        });
        if (hrManager?.scope === HrScope.DEPARTMENT_SPECIFIC && hrManager.departmentId) {
            departmentFilter.id = hrManager.departmentId;
        }
    }

    if (departmentId) {
        departmentFilter.id = departmentId;
    }

    const departments = await prisma.department.findMany({
        where: departmentFilter,
        include: {
            employees: {
                include: {
                    user: true
                }
            }
        }
    });

    const totalEmployees = departments.reduce((sum, dept) => sum + dept.employees.length, 0);

    const report = departments.map(dept => {
        const employees = dept.employees;
        const male = employees.filter(e => e.gender === Gender.MALE).length;
        const female = employees.filter(e => e.gender === Gender.FEMALE).length;
        const other = employees.filter(e => e.gender === Gender.OTHER).length;
        const active = employees.filter(e => e.status === 'ACTIVE').length;
        const inactive = employees.filter(e => e.status !== 'ACTIVE').length;

        return {
            departmentId: dept.id,
            departmentName: dept.name,
            male,
            female,
            other,
            active,
            inactive,
        };
    });

    return {
        data: report,
        totalEmployees,
        totalDepartments: report.length
    };
};

const getAttendanceStatsFromDB = async (
    companyId: string,
    userId: string,
    role: Role,
    month?: number,
    year?: number
) => {
    const today = new Date();

    let startDate: Date;
    let endDate: Date;

    if(month && year){
        startDate = new Date(year, month - 1, 1);
    endDate = new Date(year, month, 0);
    }
    else {
        startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        endDate = new Date(today.getFullYear(), today.getMonth(), 0);
    }

    

    // Get employees based on role
    let employeeIds: string[] = [];

    if (role === Role.EMPLOYEE) {
        const employee = await prisma.employee.findUnique({
            where: { userId }
        });
        if (employee) employeeIds = [employee.id];
    }

    if (role === Role.DEPARTMENT_HEAD) {
        const deptHead = await prisma.departmentHead.findUnique({
            where: { userId }
        });
        if (deptHead?.departmentId) {
            const employees = await prisma.employee.findMany({
                where: { departmentId: deptHead.departmentId },
                select: { id: true }
            });
            employeeIds = employees.map(e => e.id);
        }
    }

    if (role === Role.HR_MANAGER) {
        const hrManager = await prisma.hrManager.findUnique({
            where: { userId }
        });
        if (hrManager?.scope === 'DEPARTMENT_SPECIFIC' && hrManager.departmentId) {
            const employees = await prisma.employee.findMany({
                where: { departmentId: hrManager.departmentId },
                select: { id: true }
            });
            employeeIds = employees.map(e => e.id);
        }
    }

    // Get attendance data
    const attendanceWhere: AttendanceWhereInput = {
        companyId,
        date: {
            gte: startDate,
            lte: endDate
        }
    };
    if (employeeIds.length > 0) {
        attendanceWhere.employeeId = { in: employeeIds };
    }

    const attendance = await prisma.attendance.groupBy({
        by: ['status'],
        where: attendanceWhere,
        _count: true
    });

    const summary = {
        present: 0,
        absent: 0,
        late: 0,
        halfDay: 0
    };

    let totalRecords = 0;

    attendance.forEach(record => {
        switch (record.status) {
            case AttendanceStatus.PRESENT: summary.present = record._count; break;
            case AttendanceStatus.ABSENT: summary.absent = record._count; break;
            case AttendanceStatus.LATE: summary.late = record._count; break;
            case AttendanceStatus.HALF_DAY: summary.halfDay = record._count; break;
        }
        totalRecords += record._count;
    });

    const totalPresentDays = summary.present + summary.late + summary.halfDay;
    const attendanceRate = totalRecords > 0 ? (totalPresentDays / totalRecords * 100) : 0;

    // Department wise breakdown
    const deptAttendance = await prisma.attendance.groupBy({
        by: ['employeeId', 'status'],
        where: attendanceWhere,
        _count: true
    });

    const departmentWiseMap = new Map();

    for (const record of deptAttendance) {
        const employee = await prisma.employee.findUnique({
            where: { id: record.employeeId },
            include: { department: true }
        });

        if (employee?.department?.name) {
            const deptName = employee.department.name;
            if (!departmentWiseMap.has(deptName)) {
                departmentWiseMap.set(deptName, { total: 0, present: 0 });
            }
            const deptData = departmentWiseMap.get(deptName);
            deptData.total += record._count;
            if (record.status === 'PRESENT' || record.status === 'LATE' || record.status === 'HALF_DAY') {
                deptData.present += record._count;
            }
        }
    }

    const departmentWise = Array.from(departmentWiseMap.entries()).map(([deptName, data]) => ({
        departmentName: deptName,
        total: data.total,
        present: data.present,
        rate: data.total > 0 ? (data.present / data.total * 100) : 0
    }));

    return {
        startDate,
        endDate,
        totalEmployees: employeeIds.length > 0 ? employeeIds.length : await prisma.employee.count({ where: { companyId } }),
        present: summary.present,
        absent: summary.absent,
        late: summary.late,
        halfDay: summary.halfDay,
        attendanceRate,
        departmentWise
    };
};


export const statsService = {
    getDashboardStatsFromDB,
    getDepartmentStatsFromDB,
    getAttendanceStatsFromDB,
}