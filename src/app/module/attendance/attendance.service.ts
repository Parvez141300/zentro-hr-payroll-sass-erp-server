import { DepartmentHead, Employee, HrManager } from "../../../generated/prisma/client";
import { HrScope, Role } from "../../../generated/prisma/enums";
import { AttendanceWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";
import { IGetAllOrQueryAttendancePayload, IMarkAttendancePayload, IUpdateAttendancePayload } from "./attendance.interface";

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
        search,
        page = 1,
        skip = 0,
        limit = 10,
        sortBy = 'date',
        sortOrder = 'desc',
        startDate,
        endDate,
        status,
        departmentId,
        designationId,
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

    const addCondition: AttendanceWhereInput[] = [];

    if (search) {
        addCondition.push({
            OR: [
                {
                    employee: {
                        user: {
                            name: {
                                contains: search,
                                mode: "insensitive"
                            }
                        }
                    }
                },
                {
                    employee: {
                        user: {
                            email: {
                                contains: search,
                                mode: "insensitive"
                            }
                        }
                    }
                },
                {
                    employee: {
                        employeeCode: {
                            contains: search,
                            mode: "insensitive"
                        }
                    }
                },
            ]
        });
    }

    if (startDate && endDate) {
        addCondition.push({
            date: {
                gte: startDate,
                lte: endDate
            }
        });
    }

    if (status) {
        addCondition.push({
            status: status
        });
    }

    let employeeData: Employee | null = null;
    let hrManagerData: HrManager | null = null;
    let departmentHeadData: DepartmentHead | null = null;

    if (role === Role.EMPLOYEE) {
        employeeData = await prisma.employee.findUnique({
            where: {
                companyId: companyId,
                userId: userId,
            }
        });

        if (!employeeData) {
            throw new Error("This Employee not found");
        }
    }
    if (role === Role.DEPARTMENT_HEAD) {
        departmentHeadData = await prisma.departmentHead.findUnique({
            where: {
                companyId: companyId,
                userId: userId,
            }
        });

        if (!departmentHeadData) {
            throw new Error("This Department Head not found");
        }
    }
    if (role === Role.HR_MANAGER) {
        hrManagerData = await prisma.hrManager.findUnique({
            where: {
                companyId: companyId,
                userId: userId,
            }
        });

        if (!hrManagerData) {
            throw new Error("This HR Manager not found");
        }
    }

    let attendances;
    let attendanceCount: number;

    if (role === Role.EMPLOYEE) {
        attendances = await prisma.attendance.findMany({
            where: {
                employeeId: employeeData?.id,
                companyId: companyId,
                AND: addCondition,
                employee: {
                    departmentId: employeeData?.departmentId,
                }
            },
            skip: skip,
            take: limit,
            orderBy: {
                [sortBy]: sortOrder
            },
            include: {
                employee: {
                    include: {
                        user: true
                    }
                }
            }
        });

        attendanceCount = await prisma.attendance.count({
            where: {
                employeeId: employeeData?.id,
                companyId: companyId,
                AND: addCondition,
                employee: {
                    departmentId: employeeData?.departmentId,
                }
            }
        });
    }
    else if (role === Role.DEPARTMENT_HEAD) {
        attendances = await prisma.attendance.findMany({
            where: {
                employee: {
                    departmentId: departmentHeadData?.departmentId,
                },
                companyId: companyId,
                AND: addCondition,
            },
            skip: skip,
            take: limit,
            orderBy: {
                [sortBy]: sortOrder
            },
            include: {
                employee: {
                    include: {
                        user: true
                    }
                }
            }
        });

        attendanceCount = await prisma.attendance.count({
            where: {
                employee: {
                    departmentId: departmentHeadData?.departmentId,
                },
                companyId: companyId,
                AND: addCondition,
            }
        });
    }
    else if (role === Role.HR_MANAGER && hrManagerData?.scope === HrScope.DEPARTMENT_SPECIFIC && hrManagerData?.departmentId) {
        attendances = await prisma.attendance.findMany({
            where: {
                employee: {
                    departmentId: hrManagerData?.departmentId,
                },
                companyId: companyId,
                AND: addCondition,
            },
            skip: skip,
            take: limit,
            orderBy: {
                [sortBy]: sortOrder
            },
            include: {
                employee: {
                    include: {
                        user: true
                    }
                }
            }
        });

        attendanceCount = await prisma.attendance.count({
            where: {
                employee: {
                    departmentId: hrManagerData?.departmentId,
                },
                companyId: companyId,
                AND: addCondition,
            }
        });
    }
    else {
        if (departmentId) {
            addCondition.push({
                employee: {
                    departmentId: departmentId
                }
            });
        }

        if (designationId) {
            addCondition.push({
                employee: {
                    designationId: designationId
                }
            });
        }

        attendances = await prisma.attendance.findMany({
            where: {
                companyId: companyId,
                AND: addCondition,
            },
            skip: skip,
            take: limit,
            orderBy: {
                [sortBy]: sortOrder
            },
            include: {
                employee: {
                    include: {
                        user: true
                    }
                }
            }
        });

        attendanceCount = await prisma.attendance.count({
            where: {
                companyId: companyId,
                AND: addCondition,
            }
        });
    }

    return {
        data: attendances,
        pagination: {
            total: attendanceCount,
            page: page,
            limit: limit,
            totalPages: Math.ceil(attendanceCount / limit),
        }
    }
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

const updateAttendanceInDB = async (companyId: string, attendanceId: string, payload: IUpdateAttendancePayload) => {
    const { date, status, checkIn, checkOut, note } = payload;

    const isExistCompany = await prisma.company.findUnique({
        where: {
            id: companyId
        }
    });

    if (!isExistCompany) {
        throw new Error("Company not found");
    }

    const isExistAttendance = await prisma.attendance.findUnique({
        where: {
            id: attendanceId,
            companyId: companyId
        }
    });

    if (!isExistAttendance) {
        throw new Error("Attendance not found");
    }

    // late minutes
    let overtimeHours = 0;
    let lateMinutes = 0;
    let earlyExitMinutes = 0;

    if (checkIn) {
        const scheduleStart = new Date(date || isExistAttendance.date);
        scheduleStart.setHours(9, 0, 0); // 9:00 AM
        if (checkIn > scheduleStart) {
            lateMinutes = Math.floor((new Date(checkIn).getTime() - scheduleStart.getTime()) / (1000 * 60));
        }
    }
    if (checkOut && (isExistAttendance.checkIn || checkIn)) {
        const checkInTime = isExistAttendance.checkIn || checkIn;
        if (checkInTime) {
            const totalHours = Math.floor((new Date(checkOut).getTime() - new Date(checkInTime).getTime()) / (1000 * 60 * 60));
            if (totalHours > 8) {
                overtimeHours = totalHours > 8 ? totalHours - 8 : 0;
            }
            if (totalHours < 8) {
                earlyExitMinutes = Math.floor((new Date(isExistAttendance.checkOut ?? checkOut).getTime() - new Date(checkOut).getTime()) / (1000 * 60));
            }
        }
    }

    const updateAttendance = await prisma.attendance.update({
        where: {
            companyId: companyId,
            id: attendanceId,
        },
        data: {
            date: date || isExistAttendance.date,
            status: status || isExistAttendance.status,
            checkIn: checkIn || isExistAttendance.checkIn,
            checkOut: checkOut || isExistAttendance.checkOut,
            lateMinutes: lateMinutes || isExistAttendance.lateMinutes,
            earlyExitMinutes: earlyExitMinutes || isExistAttendance.earlyExitMinutes,
            overtimeHours: overtimeHours || isExistAttendance.overtimeHours,
            note: note || isExistAttendance.note,
        }
    });

    return updateAttendance;
}

const deleteAttendanceFromDB = async (companyId: string, attendanceId: string) => {
    const isExistCompany = await prisma.company.findUnique({
        where: {
            id: companyId
        }
    });

    if (!isExistCompany) {
        throw new Error("Company not found");
    }

    const isExistAttendance = await prisma.attendance.findUnique({
        where: {
            id: attendanceId,
            companyId: companyId
        }
    });

    if (!isExistAttendance) {
        throw new Error("Attendance not found");
    }

    const deleteAttendance = await prisma.attendance.delete({
        where: {
            id: attendanceId,
            companyId: companyId
        }
    });

    return deleteAttendance;
}

export const attendanceService = {
    markAttendanceInDB,
    getAllOrQueryAttendanceFromDB,
    getAttendanceByIdFromDB,
    updateAttendanceInDB,
    deleteAttendanceFromDB,
}