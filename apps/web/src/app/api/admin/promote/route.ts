import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

/**
 * SECURITY: This endpoint is protected by ADMIN_SETUP_SECRET environment variable.
 * It should only be used for initial admin setup.
 * After the first admin is created, this endpoint will block further promotions
 * unless called by an existing admin.
 */
export async function POST(request: NextRequest) {
    // SECURITY: Rate limit this sensitive endpoint
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const rateLimitResult = checkRateLimit(`admin-promote:${ip}`, RATE_LIMITS.ADMIN_SETUP);

    if (!rateLimitResult.success) {
        return NextResponse.json(
            { error: 'Too many attempts. Please try again later.' },
            { status: 429, headers: { 'Retry-After': String(Math.ceil(rateLimitResult.resetIn / 1000)) } }
        );
    }

    const body = await request.json();
    const { email, setupSecret } = body;

    if (!email) {
        return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
    const adminSetupSecret = process.env.ADMIN_SETUP_SECRET;

    if (!supabaseUrl || !supabaseServiceKey) {
        return NextResponse.json({ error: 'Supabase credentials are not configured on the server.' }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });

    try {
        // 1. Check if an admin already exists
        const { data: { users: existingUsers }, error: adminCheckError } = await supabaseAdmin.auth.admin.listUsers();
        if (adminCheckError) {
            console.error('Error checking for existing admins:', adminCheckError);
            throw new Error(`Error checking for existing admins: ${adminCheckError.message}`);
        }

        const hasAdmin = existingUsers.some(u => u.user_metadata?.role === 'admin');

        // 2. Security: Require setup secret for initial admin creation
        if (!hasAdmin) {
            // First admin setup - require the setup secret
            if (!adminSetupSecret) {
                return NextResponse.json({
                    error: 'ADMIN_SETUP_SECRET environment variable is not configured. Cannot create first admin.'
                }, { status: 500 });
            }

            if (setupSecret !== adminSetupSecret) {
                return NextResponse.json({
                    error: 'Invalid setup secret. Admin promotion is protected.'
                }, { status: 403 });
            }
        } else {
            // Admin already exists - this endpoint should not be used
            // Use /api/admin/promote-user instead (which requires existing admin auth)
            return NextResponse.json({
                error: 'An admin already exists. Use the admin panel to promote additional users.'
            }, { status: 403 });
        }

        // 3. Get the user by email
        const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 });

        if (listError) {
            console.error('Error listing users:', listError);
            throw new Error(`Error finding user: ${listError.message}`);
        }

        const user = users?.find(u => u.email?.toLowerCase() === (email as string).toLowerCase());

        if (!user) {
            return NextResponse.json({ error: `User with email ${email} not found. Please ensure the user has signed up first.` }, { status: 404 });
        }

        // 4. Update the user's metadata with the admin role
        const { data: { user: updatedUser }, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            user.id,
            { user_metadata: { ...user.user_metadata, role: 'admin' } }
        );

        if (updateError) {
            throw updateError;
        }

        // 5. Update the public profiles table as well
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .update({ role: 'admin' })
            .eq('id', user.id);

        if (profileError) {
            console.error('Could not update role in public profiles table:', profileError);
        }

        return NextResponse.json({ message: `Successfully promoted ${updatedUser?.email} to admin.` });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
        console.error('Admin promotion error:', errorMessage);
        return NextResponse.json({ error: `Server error: ${errorMessage}` }, { status: 500 });
    }
}

