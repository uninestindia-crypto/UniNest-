-- UniNest Performance Optimization: Database Indexes
-- Run this script in your Supabase SQL Editor (https://supabase.com/dashboard/project/YOUR_PROJECT_ID/sql)

-- ========================================
-- HIGH PRIORITY: Marketplace & Core Tables
-- ========================================

-- products: Used on every Marketplace page
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_seller_id ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);

-- orders: Used on Vendor/Buyer dashboards
CREATE INDEX IF NOT EXISTS idx_orders_vendor_id ON orders(vendor_id);
CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- followers: Critical for Social Feed and Profile pages
CREATE INDEX IF NOT EXISTS idx_followers_follower_id ON followers(follower_id);
CREATE INDEX IF NOT EXISTS idx_followers_following_id ON followers(following_id);

-- ========================================
-- MEDIUM PRIORITY: Workspace Tables
-- ========================================

-- internships: Deadline-based queries
CREATE INDEX IF NOT EXISTS idx_internships_deadline ON internships(deadline ASC);

-- competitions: Deadline-based queries
CREATE INDEX IF NOT EXISTS idx_competitions_deadline ON competitions(deadline ASC);

-- ========================================
-- OPTIONAL: If you notice slow likes/comments
-- ========================================

-- likes: Used for "isLiked" checks
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_post_id ON likes(post_id);

-- comments: Parent lookup
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);

-- ========================================
-- Done! Verify with EXPLAIN ANALYZE if needed.
-- ========================================
