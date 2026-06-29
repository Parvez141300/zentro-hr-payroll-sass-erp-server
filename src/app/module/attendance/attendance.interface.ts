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
    date?: Date;
    status?: AttendanceStatus;
    checkIn?: Date;
    checkOut?: Date;
    note?: string;
}

export interface IGetAllOrQueryAttendancePayload {
    startDate?: Date;
    endDate?: Date;
    status?: AttendanceStatus;
    search?: string;
    page: number;
    limit: number;
    skip: number;
    sortBy: string;
    sortOrder?: string;
}