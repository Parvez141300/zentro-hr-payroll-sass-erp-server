import { HrScope } from "../../../generated/prisma/enums";

export interface IUpdateHRManagerPayload {
    name?: string;
    phone?: string;
    photoUrl?: string;

    joinDate? : Date;
    hrLicenseNumber?: string;
    officePhone?: string;
    bio?: string;

    scope?: HrScope;

    departmentId?: string;
    designationId?: string;
}

export interface IGetAllOrQueryHRManagerPayload {
    search: string | undefined;
    page: number;
    limit: number;
    skip: number;
    sortBy: string;
    sortOrder: string;
}