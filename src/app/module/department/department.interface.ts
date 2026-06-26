export interface IGetCompanyDepartmentPayload {
    search: string | undefined;
    page: number;
    limit: number;
    skip: number;
    sortBy: string;
    sortOrder: string;
}

export interface IDepartmentPayload {
    name: string;
    description?: string;
}

export interface IUpdateDepartmentPayload {
    name?: string;
    description?: string;
}