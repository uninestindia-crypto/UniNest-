const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

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

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
    const migrationPath = path.join(process.cwd(), '.gemini/antigravity/brain/a663e7a5-d0d2-4091-bb29-bd56fd47c84a/e2ee_migration.sql');
    // If the brain path is relative or different, we adjust. 
    // Let's use the absolute path I know from the artifact directory.
    const absoluteMigrationPath = 'C:\\Users\\user\\.gemini\\antigravity\\brain\\a663e7a5-d0d2-4091-bb29-bd56fd47c84a\\e2ee_migration.sql';

    if (!fs.existsSync(absoluteMigrationPath)) {
        console.error(`Migration file not found at ${absoluteMigrationPath}`);
        process.exit(1);
    }

    const sql = fs.readFileSync(absoluteMigrationPath, 'utf8');
    const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`Starting migration with ${statements.length} statements...\n`);

    for (const statement of statements) {
        console.log(`Executing: ${statement.substring(0, 100)}...`);
        // Try exec_sql first as seen in existing scripts
        const { error } = await supabase.rpc('exec_sql', { sql_query: statement });

        if (error) {
            // Try execute_sql as seen in another script
            console.log('  exec_sql failed, trying execute_sql...');
            const { error: error2 } = await supabase.rpc('execute_sql', { sql_query: statement });
            if (error2) {
                console.error(`  ❌ Error: ${error2.message}`);
                // Continue anyway, maybe some parts worked or already exist
            } else {
                console.log('  ✅ Success (via execute_sql)');
            }
        } else {
            console.log('  ✅ Success (via exec_sql)');
        }
    }

    console.log('\nMigration finished.');
}

runMigration();
