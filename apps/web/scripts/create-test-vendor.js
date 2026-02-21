const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manually parse .env since dotenv is not available
const envPath = path.join(__dirname, '..', '.env');
try {
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
        const match = line.match(/^([^#=]+)=(.*)$/);
        if (match) {
            let val = match[2].trim();
            if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
            if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
            process.env[match[1]] = val;
        }
    });
} catch (e) {
    console.log("Could not read .env file", e);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in environment");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createVendor() {
    const email = 'test-vendor@uninest.co.in';
    const password = 'TestVendor123!';

    console.log(`Checking for existing user: ${email}`);

    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    if (!listError && users?.users) {
        const existingUser = users.users.find(u => u.email === email);
        if (existingUser) {
            console.log(`User exists, deleting: ${existingUser.id}`);
            await supabase.auth.admin.deleteUser(existingUser.id);
        }
    }

    console.log(`Creating user: ${email}`);
    const { data: userAuth, error: createError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
            role: 'vendor',
            full_name: 'Test Vendor User',
            handle: 'test_vendor'
        }
    });

    if (createError) {
        console.error("Error creating user:", createError);
        return;
    }

    const userId = userAuth.user.id;
    console.log(`User created successfully! ID: ${userId}`);

    const { error: profileError } = await supabase.from('profiles').upsert({
        id: userId,
        full_name: 'Test Vendor User',
        handle: 'test_vendor',
        role: 'vendor'
    });

    if (profileError) {
        console.error("Error creating profile:", profileError);
        return;
    }

    console.log("Profile created successfully!");
    console.log("--- TEST VENDOR CREDENTIALS ---");
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log("-------------------------------");
}

createVendor();
