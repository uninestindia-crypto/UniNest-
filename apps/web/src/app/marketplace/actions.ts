'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { createClient as createServerClient } from '@/lib/supabase/server';

const parseText = (value: FormDataEntryValue | null): string | null => {
    if (value == null) return null;
    const text = value.toString().trim();
    return text.length > 0 ? text : null;
};

const parsePositiveInteger = (value: FormDataEntryValue | null): number | null => {
    if (value == null) return null;
    const num = Number(value);
    if (!Number.isFinite(num) || num <= 0) return null;
    return Math.round(num);
};

const parseNonNegativeNumber = (value: FormDataEntryValue | null): number | null => {
    if (value == null) return null;
    const num = Number(value);
    if (!Number.isFinite(num) || num < 0) return null;
    return Math.round(num * 100) / 100;
};

const parseListField = (value: FormDataEntryValue | null): string[] | null => {
    if (value == null) return null;
    const items = value
        .toString()
        .split('\n')
        .map((entry) => entry.trim())
        .filter((entry) => entry.length > 0);
    return items.length > 0 ? items : null;
};

const buildMealPlan = (
    breakfast: FormDataEntryValue | null,
    lunch: FormDataEntryValue | null,
    dinner: FormDataEntryValue | null,
): { breakfast?: string | null; lunch?: string | null; dinner?: string | null } | null => {
    const mealPlan = {
        breakfast: parseText(breakfast),
        lunch: parseText(lunch),
        dinner: parseText(dinner),
    };
    const hasValue = Object.values(mealPlan).some((value) => value && value.length > 0);
    return hasValue ? mealPlan : null;
};

const getSupabaseAdmin = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Supabase service role key is not configured.');
    }
    return createClient(supabaseUrl, supabaseServiceKey);
};

const uploadFile = async (supabaseAdmin: any, file: File, bucket: string, userId: string): Promise<string | null> => {
    if (!file || file.size === 0) return null;
    const filePath = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}-${file.name}`;
    const { error: uploadError } = await supabaseAdmin.storage
        .from(bucket)
        .upload(filePath, file);

    if (uploadError) {
        console.error('Upload Error:', uploadError);
        return null;
    }

    const { data: { publicUrl } } = supabaseAdmin.storage
        .from(bucket)
        .getPublicUrl(filePath);

    return publicUrl;
};

export async function createProduct(formData: FormData) {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'You must be logged in to create a product.' };
    }

    try {
        const supabaseAdmin = getSupabaseAdmin();
        const rawFormData = {
            name: formData.get('name') as string,
            description: formData.get('description') as string,
            price: Number(formData.get('price')),
            category: formData.get('category') as string,
            location: formData.get('location') as string | null,
            phone_number: parseText(formData.get('phone_number')),
            whatsapp_number: parseText(formData.get('whatsapp_number')),
            telegram_number: parseText(formData.get('telegram_number')),
            total_seats: parsePositiveInteger(formData.get('total_seats')),
            opening_hours: parseListField(formData.get('opening_hours')),
            amenities: parseListField(formData.get('amenities')),
            meal_plan: buildMealPlan(
                formData.get('meal_plan_breakfast'),
                formData.get('meal_plan_lunch'),
                formData.get('meal_plan_dinner'),
            ),
            subscription_price: parseNonNegativeNumber(formData.get('subscription_price')),
            special_notes: parseText(formData.get('special_notes')),
            room_types: parseListField(formData.get('room_types')),
            utilities_included: parseListField(formData.get('utilities_included')),
            house_rules: parseText(formData.get('house_rules')),
            occupancy: parsePositiveInteger(formData.get('occupancy')),
            furnishing: parseText(formData.get('furnishing')),
            hourly_slots: parseListField(formData.get('hourly_slots')),
            services_offered: parseListField(formData.get('services_offered')),
            equipment_specs: parseText(formData.get('equipment_specs')),
            app_number: parseText(formData.get('app_number')),
            app_store_url: parseText(formData.get('app_store_url')),
            play_store_url: parseText(formData.get('play_store_url')),
            website_url: parseText(formData.get('website_url')),
            instagram_url: parseText(formData.get('instagram_url')),
            facebook_url: parseText(formData.get('facebook_url')),
            twitter_url: parseText(formData.get('twitter_url')),
        };

        // Handle Images
        const imageFiles = formData.getAll('images') as File[];
        const uploadedImageUrls: string[] = [];

        // Upload main image (first in list or specifically 'image' field if legalcy)
        // We will treat the first uploaded image as the main 'image_url' for backward compatibility

        for (const file of imageFiles) {
            if (file instanceof File && file.size > 0) {
                const url = await uploadFile(supabaseAdmin, file, 'products', user.id);
                if (url) uploadedImageUrls.push(url);
            }
        }

        const mainImageUrl = uploadedImageUrls.length > 0 ? uploadedImageUrls[0] : null;

        const { data: newProduct, error } = await supabaseAdmin.from('products').insert({
            seller_id: user.id,
            name: rawFormData.name,
            description: rawFormData.description,
            price: rawFormData.price,
            category: rawFormData.category,
            image_url: mainImageUrl, // Main image
            location: rawFormData.location,
            phone_number: rawFormData.phone_number,
            whatsapp_number: rawFormData.whatsapp_number,
            telegram_number: rawFormData.telegram_number,
            total_seats: rawFormData.total_seats,
            opening_hours: rawFormData.opening_hours,
            amenities: rawFormData.amenities,
            meal_plan: rawFormData.meal_plan,
            subscription_price: rawFormData.subscription_price,
            special_notes: rawFormData.special_notes,
            room_types: rawFormData.room_types,
            utilities_included: rawFormData.utilities_included,
            house_rules: rawFormData.house_rules,
            occupancy: rawFormData.occupancy,
            furnishing: rawFormData.furnishing,
            hourly_slots: rawFormData.hourly_slots,
            services_offered: rawFormData.services_offered,
            equipment_specs: rawFormData.equipment_specs,
            app_number: rawFormData.app_number,
            app_store_url: rawFormData.app_store_url,
            play_store_url: rawFormData.play_store_url,
            website_url: rawFormData.website_url,
            instagram_url: rawFormData.instagram_url,
            facebook_url: rawFormData.facebook_url,
            twitter_url: rawFormData.twitter_url,
            status: 'pending',
        }).select().single();

        if (error) {
            return { error: error.message };
        }

        // Insert additional images into product_images
        if (newProduct && uploadedImageUrls.length > 0) {
            const imageRecords = uploadedImageUrls.map((url, index) => ({
                product_id: newProduct.id,
                image_url: url,
                display_order: index,
            }));
            await supabaseAdmin.from('product_images').insert(imageRecords);
        }

        // Handle Variants
        const variantsJson = formData.get('variants') as string | null;
        if (newProduct && variantsJson) {
            try {
                const variants = JSON.parse(variantsJson);
                if (Array.isArray(variants) && variants.length > 0) {
                    const variantRecords = variants.map((v: any) => ({
                        product_id: newProduct.id,
                        name: v.name,
                        value: v.value,
                        price_modifier: Number(v.price_modifier) || 0,
                        stock_count: Number(v.stock_count) || 0,
                    }));
                    await supabaseAdmin.from('product_variants').insert(variantRecords);
                }
            } catch (e) {
                console.error("Failed to parse variants", e);
            }
        }

        // Library Seats Logic (Legacy logic kept)
        if (rawFormData.category === 'Library' && rawFormData.total_seats && newProduct) {
            const seatProducts = Array.from({ length: rawFormData.total_seats }, (_, i) => ({
                name: `Seat ${i + 1}`,
                category: 'Library Seat',
                price: rawFormData.price,
                seller_id: user.id,
                parent_product_id: newProduct.id,
                description: `Seat ${i + 1} at ${rawFormData.name}`
            }));
            await supabaseAdmin.from('products').insert(seatProducts);
        }

        revalidatePath('/marketplace');
        revalidatePath('/vendor/products');
        return { error: null };
    } catch (e: any) {
        return { error: e.message };
    }
}

export async function updateProduct(id: number, formData: FormData) {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'You must be logged in to update a product.' };
    }

    try {
        const supabaseAdmin = getSupabaseAdmin();

        const { data: existing } = await supabaseAdmin.from('products').select('image_url, seller_id').eq('id', id).single();
        if (!existing || existing.seller_id !== user.id) {
            return { error: 'You do not have permission to edit this product.' };
        }

        const rawFormData = {
            name: formData.get('name') as string,
            description: formData.get('description') as string,
            price: Number(formData.get('price')),
            category: formData.get('category') as string,
            location: formData.get('location') as string | null,
            phone_number: parseText(formData.get('phone_number')),
            whatsapp_number: parseText(formData.get('whatsapp_number')),
            total_seats: parsePositiveInteger(formData.get('total_seats')),
            opening_hours: parseListField(formData.get('opening_hours')),
            amenities: parseListField(formData.get('amenities')),
            meal_plan: buildMealPlan(
                formData.get('meal_plan_breakfast'),
                formData.get('meal_plan_lunch'),
                formData.get('meal_plan_dinner'),
            ),
            subscription_price: parseNonNegativeNumber(formData.get('subscription_price')),
            special_notes: parseText(formData.get('special_notes')),
            room_types: parseListField(formData.get('room_types')),
            utilities_included: parseListField(formData.get('utilities_included')),
            house_rules: parseText(formData.get('house_rules')),
            occupancy: parsePositiveInteger(formData.get('occupancy')),
            furnishing: parseText(formData.get('furnishing')),
            hourly_slots: parseListField(formData.get('hourly_slots')),
            services_offered: parseListField(formData.get('services_offered')),
            equipment_specs: parseText(formData.get('equipment_specs')),
            app_number: parseText(formData.get('app_number')),
            app_store_url: parseText(formData.get('app_store_url')),
            play_store_url: parseText(formData.get('play_store_url')),
            website_url: parseText(formData.get('website_url')),
            instagram_url: parseText(formData.get('instagram_url')),
            facebook_url: parseText(formData.get('facebook_url')),
            twitter_url: parseText(formData.get('twitter_url')),
        };

        // Handle Image Uploads
        const imageFiles = formData.getAll('images') as File[];
        const uploadedImageUrls: string[] = [];

        for (const file of imageFiles) {
            if (file instanceof File && file.size > 0) {
                const url = await uploadFile(supabaseAdmin, file, 'products', user.id);
                if (url) uploadedImageUrls.push(url);
            }
        }

        // If new images uploaded, update main image if none exists or we want to override? 
        // Logic: If user uploaded new images, the first one becomes main image IF no main image currently, OR we just append to gallery.
        // For simplicity: If there's an existing main image, keep it, unless explicitly replaced?
        // Actually, the main image logic in the form is simplified to "Listing Image". 
        // We will keep 'image_url' on product pointing to the main/first image.

        let imageUrl = existing.image_url;
        if (uploadedImageUrls.length > 0 && !imageUrl) {
            imageUrl = uploadedImageUrls[0];
        } else if (uploadedImageUrls.length > 0 && formData.get('replace_main_image') === 'true') {
            // Optional: logic to replace main image specifically
        }

        const { error } = await supabaseAdmin.from('products').update({
            name: rawFormData.name,
            description: rawFormData.description,
            price: rawFormData.price,
            category: rawFormData.category,
            image_url: imageUrl,
            location: rawFormData.location,
            phone_number: rawFormData.phone_number,
            whatsapp_number: rawFormData.whatsapp_number,
            total_seats: rawFormData.total_seats,
            opening_hours: rawFormData.opening_hours,
            amenities: rawFormData.amenities,
            meal_plan: rawFormData.meal_plan,
            subscription_price: rawFormData.subscription_price,
            special_notes: rawFormData.special_notes,
            room_types: rawFormData.room_types,
            utilities_included: rawFormData.utilities_included,
            house_rules: rawFormData.house_rules,
            occupancy: rawFormData.occupancy,
            furnishing: rawFormData.furnishing,
            hourly_slots: rawFormData.hourly_slots,
            services_offered: rawFormData.services_offered,
            equipment_specs: rawFormData.equipment_specs,
            app_number: rawFormData.app_number,
            app_store_url: rawFormData.app_store_url,
            play_store_url: rawFormData.play_store_url,
            website_url: rawFormData.website_url,
            instagram_url: rawFormData.instagram_url,
            facebook_url: rawFormData.facebook_url,
            twitter_url: rawFormData.twitter_url,
        }).eq('id', id);

        if (error) {
            return { error: error.message };
        }

        // Add new images to gallery
        if (uploadedImageUrls.length > 0) {
            // Get current count to append order
            const { count } = await supabaseAdmin.from('product_images').select('*', { count: 'exact', head: true }).eq('product_id', id);
            const startOrder = count || 0;

            const imageRecords = uploadedImageUrls.map((url, index) => ({
                product_id: id,
                image_url: url,
                display_order: startOrder + index,
            }));
            await supabaseAdmin.from('product_images').insert(imageRecords);
        }

        // Handle Variants
        // Full sync: Delete existing and re-insert? Or smart update? 
        // For simplicity: We will expect the form to send the *complete* list of desired variants.
        // We will delete all for this product and re-insert. 
        // CAUTION: This destroys history if we tracked stock per variant ID. Ideally we should upsert.
        // Let's try upsert if we have IDs, else insert.
        const variantsJson = formData.get('variants') as string | null;
        if (variantsJson) {
            try {
                const variants = JSON.parse(variantsJson);
                // We will delete all and insert for MVP simplicity to ensure clean state matching form
                await supabaseAdmin.from('product_variants').delete().eq('product_id', id);

                if (Array.isArray(variants) && variants.length > 0) {
                    const variantRecords = variants.map((v: any) => ({
                        product_id: id,
                        name: v.name,
                        value: v.value,
                        price_modifier: Number(v.price_modifier) || 0,
                        stock_count: Number(v.stock_count) || 0,
                    }));
                    await supabaseAdmin.from('product_variants').insert(variantRecords);
                }
            } catch (e) {
                console.error("Failed to update variants", e);
            }
        }

        // Removed Images
        const removedImagesJson = formData.get('removed_images') as string | null;
        if (removedImagesJson) {
            try {
                const removedIds = JSON.parse(removedImagesJson);
                if (Array.isArray(removedIds) && removedIds.length > 0) {
                    await supabaseAdmin.from('product_images').delete().in('id', removedIds);
                }
            } catch (e) {
                console.error("Error removing images", e);
            }
        }

        revalidatePath('/marketplace');
        revalidatePath(`/marketplace/${id}`);
        revalidatePath('/vendor/products');
        revalidatePath(`/vendor/products/${id}/edit`);
        return { error: null };
    } catch (e: any) {
        return { error: e.message };
    }
}
