export interface IDepartmentPayload {
    name: string;
    description?: string;
}

export interface IUpdateDepartmentPayload {
    name?: string;
    description?: string;
}