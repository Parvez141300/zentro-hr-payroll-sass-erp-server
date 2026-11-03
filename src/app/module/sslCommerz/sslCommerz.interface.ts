/* eslint-disable @typescript-eslint/no-explicit-any */
export interface ISSLCommerzInitiatePaymentPayload {
    companyId: string;
    userId: string;
    planName: string;
    billingCycle: "MONTHLY" | "YEARLY";
}

export interface ISSLCommerzSuccessPayload {
    status: string;
    tran_id: string;
    val_id: string;
    [key: string]: any;
}

export interface ISSLCommerzFailedOrCancelPayload {
    tran_id?: string;
    [key: string]: any;
}