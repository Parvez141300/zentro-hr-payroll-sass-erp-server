import { PaymentGateway, PaymentStatus, SubscriptionPlan, SubscriptionStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { envVars } from "../../utils/env";
import { ISSLCommerzFailedOrCancelPayload, ISSLCommerzInitiatePaymentPayload, ISSLCommerzSuccessPayload } from "./sslCommerz.interface";
import SSLCommerzPayment from "sslcommerz-lts";

const initiateSSLCommerzPaymentInDB = async (payload: ISSLCommerzInitiatePaymentPayload) => {
    const { companyId, userId, planName, successUrl, cancelUrl, failUrl } = payload;

    // validation check
    const isExistCompany = await prisma.company.findUnique({
        where: {
            id: companyId,
        }
    });

    if (!isExistCompany) {
        throw new Error("Company not found for create stripe checkout session");
    }

    const isExistUser = await prisma.user.findUnique({
        where: {
            id: userId,
            companyId: companyId,
        }
    });

    if (!isExistUser) {
        throw new Error("User not found for create stripe checkout session");
    }

    const isExistSuperAdmin = await prisma.superAdmin.findUnique({
        where: {
            id: isExistCompany.id,
            userId: isExistUser.id,
        }
    });

    if (!isExistSuperAdmin) {
        throw new Error("Super admin not found for create stripe checkout session");
    }

    const isExistsSubscriptionPlanConfig = await prisma.subscriptionPlanConfig.findUnique({
        where: {
            name: planName as SubscriptionPlan,
        }
    });

    if (!isExistsSubscriptionPlanConfig) {
        throw new Error("Subscription plan config not found for create stripe checkout session");
    }

    const transactionId = `txn-${Date.now()}-${isExistCompany.id}`;

    // create payment record (pending)
    const payment = await prisma.payment.create({
        data: {
            companyId: isExistCompany.id,
            gateway: PaymentGateway.SSLCOMMERZ,
            plan: planName as SubscriptionPlan,
            amountBDT: isExistsSubscriptionPlanConfig.priceBDT,
            status: PaymentStatus.PENDING,
            transactionId: transactionId,
        }
    });

    // ssl commerz payment data
    const data = {
        total_amount: isExistsSubscriptionPlanConfig.priceBDT,
        currency: 'BDT',
        tran_id: transactionId, // use unique tran_id for each api call
        success_url: successUrl || `${envVars.BACKEND_URL}/api/v1/sslcommerz/success`,
        fail_url: failUrl || `${envVars.BACKEND_URL}/api/v1/sslcommerz/fail`,
        cancel_url: cancelUrl || `${envVars.BACKEND_URL}/api/v1/sslcommerz/cancel`,
        ipn_url: `${envVars.BACKEND_URL}/api/v1/sslcommerz/ipn`,
        product_name: `Zentro ${isExistsSubscriptionPlanConfig.displayName} Plan`,
        product_category: 'Software Subscription',
        product_profile: 'general',
        cus_name: isExistUser.name || isExistCompany.name,
        cus_email: isExistUser.email || isExistCompany.email,
        cus_add1: isExistCompany.address || '',
        cus_city: 'Dhaka',
        cus_country: 'Bangladesh',
        cus_phone: isExistCompany.phone || isExistSuperAdmin.phone || "",
        shipping_method: 'NO',
        num_of_item: 1,
        value_a: isExistCompany.id,
        value_b: isExistSuperAdmin.id,
        value_c: isExistUser.id,
        value_d: isExistsSubscriptionPlanConfig.name,
    };

    const sslcz = new SSLCommerzPayment(envVars.SSLCOMMERZ.SSLCOMMERZ_STORE_ID, envVars.SSLCOMMERZ.SSLCOMMERZ_STORE_PASSWORD, envVars.SSLCOMMERZ.SSLCOMMERZ_IS_LIVE);
    const response = await sslcz.init(data);

    // udpdate payment ssl session key
    await prisma.payment.update({
        where: {
            id: payment.id,
        },
        data: {
            sslSessionKey: response.sessionkey,
        }
    });

    return {
        url: response.GatewayPageURL,
        paymentId: payment.id,
        transactionId: transactionId,
        sessionId: response.sessionkey,
    };
}

const handleSSLCommerzSuccessInDB = async (payload: ISSLCommerzSuccessPayload) => {
    const { status, tran_id, val_id } = payload;

    if (status !== "VALID") {
        throw new Error("Payment failed for ssl commerz success");
    }

    const payment = await prisma.payment.findUnique({
        where: {
            transactionId: tran_id,
        }
    });

    if (!payment) {
        throw new Error("Payment not found for ssl commerz success");
    }

    const sslcz = new SSLCommerzPayment(envVars.SSLCOMMERZ.SSLCOMMERZ_STORE_ID, envVars.SSLCOMMERZ.SSLCOMMERZ_STORE_PASSWORD, envVars.SSLCOMMERZ.SSLCOMMERZ_IS_LIVE);

    const validation = await sslcz.validate({ val_id });

    if (validation.status === "VALID" || validation.status === "VALIDATED") {
        const updatedPayment = await prisma.payment.update({
            where: {
                id: payment.id,
            },
            data: {
                sslValId: val_id,
                status: PaymentStatus.SUCCESS,
                paidAt: new Date(),
                subscriptionStart: new Date(),
                // 30 days
                subscriptionEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            }
        });

        // get subscription plan config
        const subscriptionPlanConfig = await prisma.subscriptionPlanConfig.findUnique({
            where: {
                name: updatedPayment.plan,
            }
        });

        // update company subscription plan
        await prisma.company.update({
            where: {
                id: payment.companyId,
            },
            data: {
                subscriptionPlan: payment.plan,
                subscriptionStatus: SubscriptionStatus.ACTIVE,
                subscriptionExpiry: updatedPayment.subscriptionEnd,
                maxEmployees: subscriptionPlanConfig!.maxEmployees || 10,
            }
        });

        // Create subscription history
        await prisma.subscriptionHistory.create({
            data: {
                companyId: payment.companyId,
                plan: payment.plan,
                status: 'ACTIVE',
                startDate: updatedPayment.subscriptionStart!,
                endDate: updatedPayment.subscriptionEnd!,
                paymentId: payment.id,
            }
        });

        return { message: `${envVars.FRONTEND_URL}/dashboard/settings/billing?payment=success` };
    }
    else {
        return { message: `${process.env.FRONTEND_URL}/dashboard/settings/billing?payment=failed` };
    }
}

const handleSSLCommerzFailInDB = async (payload: ISSLCommerzFailedOrCancelPayload) => {
    const { tran_id } = payload;

    await prisma.payment.update({
        where: {
            transactionId: tran_id,
        },
        data: {
            status: PaymentStatus.FAILED,
        }
    });

    return { message: `${process.env.FRONTEND_URL}/dashboard/settings/billing?payment=failed` };
}

const handleSSLCommerzCancelInDB = async (payload: ISSLCommerzFailedOrCancelPayload) => {
    const { tran_id } = payload;

    if (tran_id) {
        await prisma.payment.updateMany({
            where: { sslTranId: tran_id },
            data: { status: 'CANCELLED' }
        });
    }

    return { message: `${process.env.FRONTEND_URL}/dashboard/settings/billing?payment=failed` };
};

export const sslCommerzService = {
    initiateSSLCommerzPaymentInDB,
    handleSSLCommerzSuccessInDB,
    handleSSLCommerzFailInDB,
    handleSSLCommerzCancelInDB,
}