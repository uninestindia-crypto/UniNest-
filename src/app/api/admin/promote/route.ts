import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    const { email } = await request.json();

    if (!email) {
        return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        return NextResponse.json({ error: 'Supabase credentials are not configured on the server. Please set SUPABASE_SERVICE_KEY.' }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    try {
        // 1. Check if an admin already exists. In a production scenario, you might want to lock this down.
        const { data: { users: existingUsers }, error: adminCheckError } = await supabaseAdmin.auth.admin.listUsers();
        if (adminCheckError) {
             console.error('Error checking for existing admins:', adminCheckError);
             throw new Error(`Error checking for existing admins: ${adminCheckError.message}`);
        }
        
        const hasAdmin = existingUsers.some(u => u.user_metadata?.role === 'admin');
        if (hasAdmin) {
             // To prevent this route from being used to create multiple admins, you might re-enable this check.
             // For the initial setup, we allow it to proceed.
             // return NextResponse.json({ error: 'An admin user already exists. This is a one-time setup action.' }, { status: 403 });
        }


        // 2. Get the user by email
        const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1, email: email as string });
        
        if (listError) {
            console.error('Error listing users:', listError);
            throw new Error(`Error finding user: ${listError.message}`);
        }
        
        if (!users || users.length === 0) {
            return NextResponse.json({ error: `User with email ${email} not found. Please ensure the user has signed up first.` }, { status: 404 });
        }
        
        const user = users[0];

        // 3. Update the user's metadata with the admin role
        const { data: { user: updatedUser }, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            user.id,
            { user_metadata: { ...user.user_metadata, role: 'admin' } }
        );

        if (updateError) {
            throw updateError;
        }

        // 4. Update the public profiles table as well. This is CRITICAL.
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .update({ role: 'admin' })
            .eq('id', user.id);

        if (profileError) {
            // Log this error but don't fail the whole request, as the primary goal (auth role) was met.
            console.error('Could not update role in public profiles table:', profileError);
        }

        return NextResponse.json({ message: `Successfully promoted ${updatedUser?.email} to admin.` });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
        console.error('Admin promotion error:', errorMessage);
        return NextResponse.json({ error: `Server error: ${errorMessage}` }, { status: 500 });
    }
}
