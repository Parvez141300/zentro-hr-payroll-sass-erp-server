export interface IDepartmentPayload {
    companyId: string;
    name: string;
    description?: string;
}

export interface IUpdateDepartmentPayload {
    name?: string;
    description?: string;
}