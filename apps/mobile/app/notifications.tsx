import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';
import { useTheme } from '@/theme';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/services/supabase';
import type { Notification } from '@uninest/shared-types';

const NOTIFICATION_CONFIG = {
    new_follower: { icon: 'person-add-outline', color: '#3b82f6', text: 'started following you' },
    new_post: { icon: 'document-text-outline', color: '#8b5cf6', text: 'posted something new' },
    new_message: { icon: 'chatbubble-outline', color: '#22c55e', text: 'sent you a message' },
    order_update: { icon: 'receipt-outline', color: '#f59e0b', text: 'your order was updated' },
    booking_confirmed: { icon: 'checkmark-circle-outline', color: '#22c55e', text: 'booking confirmed' },
    new_competition: { icon: 'trophy-outline', color: '#f59e0b', text: 'new competition available' },
    new_internship: { icon: 'briefcase-outline', color: '#6366f1', text: 'new internship posted' },
} as const;

export default function NotificationsScreen() {
    const { theme } = useTheme();
    const { user } = useAuth();
    const router = useRouter();
    const queryClient = useQueryClient();

    const { data: notifications, isLoading, refetch, isRefetching } = useQuery({
        queryKey: ['notifications', user?.id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('notifications')
                .select('*, sender:sender_id (full_name, avatar_url)')
                .eq('user_id', user!.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data as Notification[];
        },
        enabled: !!user,
    });

    const markAsReadMutation = useMutation({
        mutationFn: async (notificationId: number) => {
            await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('id', notificationId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });

    const markAllAsReadMutation = useMutation({
        mutationFn: async () => {
            await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('user_id', user!.id)
                .eq('is_read', false);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });

    const handleNotificationPress = (notification: Notification) => {
        // Mark as read
        if (!notification.is_read) {
            markAsReadMutation.mutate(notification.id);
        }

        // Navigate based on type
        if (notification.type === 'new_message') {
            // router.push('/chat');
        } else if (notification.post_id) {
            // router.push(`/post/${notification.post_id}`);
        }
    };

    const unreadCount = notifications?.filter(n => !n.is_read).length || 0;

    if (isLoading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator size="large" color={theme.colors.primary[600]} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {/* Header Actions */}
            {unreadCount > 0 && (
                <View style={[styles.headerActions, { borderBottomColor: theme.colors.border }]}>
                    <Text style={[styles.unreadCount, { color: theme.colors.mutedForeground }]}>
                        {unreadCount} unread
                    </Text>
                    <TouchableOpacity onPress={() => markAllAsReadMutation.mutate()}>
                        <Text style={[styles.markAllRead, { color: theme.colors.primary[600] }]}>
                            Mark all as read
                        </Text>
                    </TouchableOpacity>
                </View>
            )}

            <FlatList
                data={notifications}
                keyExtractor={(item) => item.id.toString()}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefetching}
                        onRefresh={refetch}
                        tintColor={theme.colors.primary[600]}
                    />
                }
                renderItem={({ item }) => {
                    const config = NOTIFICATION_CONFIG[item.type as keyof typeof NOTIFICATION_CONFIG] ||
                        { icon: 'notifications-outline', color: theme.colors.primary[600], text: '' };

                    return (
                        <TouchableOpacity
                            style={[
                                styles.notificationItem,
                                { backgroundColor: item.is_read ? theme.colors.background : theme.colors.muted },
                            ]}
                            onPress={() => handleNotificationPress(item)}
                        >
                            <View style={[styles.iconContainer, { backgroundColor: `${config.color}20` }]}>
                                <Ionicons name={config.icon as any} size={20} color={config.color} />
                            </View>
                            <View style={styles.content}>
                                <View style={styles.textRow}>
                                    <Text style={[styles.senderName, { color: theme.colors.foreground }]}>
                                        {item.sender?.full_name || 'Someone'}
                                    </Text>
                                    <Text style={[styles.actionText, { color: theme.colors.mutedForeground }]}>
                                        {' '}{config.text}
                                    </Text>
                                </View>
                                <Text style={[styles.timeText, { color: theme.colors.mutedForeground }]}>
                                    {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                                </Text>
                            </View>
                            {!item.is_read && (
                                <View style={[styles.unreadDot, { backgroundColor: theme.colors.primary[600] }]} />
                            )}
                        </TouchableOpacity>
                    );
                }}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="notifications-off-outline" size={48} color={theme.colors.mutedForeground} />
                        <Text style={[styles.emptyTitle, { color: theme.colors.foreground }]}>
                            No notifications yet
                        </Text>
                        <Text style={[styles.emptyText, { color: theme.colors.mutedForeground }]}>
                            When you receive notifications, they'll appear here.
                        </Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
    },
    unreadCount: {
        fontSize: 14,
    },
    markAllRead: {
        fontSize: 14,
        fontWeight: '500',
    },
    notificationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
        marginLeft: 12,
    },
    textRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    senderName: {
        fontSize: 14,
        fontWeight: '600',
    },
    actionText: {
        fontSize: 14,
    },
    timeText: {
        fontSize: 12,
        marginTop: 4,
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginLeft: 8,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 64,
        paddingHorizontal: 32,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 16,
    },
    emptyText: {
        fontSize: 14,
        textAlign: 'center',
        marginTop: 8,
    },
});
