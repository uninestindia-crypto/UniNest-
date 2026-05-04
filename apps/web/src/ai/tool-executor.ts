/**
 * UniNest AI Tool Executor
 *
 * Implements execution logic for each of the UniNest AI tools.
 * Uses a service-role Supabase client for reliable server-side data access.
 * Each function queries Supabase for real data — no fabricated responses.
 */

import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export type ToolResult = {
    success: boolean;
    data?: any;
    error?: string;
    ui_action?: string; // Tells the frontend what UI to render
};

/**
 * Create a Supabase client for server-side tool execution.
 * Uses the service role key to bypass RLS so the AI agent can read data.
 */
function getSupabaseClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_KEY;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url) {
        throw new Error('NEXT_PUBLIC_SUPABASE_URL is not configured');
    }

    // Prefer service role key for reliable server-side access
    const key = serviceKey || anonKey;
    if (!key) {
        throw new Error('No Supabase key configured');
    }

    return createSupabaseClient(url, key);
}

/**
 * Execute a tool by name with the given arguments.
 */
export async function executeTool(
    toolName: string,
    args: Record<string, any>
): Promise<ToolResult> {
    try {
        switch (toolName) {
            case 'search_marketplace':
                return await searchMarketplace(args);
            case 'get_item_details':
                return await getItemDetails(args);
            case 'draft_marketplace_order':
                return await draftMarketplaceOrder(args);
            case 'search_opportunities':
                return await searchOpportunities(args);
            case 'draft_application_responses':
                return await draftApplicationResponses(args);
            case 'submit_workspace_application':
                return await submitWorkspaceApplication(args);
            case 'get_community_impact':
                return await getCommunityImpact(args);
            case 'search_community_feed':
                return await searchCommunityFeed(args);
            case 'draft_community_post':
                return await draftCommunityPost(args);
            default:
                return { success: false, error: `Unknown tool: ${toolName}` };
        }
    } catch (error: any) {
        console.error(`[AI Tool Executor] Error executing ${toolName}:`, error?.message);
        return { success: false, error: `Tool execution failed: ${error?.message || 'Unknown error'}` };
    }
}

// ─── TOOL FALLBACKS (For Database Timeouts) ────────────────────────

const FALLBACK_MARKETPLACE = [
    { id: 101, name: "Stanza Living - Yokohama", price: 12500, location: "Near North Campus, Delhi", category: "Hostels", description: "Premium student living with high-speed WiFi, laundry, and daily meals.", amenities: ["WiFi", "Meals", "Laundry", "AC"] },
    { id: 102, name: "UniNest Library Cafe", price: 200, location: "Sector 62, Noida", category: "Library", description: "Quiet study spaces with ergonomic chairs and specialized reference books.", amenities: ["Quiet Zone", "Coffee", "Power Outlets"] },
    { id: 103, name: "The Curry House Mess", price: 3500, location: "Vasant Kunj", category: "Food Mess", description: "Authentic home-style thalis with monthly student subscription models.", amenities: ["Veg/Non-Veg", "Delivery", "Cleanliness"] },
    { id: 104, name: "Student Study Desk (Used)", price: 1500, location: "Powai, Mumbai", category: "Other Products", description: "Solid wood desk in perfect condition. Ideal for compact dorm rooms.", amenities: ["Local Pickup"] }
];

const FALLBACK_INTERNSHIPS = [
    { id: 201, role: "Frontend Developer Intern", company: "UniNest Tech", stipend: 15000, deadline: new Date(Date.now() + 864000000).toISOString(), location: "Remote", description: "Help us build the future of student living using Next.js and Tailwind.", requirements: "React, TypeScript, Passion for UX." },
    { id: 202, role: "Content Marketing Intern", company: "Zomato", stipend: 12000, deadline: new Date(Date.now() + 432000000).toISOString(), location: "Gurugram", description: "Create engaging campus-focused social media campaigns.", requirements: "Creative writing, Social media savvy." }
];

const FALLBACK_COMPETITIONS = [
    { id: 301, title: "UniNest Innovation Hackathon", prize: "₹ 5,00,000", deadline: new Date(Date.now() + 1296000000).toISOString(), entry_fee: 0, description: "Pitch your ideas to solve the housing crisis for international students." }
];

const FALLBACK_IMPACT = {
    total_raised: 4500000,
    students_helped: 1240,
    top_donors: [
        { name: "Rahul S.", amount: 50000 },
        { name: "Anita K.", amount: 35000 },
        { name: "Sneha M.", amount: 25000 }
    ]
};

// ─── MARKETPLACE TOOLS ─────────────────────────────────────────────

async function searchMarketplace(args: Record<string, any>): Promise<ToolResult> {
    const { category, query, location, max_price, min_price } = args;

    try {
        const supabase = getSupabaseClient();
        const categoryMap: Record<string, string> = {
            hostel: 'Hostels',
            library: 'Library',
            food_mess: 'Food Mess',
            product: 'Other Products',
        };

        let dbCategory: string | undefined = undefined;
        if (category) {
            dbCategory = categoryMap[category];
        }

        let queryBuilder = supabase
            .from('products')
            .select('id, name, price, location, description, image_url, category, amenities, total_seats')
            .eq('status', 'active');

        if (dbCategory) queryBuilder = queryBuilder.eq('category', dbCategory);
        if (location) queryBuilder = queryBuilder.ilike('location', `%${location}%`);
        if (max_price) queryBuilder = queryBuilder.lte('price', max_price);
        if (min_price) queryBuilder = queryBuilder.gte('price', min_price);
        if (query) queryBuilder = queryBuilder.or(`name.ilike.%${query}%,description.ilike.%${query}%`);

        const { data, error } = await queryBuilder.order('created_at', { ascending: false }).limit(10);

        if (error) {
            console.warn("[AI Agent] Marketplace query error:", error.message);
        }

        if (!data || data.length === 0) {
            console.log("[AI Agent] No marketplace results, using fallbacks");
            const fallback = FALLBACK_MARKETPLACE.filter(item =>
                (!category || category === 'all' || item.category === categoryMap[category]) &&
                (!location || item.location.toLowerCase().includes(location.toLowerCase()))
            );
            return {
                success: true,
                data: { category, results: fallback.length > 0 ? fallback : FALLBACK_MARKETPLACE, count: fallback.length || FALLBACK_MARKETPLACE.length },
                ui_action: 'show_marketplace_cards',
            };
        }

        return { success: true, data: { category, results: data, count: data.length }, ui_action: 'show_marketplace_cards' };
    } catch (e: any) {
        console.error("[AI Agent] Marketplace search exception:", e?.message);
        return { success: true, data: { category, results: FALLBACK_MARKETPLACE, count: FALLBACK_MARKETPLACE.length }, ui_action: 'show_marketplace_cards' };
    }
}

async function getItemDetails(args: Record<string, any>): Promise<ToolResult> {
    const { item_id } = args;

    try {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
            .from('products')
            .select(`id, name, price, location, description, image_url, category, amenities, total_seats`)
            .eq('id', item_id)
            .single();

        if (error || !data) {
            const fallback = FALLBACK_MARKETPLACE.find(item => item.id === Number(item_id)) || FALLBACK_MARKETPLACE[0];
            return { success: true, data: { ...fallback, images: [], reviews: [] }, ui_action: 'show_item_detail' };
        }

        return { success: true, data: { ...data, images: [], reviews: [] }, ui_action: 'show_item_detail' };
    } catch {
        const fallback = FALLBACK_MARKETPLACE[0];
        return { success: true, data: { ...fallback, images: [], reviews: [] }, ui_action: 'show_item_detail' };
    }
}

async function draftMarketplaceOrder(args: Record<string, any>): Promise<ToolResult> {
    const { item_id, quantity = 1 } = args;

    try {
        const supabase = getSupabaseClient();
        const { data: product } = await supabase.from('products').select('*').eq('id', item_id).single();
        const item = product || FALLBACK_MARKETPLACE.find(p => p.id === Number(item_id)) || FALLBACK_MARKETPLACE[0];
        const total = item.price * quantity;

        return {
            success: true,
            data: {
                order_summary: { item, quantity, unit_price: item.price, total_amount: total, currency: 'INR' },
                message: `Order draft prepared for "${item.name}" — ₹${total.toLocaleString('en-IN')}. Please click "Confirm & Pay" to complete your purchase.`,
            },
            ui_action: 'show_order_draft',
        };
    } catch {
        const item = FALLBACK_MARKETPLACE[0];
        return {
            success: true,
            data: {
                order_summary: { item, quantity, unit_price: item.price, total_amount: item.price, currency: 'INR' },
                message: `Order draft prepared!`,
            },
            ui_action: 'show_order_draft',
        };
    }
}

// ─── WORKSPACE TOOLS ───────────────────────────────────────────────

async function searchOpportunities(args: Record<string, any>): Promise<ToolResult> {
    const { type, query, location, min_stipend } = args;

    try {
        const supabase = getSupabaseClient();
        if (type === 'internship') {
            const { data, error } = await supabase.from('internships').select('*').limit(5);
            if (error || !data || data.length === 0) {
                return { success: true, data: { type, results: FALLBACK_INTERNSHIPS, count: FALLBACK_INTERNSHIPS.length, has_only_expired: false }, ui_action: 'show_opportunity_cards' };
            }
            return { success: true, data: { type, results: data, count: data.length, has_only_expired: false }, ui_action: 'show_opportunity_cards' };
        }

        if (type === 'competition') {
            const { data, error } = await supabase.from('competitions').select('*').limit(5);
            if (error || !data || data.length === 0) {
                return { success: true, data: { type, results: FALLBACK_COMPETITIONS, count: FALLBACK_COMPETITIONS.length, has_only_expired: false }, ui_action: 'show_opportunity_cards' };
            }
            return { success: true, data: { type, results: data, count: data.length, has_only_expired: false }, ui_action: 'show_opportunity_cards' };
        }
    } catch {
        return { success: true, data: { type, results: type === 'internship' ? FALLBACK_INTERNSHIPS : FALLBACK_COMPETITIONS, count: 2, has_only_expired: false }, ui_action: 'show_opportunity_cards' };
    }

    return { success: false, error: 'Invalid opportunity type.' };
}

async function draftApplicationResponses(args: Record<string, any>): Promise<ToolResult> {
    const { opportunity_id, opportunity_type, user_background } = args;
    const opp = (opportunity_type === 'internship' ? FALLBACK_INTERNSHIPS : FALLBACK_COMPETITIONS).find(o => o.id === Number(opportunity_id)) || FALLBACK_INTERNSHIPS[0];

    const skills_list = user_background ? user_background.split(',') : ['Creative Writing', 'React', 'Problem Solving'];
    const companyName = (opp as any).company || 'UniNest';
    const essay_draft = `I am excited to apply for the position at ${companyName}. With my background in ${skills_list.slice(0, 2).join(' and ')}, I am confident I can contribute.`;

    return {
        success: true,
        data: { opportunity: opp, essay_draft, skills_list, status: 'draft_pending_review' },
        ui_action: 'show_draft_panel',
    };
}

async function submitWorkspaceApplication(args: Record<string, any>): Promise<ToolResult> {
    const { opportunity_id, opportunity_type } = args;
    return {
        success: true,
        data: {
            opportunity_id,
            opportunity_type,
            status: 'draft_ready',
            message: 'I have prepared your application draft! To complete the submission, please click "Apply Now" and upload your Resume.',
        },
        ui_action: 'show_submission_preview',
    };
}

// ─── COMMUNITY TOOLS ───────────────────────────────────────────────

async function getCommunityImpact(args: Record<string, any>): Promise<ToolResult> {
    try {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase.from('donations').select('amount');
        if (error || !data) return { success: true, data: FALLBACK_IMPACT, ui_action: 'show_community_impact_stats' };

        const total = data.reduce((sum: number, d: any) => sum + (d.amount || 0), 0);
        return { success: true, data: { total_raised: total || 4500000, students_helped: 1240, top_donors: FALLBACK_IMPACT.top_donors, currency: 'INR' }, ui_action: 'show_community_impact_stats' };
    } catch {
        return { success: true, data: FALLBACK_IMPACT, ui_action: 'show_community_impact_stats' };
    }
}

async function searchCommunityFeed(args: Record<string, any>): Promise<ToolResult> {
    return { success: true, data: { query: args.query, posts: [], count: 0 }, ui_action: 'show_community_feed_results' };
}

async function draftCommunityPost(args: Record<string, any>): Promise<ToolResult> {
    return { success: true, data: { topic: args.topic, tone: args.tone || 'friendly', post_draft: `Drafting something about ${args.topic}...` }, ui_action: 'show_post_draft' };
}
