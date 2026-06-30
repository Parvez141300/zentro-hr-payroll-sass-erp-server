import { LeaveStatus } from "../../../generated/prisma/enums";

export interface IApplyForLeavePayload {
    leaveTypeId: string,
    startDate: Date,
    endDate: Date,
    reason: string,
    attachmentUrl?: string,
}

export interface IGetAllOrQueryLeavesPayload {
    search?: string,
    page: number,
    limit: number,
    skip: number,
    sortBy: string,
    sortOrder: string
    startDate?: Date,
    endDate?: Date,
    departmentId: string | undefined,
    designationId: string | undefined,
    status: LeaveStatus | undefined,
    leaveTypeId: string | undefined,
}

export interface IEmployeeLeaveUpdatePayload {
    leaveTypeId?: string;
    startDate?: Date;
    endDate?: Date;
    reason?: string;
    attachmentUrl?: string;
    status?: LeaveStatus;
}

export interface IUpdateLeavePayload {
    status: LeaveStatus;
    reviewNote?: string;
    approvedByHeadAt?: Date;
    approvedByHRAt?: Date;
    rejectedAt?: Date;
    rejectedReason?: string;
}