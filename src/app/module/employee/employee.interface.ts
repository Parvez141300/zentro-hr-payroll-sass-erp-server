import { EmployeeStatus, EmploymentType } from "../../../generated/prisma/enums";

export interface IGetAllOrQueryEmployeePayload {
    search: string | undefined;
    page: number;
    limit: number;
    skip: number;
    sortBy: string;
    sortOrder: string;
    employmentType: EmploymentType | undefined;
    status: EmployeeStatus | undefined;
}