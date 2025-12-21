
'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { createClient as createServerClient } from '@/lib/supabase/server';

const getSupabaseAdmin = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Supabase service role key is not configured.');
    }
    return createClient(supabaseUrl, supabaseServiceKey);
}

/**
 * Helper function to create an audit log entry
 */
async function createAuditLog(
    supabaseAdmin: ReturnType<typeof getSupabaseAdmin>,
    adminId: string,
    action: string,
    details: string,
    targetType: string = 'product',
    targetId: string
) {
    try {
        await supabaseAdmin.from('audit_log').insert({
            admin_id: adminId,
            action,
            details,
            target_type: targetType,
            target_id: targetId,
        });
    } catch (e) {
        // Log error but don't fail the main action
        console.error('Failed to create audit log:', e);
    }
}

/**
 * Get the current admin user's ID
 */
async function getAdminUserId(): Promise<string | null> {
    try {
        const supabase = createServerClient();
        const { data: { user } } = await supabase.auth.getUser();
        return user?.id || null;
    } catch {
        return null;
    }
}

export async function deleteProductByAdmin(productId: number) {
    try {
        const supabaseAdmin = getSupabaseAdmin();
        const adminId = await getAdminUserId();

        // Get product name for audit log
        const { data: product } = await supabaseAdmin
            .from('products')
            .select('name')
            .eq('id', productId)
            .single();

        // Instead of deleting, we'll update the status to preserve data integrity
        const { error } = await supabaseAdmin
            .from('products')
            .update({ status: 'removed_by_admin' })
            .eq('id', productId);

        if (error) {
            return { error: error.message };
        }

        // Create audit log entry
        if (adminId) {
            await createAuditLog(
                supabaseAdmin,
                adminId,
                'product_removed',
                `Removed listing: "${product?.name || 'Unknown'}" (ID: ${productId})`,
                'product',
                String(productId)
            );
        }

        revalidatePath('/admin/listings');
        revalidatePath('/marketplace');
        return { error: null };
    } catch (e: any) {
        return { error: e.message };
    }
}

export async function approveProduct(productId: number) {
    try {
        const supabaseAdmin = getSupabaseAdmin();
        const adminId = await getAdminUserId();

        // Get product name for audit log
        const { data: product } = await supabaseAdmin
            .from('products')
            .select('name')
            .eq('id', productId)
            .single();

        const { error } = await supabaseAdmin
            .from('products')
            .update({ status: 'active' })
            .eq('id', productId);

        if (error) {
            return { error: error.message };
        }

        // Create audit log entry
        if (adminId) {
            await createAuditLog(
                supabaseAdmin,
                adminId,
                'product_approved',
                `Approved listing: "${product?.name || 'Unknown'}" (ID: ${productId})`,
                'product',
                String(productId)
            );
        }

        revalidatePath('/admin/listings');
        revalidatePath('/marketplace');
        return { error: null };
    } catch (e: any) {
        return { error: e.message };
    }
}

export async function rejectProduct(productId: number, reason?: string) {
    try {
        const supabaseAdmin = getSupabaseAdmin();
        const adminId = await getAdminUserId();

        // Get product name for audit log
        const { data: product } = await supabaseAdmin
            .from('products')
            .select('name')
            .eq('id', productId)
            .single();

        const updateData: { status: string; rejection_reason?: string } = {
            status: 'rejected'
        };
        if (reason) {
            updateData.rejection_reason = reason;
        }

        const { error } = await supabaseAdmin
            .from('products')
            .update(updateData)
            .eq('id', productId);

        if (error) {
            return { error: error.message };
        }

        // Create audit log entry
        if (adminId) {
            const details = reason
                ? `Rejected listing: "${product?.name || 'Unknown'}" (ID: ${productId}) - Reason: ${reason}`
                : `Rejected listing: "${product?.name || 'Unknown'}" (ID: ${productId})`;

            await createAuditLog(
                supabaseAdmin,
                adminId,
                'product_rejected',
                details,
                'product',
                String(productId)
            );
        }

        revalidatePath('/admin/listings');
        revalidatePath('/marketplace');
        return { error: null };
    } catch (e: any) {
        return { error: e.message };
    }
}
