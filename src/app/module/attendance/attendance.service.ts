import { prisma } from "../../lib/prisma";
import { IMarkAttendancePayload } from "./attendance.interface";

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
            lateMinutes = Math.floor((checkIn.getTime() - scheduleStart.getTime()) / (1000 * 60));
        }
    }

    if (checkIn && checkOut) {
        const totalHours = Math.floor((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60));
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

export const attendanceService = {
    markAttendanceInDB,
}