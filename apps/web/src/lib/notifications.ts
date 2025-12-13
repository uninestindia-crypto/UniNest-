
import { Expo, ExpoPushMessage } from 'expo-server-sdk';
import { createClient } from '@supabase/supabase-js';

// Initialize Expo SDK
const expo = new Expo();

/**
 * Send push notifications to a list of users.
 * 
 * @param userIds Array of user UUIDs to notify
 * @param title Notification title
 * @param body Notification body
 * @param data Optional data payload
 */
export async function sendPushNotification(
    userIds: string[],
    title: string,
    body: string,
    data?: Record<string, any>
) {
    // 1. Initialize Supabase Admin Client to fetch tokens
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        console.error('Push Notification Error: Missing Supabase Admin credentials.');
        return;
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    try {
        // 2. Fetch push tokens for the target users
        const { data: profiles, error } = await supabase
            .from('profiles')
            .select('push_token')
            .in('id', userIds)
            .not('push_token', 'is', null);

        if (error) {
            console.error('Push Notification Error: Failed to fetch tokens from Supabase', error);
            return;
        }

        if (!profiles || profiles.length === 0) {
            console.log('Push Notification Info: No users found with valid push tokens.');
            return;
        }

        // 3. Prepare Valid Messages
        const messages: ExpoPushMessage[] = [];

        for (const profile of profiles) {
            const pushToken = profile.push_token;

            // Check if the token appears valid
            if (!Expo.isExpoPushToken(pushToken)) {
                console.warn(`Push Notification Warning: Invalid Expo push token skipped: ${pushToken}`);
                continue;
            }

            messages.push({
                to: pushToken,
                sound: 'default',
                title,
                body,
                data,
            });
        }

        // 4. Send Batches using Expo SDK
        const chunks = expo.chunkPushNotifications(messages);

        for (const chunk of chunks) {
            try {
                const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
                // NOTE: We could inspect 'ticketChunk' to see success status and cleanup bad tokens
                // For now, we just log success/fail at batch level
                console.log('Push Notification: Batch sent successfully', ticketChunk);
            } catch (error) {
                console.error('Push Notification Error: Failed to send batch', error);
            }
        }

    } catch (err) {
        console.error('Push Notification Critical Error:', err);
    }
}
