export interface ISSLCommerzInitiatePaymentPayload {
    companyId: string;
    userId: string;
    planName: string;
    successUrl?: string;
    failUrl?: string;
    cancelUrl?: string;
}

export interface ISSLCommerzSuccessPayload {
    status: string;
    tran_id: string;
    val_id: string;
}

export interface ISSLCommerzFailedOrCancelPayload {
    tran_id: string;
}