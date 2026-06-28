import { AttendanceStatus } from "../../../generated/prisma/enums";

export interface IMarkAttendancePayload {
    employeeId: string;
    date: Date;
    status: AttendanceStatus;
    checkIn?: Date;
    checkOut?: Date;
    note?: string;
}

export interface IUpdateAttendancePayload {
    status?: AttendanceStatus;
    checkIn?: Date;
    checkOut?: Date;
    note?: string;
}