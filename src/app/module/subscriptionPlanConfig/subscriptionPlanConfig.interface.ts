import { SubscriptionPlan } from "../../../generated/prisma/enums";

export enum FeatureCategories {
    CORE = 'core',
    HR = 'hr',
    PAYROLL = 'payroll',
    ATTENDANCE = 'attendance',
    LEAVE = 'leave',
    REPORTS = 'reports',
    SUPPORT = 'support',
};

export interface IFeaturePlan {
    name: string;
    description?: string;
    included: boolean;
    icon?: string;
    category: 'core' | 'hr' | 'payroll' | 'attendance' | 'leave' | 'reports' | 'support';
    limit?: number;
    tooltip?: string;
}

export interface ISubscriptionPlanConfigPayload {
    name: SubscriptionPlan;
    displayName: string;
    description: string;
    priceUSD: number;
    priceBDT: number;
    yearlyPriceUSD: number;
    yearlyPriceBDT: number;
    maxEmployees: number;
    features: IFeaturePlan[];
    isActive: boolean;
    sortOrder: number;
    popularBadge: boolean;
}