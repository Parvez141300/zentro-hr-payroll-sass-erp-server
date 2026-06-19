export interface ISubscriptionPlanConfigPayload {
    name: string;
    displayName: string;
    description: string;
    priceUSD: number;
    priceBDT: number;
    yearlyPriceUSD: number;
    yearlyPriceBDT: number;
    maxEmployees: number;
    features: string;
}