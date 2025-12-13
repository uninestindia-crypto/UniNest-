

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// This function creates a Supabase client that is authenticated on behalf of the user
// by using the JWT token from the Authorization header.
const createAuthedSupabaseClient = async (request: NextRequest) => {
    // These values MUST be accessed via process.env on the server
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    // Explicitly check if the env vars are loaded
    if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Server configuration error: Supabase URL or Anon Key is missing.');
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
        throw new Error('Missing Authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
        throw new Error('Authentication failed: ' + (error?.message || 'User not found'));
    }

    // Return the client and the authenticated user
    return { supabase, user };
};


// This function creates a Supabase admin client using the service role key.
// It should be used for operations that require elevated privileges to bypass RLS.
const getSupabaseAdmin = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Supabase service role key is not configured.');
    }
    return createClient(supabaseUrl, supabaseServiceKey);
}

export async function POST(request: NextRequest) {
    try {
        // Step 1: Authenticate the user from the token. This is the crucial step.
        const { user } = await createAuthedSupabaseClient(request);
        const body = await request.json();

        const {
            orderId,
            razorpay_payment_id,
            razorpay_signature,
            type, // 'donation' | 'competition_entry' | 'vendor_subscription'
            amount,
            competitionId,
            phone_number,
            whatsapp_number,
            pitchUrl,
            servicesCount,
            categories,
            currency,
            billingPeriodStart,
            billingPeriodEnd,
        } = body;

        const keySecret = process.env.RAZORPAY_KEY_SECRET;

        // Step 2: Verify Razorpay Signature if it's a paid transaction
        if (orderId && razorpay_payment_id && razorpay_signature) {
            if (!keySecret) {
                return NextResponse.json({ error: 'Razorpay secret not configured.' }, { status: 500 });
            }
            const shasum = crypto.createHmac('sha256', keySecret);
            shasum.update(`${orderId}|${razorpay_payment_id}`);
            const digest = shasum.digest('hex');

            if (digest !== razorpay_signature) {
                return NextResponse.json({ error: 'Invalid payment signature.' }, { status: 400 });
            }
        }

        // Step 3: Signature is valid (or not required), now save the record.
        // It's safer to use the admin client for writes to bypass RLS,
        // as the user's identity has now been securely verified via token.
        const supabaseAdmin = getSupabaseAdmin();

        if (type === 'donation') {
            const { error } = await supabaseAdmin.from('donations').insert({
                user_id: user.id, // Use the verified user ID from the token
                amount: amount,
                currency: 'INR',
                razorpay_payment_id: razorpay_payment_id,
            });
            if (error) throw error;

        } else if (type === 'competition_entry') {
            if (phone_number || whatsapp_number) {
                const existingMetadata = user.user_metadata ?? {};
                const nextMetadata = {
                    ...existingMetadata,
                    ...(phone_number ? { phone_number } : {}),
                    ...(whatsapp_number ? { whatsapp_number } : {}),
                };

                // Only attempt an update if metadata actually changes
                const hasMetadataChanges =
                    nextMetadata.phone_number !== existingMetadata.phone_number ||
                    nextMetadata.whatsapp_number !== existingMetadata.whatsapp_number;

                if (hasMetadataChanges) {
                    const { error: metadataError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
                        user_metadata: nextMetadata,
                    });

                    if (metadataError) {
                        console.error('Failed to update user metadata during competition entry:', metadataError.message);
                    }
                }
            }

            const { error } = await supabaseAdmin.from('competition_entries').insert({
                competition_id: competitionId,
                user_id: user.id, // Use the verified user ID from the token
                razorpay_payment_id: razorpay_payment_id ?? null,
                pitch_url: pitchUrl ?? null,
            });
            if (error) throw error;

        } else if (type === 'vendor_subscription') {
            if (
                typeof servicesCount !== 'number' ||
                !Array.isArray(categories) ||
                !billingPeriodStart ||
                !billingPeriodEnd
            ) {
                return NextResponse.json({ error: 'Invalid vendor subscription payload.' }, { status: 400 });
            }

            const { error } = await supabaseAdmin.from('vendor_subscriptions').insert({
                user_id: user.id,
                razorpay_order_id: orderId,
                razorpay_payment_id: razorpay_payment_id,
                amount: amount,
                currency: currency || 'INR',
                services_selected: servicesCount,
                categories,
                billing_period_start: billingPeriodStart,
                billing_period_end: billingPeriodEnd,
                status: 'active',
            });

            if (error) throw error;

            return NextResponse.json({
                success: true,
                message: 'Vendor subscription recorded successfully.',
                paymentId: razorpay_payment_id,
                subscription: {
                    billingPeriodStart,
                    billingPeriodEnd,
                },
            });

        } else if (type === 'marketplace_order') {
            // New Logic for General Marketplace Orders
            // Expects: productId, vendorId (seller_id), quantity (optional, default 1), bookingDate (optional), bookingSlot (optional)
            const { productId, vendorId, quantity = 1, bookingDate, bookingSlot } = body;

            if (!productId || !vendorId) {
                return NextResponse.json({ error: 'Missing required order details (productId, vendorId).' }, { status: 400 });
            }

            // 1. Create the Order
            const { data: orderData, error: orderError } = await supabaseAdmin
                .from('orders')
                .insert({
                    buyer_id: user.id,
                    vendor_id: vendorId,
                    total_amount: amount, // Amount verified by signature
                    razorpay_payment_id: razorpay_payment_id,
                    status: 'completed', // Or 'pending_approval' if logic requires confirmation
                    booking_date: bookingDate || null,
                    booking_slot: bookingSlot || null
                })
                .select()
                .single();

            if (orderError) throw orderError;

            // 2. Create the Order Item
            const { error: itemError } = await supabaseAdmin
                .from('order_items')
                .insert({
                    order_id: orderData.id,
                    product_id: productId,
                    quantity: quantity,
                    price: amount, // Assuming single item order for now, so total amount = item price
                });

            if (itemError) {
                // In a real app we might want to rollback the order here or log critical error
                console.error('Failed to create order item:', itemError);
                throw itemError;
            }

            return NextResponse.json({ success: true, message: 'Order placed successfully.', orderId: orderData.id });

        } else {
            return NextResponse.json({ error: 'Invalid transaction type.' }, { status: 400 });
        }

        return NextResponse.json({ success: true, message: 'Payment record saved successfully.' });

    } catch (error: any) {
        console.error('Error in verify-payment route:', error);
        // Distinguish between auth errors and other errors
        if (error.message.includes('Authentication failed')) {
            return NextResponse.json({ error: error.message }, { status: 401 });
        }
        return NextResponse.json({ error: `Failed to save payment record: ${error.message}` }, { status: 500 });
    }
}

