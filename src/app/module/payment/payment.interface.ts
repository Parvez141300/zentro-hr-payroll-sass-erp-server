export interface IGetCompanyPaymentsPayload {
    search?: string;
    page: number;
    limit: number;
    skip: number;
    sortBy: string;
    sortOrder: string;
}