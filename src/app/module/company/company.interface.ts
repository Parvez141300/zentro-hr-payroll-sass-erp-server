import { SubscriptionPlan } from "../../../generated/prisma/enums";

export interface ICreateCompanyPayload {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    maxEmployees: number;
    subscriptionPlan: SubscriptionPlan;
}