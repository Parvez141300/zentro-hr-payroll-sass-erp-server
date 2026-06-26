export interface ICreateDesignationPayload {
    title: string;
    description?: string;
    departmentId: string;
}

export interface IUpdateDesignationPayload {
    title?: string;
    description?: string;
}

export interface IGetCompanyDesignationPayload {
    search: string | undefined;
    page: number;
    limit: number;
    skip: number;
    sortBy: string;
    sortOrder: string;
}