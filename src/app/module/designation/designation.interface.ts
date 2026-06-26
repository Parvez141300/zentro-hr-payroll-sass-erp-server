export interface ICreateDesignationPayload {
    title: string;
    description?: string;
    departmentId: string;
}

export interface IUpdateDesignationPayload {
    title?: string;
    description?: string;
}