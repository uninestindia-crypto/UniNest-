
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
        return NextResponse.json({ error: 'User ID is required.' }, { status: 400 });
    }

    // First, verify the user making the request is an admin
    const supabase = createServerClient();
    const { data: { user: requestingUser } } = await supabase.auth.getUser();

    if (!requestingUser || requestingUser.user_metadata?.role !== 'admin') {
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
        // Update auth user metadata
        const { data: { user: updatedUser }, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            userId,
            { user_metadata: { role: 'admin' } }
        );

        if (updateError) {
            throw updateError;
        }

        // Update public profiles table
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .update({ role: 'admin' })
            .eq('id', userId);

        if (profileError) {
            // Log this but don't fail the request, as the primary goal was met.
            console.error('Could not update role in public profiles table:', profileError);
        }

        return NextResponse.json({ message: `Successfully promoted user to admin.` });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
        console.error('Admin promotion error:', errorMessage);
        return NextResponse.json({ error: `Server error: ${errorMessage}` }, { status: 500 });
    }
}
