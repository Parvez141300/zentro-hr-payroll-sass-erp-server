import { SubscriptionPlan } from "../../../generated/prisma/enums";

export interface ICreateCompanyPayload {
    name: string;
    email: string;
    phone?: string;
    address?: string;
    maxEmployees: number;
    subscriptionPlan: SubscriptionPlan;
}

export interface IUpdateCompanyPayload {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    taxId?: string;
    website?: string;
    fiscalYearStart?: Date;
    fiscalYearEnd?: Date;
}

export interface IGetCompanyPayload {
    search: string | undefined;
    subscriptionPlan: string | undefined;
    subscriptionStatus: string | undefined;
    isDeleted: boolean | undefined;
    page: number;
    limit: number;
    skip: number;
    sortBy: string;
    sortOrder: string;
}