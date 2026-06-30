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

    const addCondition : AttendanceWhereInput[] = [];
    
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