// Run with: node scripts/apply_indexes.js
// Uses the service key from environment or .env file

require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_KEY in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const indexStatements = [
    // HIGH PRIORITY: Marketplace & Core
    `CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);`,
    `CREATE INDEX IF NOT EXISTS idx_products_seller_id ON products(seller_id);`,
    `CREATE INDEX IF NOT EXISTS idx_products_status ON products(status) WHERE status = 'active';`,
    `CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);`,

    `CREATE INDEX IF NOT EXISTS idx_orders_vendor_id ON orders(vendor_id);`,
    `CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON orders(buyer_id);`,
    `CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);`,
    `CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);`,

    `CREATE INDEX IF NOT EXISTS idx_followers_follower_id ON followers(follower_id);`,
    `CREATE INDEX IF NOT EXISTS idx_followers_following_id ON followers(following_id);`,

    // MEDIUM PRIORITY: Workspace
    `CREATE INDEX IF NOT EXISTS idx_internships_deadline ON internships(deadline ASC);`,
    `CREATE INDEX IF NOT EXISTS idx_competitions_deadline ON competitions(deadline ASC);`,

    // OPTIONAL: Likes & Comments
    `CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id);`,
    `CREATE INDEX IF NOT EXISTS idx_likes_post_id ON likes(post_id);`,
    `CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);`,
];

async function applyIndexes() {
    console.log('Applying database indexes...\n');

    for (const sql of indexStatements) {
        try {
            const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
            if (error) {
                // Try raw query via postgrest (won't work, but log it)
                console.log(`⚠️  Cannot execute: ${sql.substring(0, 60)}...`);
                console.log(`   Reason: Supabase JS client doesn't support raw DDL. Use SQL Editor.`);
            } else {
                console.log(`✅ ${sql.substring(0, 60)}...`);
            }
        } catch (e) {
            console.log(`❌ Error: ${e.message}`);
        }
    }

    console.log('\n⚠️  If indexes weren\'t created, run scripts/supabase_indexes.sql in Supabase SQL Editor.');
}

applyIndexes();
