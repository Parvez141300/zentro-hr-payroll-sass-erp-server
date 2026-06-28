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