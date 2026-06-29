export interface ICreateLeaveTypePayload {
    name: string;
    description: string;
    daysAllowed: number;
    isPaid: boolean;
    isActive: boolean;
}

export interface IUpdateLeaveTypePayload {
    name?: string;
    description?: string;
    daysAllowed?: number;
    isPaid?: boolean;
    isActive?: boolean;
}

export interface IGetLeaveTypePayload {
    search: string | undefined;
    page: number;
    limit: number;
    skip: number;
    sortBy: string;
    sortOrder: string;
    isActive: boolean | undefined;
    isPaid: boolean | undefined;
}