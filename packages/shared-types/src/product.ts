/**
 * Product/Listing type
 */
export type Product = {
    id: number;
    created_at: string;
    name: string;
    price: number;
    image_url: string | null;
    category: string;
    seller_id: string;
    description: string;
    location: string | null;
    total_seats: number | null;
    parent_product_id: number | null;
    status: string;
    phone_number?: string | null;
    whatsapp_number?: string | null;
    opening_hours?: string[] | null;
    amenities?: string[] | null;
    meal_plan?: {
        breakfast?: string | null;
        lunch?: string | null;
        dinner?: string | null;
    } | null;
    subscription_price?: number | null;
    special_notes?: string | null;
    room_types?: string[] | null;
    utilities_included?: string[] | null;
    house_rules?: string | null;
    occupancy?: number | null;
    furnishing?: string | null;
    hourly_slots?: string[] | null;
    services_offered?: string[] | null;
    equipment_specs?: string | null;
    app_number?: string | null;
    app_store_url?: string | null;
    play_store_url?: string | null;
    website_url?: string | null;
    instagram_url?: string | null;
    facebook_url?: string | null;
    twitter_url?: string | null;
    seller: {
        id: string;
        full_name: string;
        avatar_url: string;
        handle: string;
        user_metadata: Record<string, unknown>;
    };
    profiles?: {
        full_name: string;
    };
};

/**
 * Product categories
 */
export type ProductCategory =
    | 'hostel'
    | 'pg'
    | 'mess'
    | 'tiffin'
    | 'library'
    | 'gym'
    | 'laundry'
    | 'stationary'
    | 'other';
