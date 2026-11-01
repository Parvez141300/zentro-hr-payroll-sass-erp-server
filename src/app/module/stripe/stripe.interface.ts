export interface ICreateStripeCheckoutSessionPayload {
    companyId: string;
    userId: string;
    planName: string;
    billingCycle: "yearly" | "monthly";
    successUrl: string;
    cancelUrl: string;
}