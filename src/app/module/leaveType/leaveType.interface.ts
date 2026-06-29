export interface ICreateLeaveTypePayload {
    name: string;
    description: string;
    daysAllowed: number;
    isPaid: boolean;
    isActive: boolean;
}