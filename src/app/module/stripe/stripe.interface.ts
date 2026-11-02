export interface ICreateStripeCheckoutSessionPayload {
    companyId: string;
    userId: string;
    planName: string;
    billingCycle: "YEARLY" | "MONTHLY";
    successUrl: string;
    cancelUrl: string;
}