// Run with: node scripts/apply_indexes.mjs
// Uses raw fetch to Supabase Management API for SQL execution

const SUPABASE_URL = 'https://dfkgefoqodjccrrqmqis.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRma2dlZm9xb2RqY2NycnFtcWlzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM0ODEyNCwiZXhwIjoyMDcyOTI0MTI0fQ.mAGzTPmDluMelD5E7Qjzm_l0qF0N9rPXbmh6U-Ztk9Y';

const indexStatements = [
    // HIGH PRIORITY: Marketplace & Core
    `CREATE INDEX IF NOT EXISTS idx_products_category ON products(category)`,
    `CREATE INDEX IF NOT EXISTS idx_products_seller_id ON products(seller_id)`,
    `CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC)`,

    `CREATE INDEX IF NOT EXISTS idx_orders_vendor_id ON orders(vendor_id)`,
    `CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON orders(buyer_id)`,
    `CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)`,
    `CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC)`,

    `CREATE INDEX IF NOT EXISTS idx_followers_follower_id ON followers(follower_id)`,
    `CREATE INDEX IF NOT EXISTS idx_followers_following_id ON followers(following_id)`,

    // MEDIUM PRIORITY: Workspace
    `CREATE INDEX IF NOT EXISTS idx_internships_deadline ON internships(deadline ASC)`,
    `CREATE INDEX IF NOT EXISTS idx_competitions_deadline ON competitions(deadline ASC)`,
];

async function executeSQL(sql) {
    // Using Supabase's pg_net or direct RPC - unfortunately Supabase REST API doesn't support DDL
    // We'll use the supabase-js approach via RPC if available
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
            'apikey': SERVICE_KEY,
            'Authorization': `Bearer ${SERVICE_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sql_query: sql }),
    });

    if (response.ok) {
        return { success: true };
    } else {
        const error = await response.text();
        return { success: false, error };
    }
}

async function applyIndexes() {
    console.log('🚀 Applying database indexes to Supabase...\n');

    let successCount = 0;
    let failCount = 0;

    for (const sql of indexStatements) {
        const result = await executeSQL(sql);
        if (result.success) {
            console.log(`✅ ${sql.substring(0, 55)}...`);
            successCount++;
        } else {
            console.log(`⚠️  ${sql.substring(0, 55)}...`);
            failCount++;
        }
    }

    console.log(`\n📊 Results: ${successCount} succeeded, ${failCount} need manual execution.`);

    if (failCount > 0) {
        console.log('\n⚠️  Some indexes require manual execution.');
        console.log('   Open: https://supabase.com/dashboard/project/dfkgefoqodjccrrqmqis/sql');
        console.log('   Run the contents of: scripts/supabase_indexes.sql');
    }
}

applyIndexes().catch(console.error);
