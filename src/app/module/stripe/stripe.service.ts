


const handleStripeWebhookInDB = async (payload: Record<string, unknown>, signature: string) => {
    console.log(payload, signature, "this is from the stripe webhook");
    return true;
};

export const stripeService = { 
    handleStripeWebhookInDB 
};