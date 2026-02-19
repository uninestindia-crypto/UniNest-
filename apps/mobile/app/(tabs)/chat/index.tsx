import { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/services/supabase';
import { Avatar } from '@/components/ui/Avatar';

// Note: We need to define the Room type since it might be missing in shared-types
type Room = {
    id: string;
    name: string;
    avatar_url?: string;
    last_message?: string;
    last_message_at?: string;
    is_encrypted?: boolean;
};

function ChatListItem({ room, onPress }: { room: Room; onPress: () => void }) {
    const { theme } = useTheme();

    return (
        <TouchableOpacity
            style={[styles.roomItem, { borderBottomColor: theme.colors.border }]}
            onPress={onPress}
        >
            <Avatar
                source={room.avatar_url || `https://ui-avatars.com/api/?name=${room.name}`}
                size="lg"
            />
            <View style={styles.roomInfo}>
                <View style={styles.roomHeader}>
                    <Text style={[styles.roomName, { color: theme.colors.foreground }]}>
                        {room.name}
                    </Text>
                    {room.last_message_at && (
                        <Text style={[styles.timeText, { color: theme.colors.mutedForeground }]}>
                            {new Date(room.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                    )}
                </View>
                <View style={styles.roomFooter}>
                    <Text style={[styles.lastMessage, { color: theme.colors.mutedForeground }]} numberOfLines={1}>
                        {room.last_message || 'No messages yet'}
                    </Text>
                    {room.is_encrypted && (
                        <Ionicons name="lock-closed" size={14} color={theme.colors.primary[500]} />
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
}

export default function ChatListScreen() {
    const { theme } = useTheme();
    const router = useRouter();
    const { user } = useAuth();

    const fetchRooms = async () => {
        // This is a placeholder for actual room fetching logic
        // It should match the web version's room fetching
        const { data, error } = await supabase
            .from('chat_rooms')
            .select(`
                *,
                chat_room_participants!inner(user_id)
            `)
            .eq('chat_room_participants.user_id', user?.id)
            .order('updated_at', { ascending: false });

        if (error) throw error;
        return data as Room[];
    };

    const { data: rooms, isLoading, refetch, isRefetching } = useQuery({
        queryKey: ['chat-rooms', user?.id],
        queryFn: fetchRooms,
        enabled: !!user,
    });

    if (isLoading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator size="large" color={theme.colors.primary[600]} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <FlatList
                data={rooms}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <ChatListItem
                        room={item}
                        onPress={() => router.push(`/chat/${item.id}`)}
                    />
                )}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefetching}
                        onRefresh={refetch}
                        tintColor={theme.colors.primary[600]}
                    />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="chatbubbles-outline" size={48} color={theme.colors.mutedForeground} />
                        <Text style={[styles.emptyText, { color: theme.colors.mutedForeground }]}>
                            No conversations yet
                        </Text>
                    </View>
                }
            />
            <TouchableOpacity
                style={[styles.fab, { backgroundColor: theme.colors.primary[600] }]}
                onPress={() => {/* New Chat Logic */ }}
            >
                <Ionicons name="add" size={30} color="#fff" />
            </TouchableOpacity>
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
    roomItem: {
        flexDirection: 'row',
        padding: 16,
        alignItems: 'center',
        borderBottomWidth: 1,
    },
    roomInfo: {
        flex: 1,
        marginLeft: 12,
    },
    roomHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    roomName: {
        fontSize: 16,
        fontWeight: '600',
    },
    timeText: {
        fontSize: 12,
    },
    roomFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    lastMessage: {
        fontSize: 14,
        flex: 1,
        marginRight: 8,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 100,
    },
    emptyText: {
        fontSize: 16,
        marginTop: 12,
    },
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
});
