'use server';

export async function saveCompetitionEntry(formData: FormData) {
    return { error: null, orderId: "mock_order_123", invoiceId: "mock_inv_123" };
}

export async function verifyPayment(
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string,
    invoiceId: string
) {
    return { error: null, success: true };
}
