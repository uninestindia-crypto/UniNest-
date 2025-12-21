
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';

/**
 * SECURITY: This endpoint verifies admin status from the database (profiles table)
 * instead of trusting JWT claims which can be manipulated.
 */
export async function POST(request: NextRequest) {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
        return NextResponse.json({ error: 'User ID is required.' }, { status: 400 });
    }

    // First, verify the user making the request is authenticated
    const supabase = createServerClient();
    const { data: { user: requestingUser } } = await supabase.auth.getUser();

    if (!requestingUser) {
        return NextResponse.json({ error: 'Unauthorized: You must be logged in.' }, { status: 401 });
    }

    // SECURITY: Verify admin role from DATABASE, not JWT claims
    const { data: adminProfile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', requestingUser.id)
        .single();

    if (profileError || !adminProfile || adminProfile.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden: Only admins can perform this action.' }, { status: 403 });
    }

    // Now, use the service key to perform the admin action
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        return NextResponse.json({ error: 'Supabase credentials are not configured on the server.' }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    try {
        // Get the target user first to preserve existing metadata
        const { data: { user: targetUser }, error: getUserError } = await supabaseAdmin.auth.admin.getUserById(userId);

        if (getUserError || !targetUser) {
            return NextResponse.json({ error: 'Target user not found.' }, { status: 404 });
        }

        // Update auth user metadata (preserve existing metadata)
        const { data: { user: updatedUser }, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            userId,
            { user_metadata: { ...targetUser.user_metadata, role: 'admin' } }
        );

        if (updateError) {
            throw updateError;
        }

        // Update public profiles table
        const { error: profileUpdateError } = await supabaseAdmin
            .from('profiles')
            .update({ role: 'admin' })
            .eq('id', userId);

        if (profileUpdateError) {
            console.error('Could not update role in public profiles table:', profileUpdateError);
        }

        return NextResponse.json({ message: `Successfully promoted user to admin.` });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
        console.error('Admin promotion error:', errorMessage);
        return NextResponse.json({ error: `Server error: ${errorMessage}` }, { status: 500 });
    }
}

