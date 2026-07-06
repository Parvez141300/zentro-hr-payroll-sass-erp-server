export interface ICreateStripeCheckoutSessionPayload {
    companyId: string;
    userId: string;
    planName: string;
    successUrl: string;
    cancelUrl: string;
}