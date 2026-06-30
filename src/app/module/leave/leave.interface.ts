export interface IApplyForLeavePayload {
    leaveTypeId: string,
    startDate: Date,
    endDate: Date,
    reason: string,
    attachmentUrl?: string,
}