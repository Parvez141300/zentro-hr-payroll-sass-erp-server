import { HrScope, Role } from "../../../generated/prisma/enums";
import { AttendanceWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";
import { IGetAllOrQueryAttendancePayload, IMarkAttendancePayload } from "./attendance.interface";

const markAttendanceInDB = async (companyId: string, userId: string, paylaod: IMarkAttendancePayload) => {
    const { employeeId, date, status, checkIn, checkOut, note } = paylaod;

    const isExistAttendance = await prisma.attendance.findUnique({
        where: {
            employeeId_date: {
                employeeId: employeeId,
                date: date
            },
            companyId: companyId,
        }
    });

    if (isExistAttendance) {
        throw new Error("Attendance already marked");
    }

    let lateMinutes = 0;
    let earlyExitMinutes = 0;
    let overtimeHours = 0;

    if (checkIn) {
        const scheduleStart = new Date(date);
        scheduleStart.setHours(9, 0, 0); // 9:00 AM
        if (checkIn > scheduleStart) {
            lateMinutes = Math.floor((new Date(checkIn).getTime() - scheduleStart.getTime()) / (1000 * 60));
        }
    }

    if (checkIn && checkOut) {
        const totalHours = Math.floor((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60));
        if (totalHours > 8) {
            overtimeHours = totalHours - 8;
        }
        else if (totalHours < 8) {
            earlyExitMinutes = Math.floor((8 - totalHours) * 60);
        }
    }

    const attendance = await prisma.attendance.create({
        data: {
            companyId: companyId,
            employeeId: employeeId,
            approvedBy: userId,
            date: date,
            status: status,
            checkIn: checkIn,
            checkOut: checkOut,
            note: note,
            lateMinutes: lateMinutes,
            earlyExitMinutes: earlyExitMinutes,
            overtimeHours: overtimeHours,
        }
    });

    return attendance;
}

const getAllOrQueryAttendanceFromDB = async (
    companyId: string,
    userId: string,
    role: Role,
    payload: IGetAllOrQueryAttendancePayload
) => {
    const {
        startDate,
        endDate,
        status,
        search,
        page = 1,
        skip = 0,
        limit = 10,
        sortBy = 'date',
        sortOrder = 'desc'
    } = payload;

    // 1. VALIDATION

    const isExistCompany = await prisma.company.findUnique({
        where: { id: companyId }
    });

    if (!isExistCompany) {
        throw new Error("Company not found");
    }

    const isExistUser = await prisma.user.findUnique({
        where: { id: userId }
    });

    if (!isExistUser) {
        throw new Error("User not found");
    }

    // 2. DETERMINE DEPARTMENT & EMPLOYEE ID

    let departmentId: string | null = null;
    let employeeId: string | null = null;

    // EMPLOYEE: Get their own employee ID and department
    if (role === Role.EMPLOYEE) {
        const employee = await prisma.employee.findUnique({
            where: { userId },
            select: {
                id: true,
                departmentId: true
            }
        });

        if (employee) {
            employeeId = employee.id;
            departmentId = employee.departmentId;
        }
    }

    // DEPARTMENT_HEAD: Get their department ID
    if (role === Role.DEPARTMENT_HEAD) {
        const deptHead = await prisma.departmentHead.findUnique({
            where: { userId },
            select: { departmentId: true }
        });

        if (deptHead) {
            departmentId = deptHead.departmentId;
        }
    }

    // HR_MANAGER: Check if department specific
    if (role === Role.HR_MANAGER) {
        const hrManager = await prisma.hrManager.findUnique({
            where: { userId },
            select: {
                scope: true,
                departmentId: true
            }
        });

        if (hrManager?.scope === HrScope.DEPARTMENT_SPECIFIC) {
            departmentId = hrManager.departmentId;
        }
        // If scope is COMPANY_WIDE, departmentId stays null (see all)
    }

    // SUPER_ADMIN: departmentId stays null (see all)

    // 3. BUILD WHERE CONDITION

    const whereCondition: AttendanceWhereInput = {
        companyId: companyId,
    };

    // 🔑 CRITICAL: Employee filter based on role
    if (role === Role.EMPLOYEE && employeeId) {
        // Employee sees ONLY their own attendance
        whereCondition.employeeId = employeeId;
    } else if (departmentId) {
        // Department Head, Department-specific HR Manager sees department employees
        whereCondition.employee = {
            departmentId: departmentId
        };
    }
    // SUPER_ADMIN sees all (no filter)
    // COMPANY_WIDE HR Manager sees all (no filter)

    // 4. ADD FILTERS (status, date, search)

    const filters: AttendanceWhereInput[] = [];

    // Status filter
    if (status) {
        filters.push({ status: status });
    }

    // Date range filter
    if (startDate && endDate) {
        filters.push({
            date: {
                gte: startDate,
                lte: endDate
            }
        });
    }

    // Search filter (employee name, email, phone)
    if (search) {
        filters.push({
            employee: {
                OR: [
                    {
                        name: {
                            contains: search,
                            mode: "insensitive"
                        }
                    },
                    {
                        phone: {
                            contains: search,
                            mode: "insensitive"
                        }
                    },
                    {
                        user: {
                            email: {
                                contains: search,
                                mode: "insensitive"
                            }
                        }
                    }
                ]
            }
        });
    }

    // Apply filters
    if (filters.length > 0) {
        whereCondition.AND = filters;
    }

    // ============================================
    // 5. EXECUTE QUERY
    // ============================================

    const attendance = await prisma.attendance.findMany({
        where: whereCondition,
        skip: skip,
        take: limit,
        orderBy: {
            [sortBy]: sortOrder
        },
        include: {
            employee: {
                include: {
                    department: {
                        select: {
                            id: true,
                            name: true
                        }
                    },
                    designation: {
                        select: {
                            id: true,
                            title: true
                        }
                    },
                    user: {
                        select: {
                            id: true,
                            email: true,
                            isActive: true
                        }
                    }
                }
            }
        }
    });

    // 6. GET TOTAL COUNT

    const attendanceCount = await prisma.attendance.count({
        where: whereCondition,
    });

    return {
        data: attendance,
        pagination: {
            total: attendanceCount,
            page: page,
            limit: limit,
            totalPages: Math.ceil(attendanceCount / limit),
        }
    };
};

const getAttendanceByIdFromDB = async (companyId: string, attendanceId: string) => {
    const isExistCompany = await prisma.company.findUnique({
        where: {
            id: companyId
        }
    });

    if (!isExistCompany) {
        throw new Error("Company not found");
    }
    
    const attendance = await prisma.attendance.findUnique({
        where: {
            id: attendanceId,
            companyId: companyId
        },
        include: {
            employee: {
                include: {
                    department: {
                        select: {
                            id: true,
                            name: true
                        }
                    },
                    designation: {
                        select: {
                            id: true,
                            title: true
                        }
                    },
                    user: {
                        select: {
                            id: true,
                            email: true,
                            isActive: true
                        }
                    }
                }
            }
        }
    });

    if (!attendance) {
        throw new Error("Attendance not found");
    }

    return attendance;
}

export const attendanceService = {
    markAttendanceInDB,
    getAllOrQueryAttendanceFromDB,
    getAttendanceByIdFromDB,
}