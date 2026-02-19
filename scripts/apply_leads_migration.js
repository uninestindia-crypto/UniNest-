const fs = require('fs');
const path = require('path');

// Manually parse .env file
const envPath = path.join(process.cwd(), '.env');
const envData = fs.readFileSync(envPath, 'utf8');
const env = {};
envData.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
        let value = valueParts.join('=').trim();
        if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
        env[key.trim()] = value;
    }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_KEY in .env');
    process.exit(1);
}

async function runMigration() {
    const migrationPath = path.join(process.cwd(), 'docs/automation_of_administrative_task/LEAD_MANAGEMENT_SCHEMA.sql');

    if (!fs.existsSync(migrationPath)) {
        console.error(`Migration file not found at ${migrationPath}`);
        process.exit(1);
    }

    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log(`🚀 Starting migration via Supabase RPC...\n`);

    const endpoints = [
        { name: 'execute_sql', param: 'query' },
        { name: 'exec_sql', param: 'sql_query' },
    ];
    let success = false;

    for (const endpoint of endpoints) {
        console.log(`Trying RPC: ${endpoint.name}(${endpoint.param})...`);
        try {
            const body = {};
            body[endpoint.param] = sql;

            const response = await fetch(`${supabaseUrl}/rest/v1/rpc/${endpoint.name}`, {
                method: 'POST',
                headers: {
                    'apikey': supabaseServiceKey,
                    'Authorization': `Bearer ${supabaseServiceKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            if (response.ok) {
                console.log(`  ✅ Success (via ${endpoint.name})`);
                success = true;
                break;
            } else {
                const errorText = await response.text();
                console.log(`  ⚠️  ${endpoint.name} returned: ${response.status} ${response.statusText}`);
                console.log(`     Data: ${errorText}`);
            }
        } catch (err) {
            console.error(`  ❌ Error calling ${endpoint.name}:`, err.message);
        }
    }

    if (!success) {
        console.log('\n❌ Migration failed. Please run the SQL manually in Supabase SQL Editor:');
        console.log(`URL: ${supabaseUrl.replace('.supabase.co', '')}.supabase.com/dashboard/project/${env.NEXT_PUBLIC_SUPABASE_URL.split('//')[1].split('.')[0]}/sql`);
    } else {
        console.log('\n✅ Migration finished successfully.');
    }
}

runMigration().catch(console.error);
