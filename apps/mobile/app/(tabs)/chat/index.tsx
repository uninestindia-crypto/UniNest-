import { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    TextInput,
    ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/theme';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/services/supabase';
import { Avatar } from '@/components/ui/Avatar';

type Room = {
    id: string;
    name: string;
    avatar_url?: string;
    last_message?: string;
    last_message_at?: string;
    is_encrypted?: boolean;
    unread_count?: number;
    last_message_status?: 'sent' | 'delivered' | 'read';
};

function ChatListItem({ room, onPress }: { room: Room; onPress: () => void }) {
    const { theme } = useTheme();

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        if (date.toDateString() === now.toDateString()) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        return date.toLocaleDateString([], { day: '2-digit', month: '2-digit', year: '2-digit' });
    };

    return (
        <TouchableOpacity
            style={[styles.roomItem]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <Avatar
                source={room.avatar_url || `https://ui-avatars.com/api/?name=${room.name}`}
                size="lg"
            />
            <View style={styles.roomInfo}>
                <View style={styles.roomHeader}>
                    <Text style={[styles.roomName, { color: theme.colors.foreground }]} numberOfLines={1}>
                        {room.name}
                    </Text>
                    {room.last_message_at && (
                        <Text style={[styles.timeText, { color: room.unread_count ? theme.colors.whatsappGreen : theme.colors.mutedForeground }]}>
                            {formatTime(room.last_message_at)}
                        </Text>
                    )}
                </View>
                <View style={styles.roomFooter}>
                    <View style={styles.lastMessageContainer}>
                        {room.last_message_status === 'read' && (
                            <Ionicons name="checkmark-done" size={16} color={theme.colors.whatsappBlue} style={styles.statusIcon} />
                        )}
                        {room.last_message_status === 'delivered' && (
                            <Ionicons name="checkmark-done" size={16} color={theme.colors.mutedForeground} style={styles.statusIcon} />
                        )}
                        {room.last_message_status === 'sent' && (
                            <Ionicons name="checkmark" size={16} color={theme.colors.mutedForeground} style={styles.statusIcon} />
                        )}
                        <Text style={[styles.lastMessage, { color: theme.colors.mutedForeground }]} numberOfLines={1}>
                            {room.last_message || 'No messages yet'}
                        </Text>
                    </View>
                    {room.unread_count ? (
                        <View style={[styles.unreadBadge, { backgroundColor: theme.colors.whatsappGreen }]}>
                            <Text style={styles.unreadText}>{room.unread_count}</Text>
                        </View>
                    ) : null}
                </View>
            </View>
        </TouchableOpacity>
    );
}

const FilterChip = ({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) => {
    const { theme } = useTheme();
    return (
        <TouchableOpacity
            onPress={onPress}
            style={[
                styles.chip,
                active ? { backgroundColor: theme.colors.whatsappGreen + '20', borderColor: 'transparent' } : { backgroundColor: theme.colors.muted, borderColor: 'transparent' }
            ]}
        >
            <Text style={[styles.chipText, active ? { color: theme.colors.whatsappGreen, fontWeight: '600' } : { color: theme.colors.mutedForeground }]}>
                {label}
            </Text>
        </TouchableOpacity>
    );
};

export default function ChatListScreen() {
    const { theme } = useTheme();
    const router = useRouter();
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');

    const fetchRooms = async () => {
        const { data, error } = await supabase
            .from('chat_rooms')
            .select(`
                *,
                chat_room_participants!inner(user_id)
            `)
            .eq('chat_room_participants.user_id', user?.id)
            .order('updated_at', { ascending: false });

        if (error) throw error;
        // Mocking some data for visual parity with the screenshot
        return (data || []).map(room => ({
            ...room,
            unread_count: Math.floor(Math.random() * 5),
            last_message_status: ['sent', 'delivered', 'read'][Math.floor(Math.random() * 3)] as any
        })) as Room[];
    };

    const { data: rooms, isLoading, refetch, isRefetching } = useQuery({
        queryKey: ['chat-rooms', user?.id],
        queryFn: fetchRooms,
        enabled: !!user,
    });

    if (isLoading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator size="large" color={theme.colors.whatsappGreen} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {/* Custom Header */}
            <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: theme.colors.whatsappGreen }]}>WhatsApp</Text>
                <View style={styles.headerIcons}>
                    <TouchableOpacity style={styles.headerIcon}>
                        <Ionicons name="camera-outline" size={24} color={theme.colors.foreground} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.headerIcon}>
                        <Ionicons name="search-outline" size={24} color={theme.colors.foreground} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.headerIcon}>
                        <Ionicons name="ellipsis-vertical" size={20} color={theme.colors.foreground} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Search Bar */}
            <View style={[styles.searchContainer, { backgroundColor: theme.colors.muted }]}>
                <Ionicons name="search" size={20} color={theme.colors.mutedForeground} style={styles.searchIcon} />
                <TextInput
                    style={[styles.searchInput, { color: theme.colors.foreground }]}
                    placeholder="Ask Meta AI or Search"
                    placeholderTextColor={theme.colors.mutedForeground}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            {/* Filters */}
            <View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContainer}>
                    {['All', 'Unread', 'Favourites', 'Groups'].map(filter => (
                        <FilterChip
                            key={filter}
                            label={filter}
                            active={activeFilter === filter}
                            onPress={() => setActiveFilter(filter)}
                        />
                    ))}
                </ScrollView>
            </View>

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
                        tintColor={theme.colors.whatsappGreen}
                    />
                }
                ListHeaderComponent={<View style={{ height: 8 }} />}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="chatbubbles-outline" size={48} color={theme.colors.mutedForeground} />
                        <Text style={[styles.emptyText, { color: theme.colors.mutedForeground }]}>
                            No conversations yet
                        </Text>
                    </View>
                }
            />

            {/* AI Circle FAB */}
            <TouchableOpacity
                style={[styles.aiFab, { backgroundColor: theme.colors.card }]}
                onPress={() => {/* Meta AI Logic */ }}
            >
                <View style={styles.aiCircle}>
                    <MaterialCommunityIcons name="circle-outline" size={24} color={theme.colors.whatsappBlue} />
                </View>
            </TouchableOpacity>

            {/* Main FAB */}
            <TouchableOpacity
                style={[styles.fab, { backgroundColor: theme.colors.whatsappGreen }]}
                onPress={() => {/* New Chat Logic */ }}
            >
                <MaterialCommunityIcons name="chat-plus" size={24} color="#fff" />
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 48,
        paddingBottom: 12,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '700',
    },
    headerIcons: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerIcon: {
        marginLeft: 20,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 16,
        marginVertical: 8,
        paddingHorizontal: 12,
        height: 48,
        borderRadius: 24,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
    },
    filterContainer: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 8,
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 0,
    },
    chipText: {
        fontSize: 14,
    },
    roomItem: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 12,
        alignItems: 'center',
    },
    roomInfo: {
        flex: 1,
        marginLeft: 16,
        borderBottomWidth: 0,
    },
    roomHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 2,
    },
    roomName: {
        fontSize: 17,
        fontWeight: '600',
        flex: 1,
        marginRight: 8,
    },
    timeText: {
        fontSize: 12,
    },
    roomFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    lastMessageContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: 8,
    },
    statusIcon: {
        marginRight: 4,
    },
    lastMessage: {
        fontSize: 14,
        flex: 1,
    },
    unreadBadge: {
        minWidth: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 6,
    },
    unreadText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '700',
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 100,
    },
    emptyText: {
        fontSize: 16,
        marginTop: 12,
    },
    aiFab: {
        position: 'absolute',
        right: 24,
        bottom: 96,
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    aiCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        width: 56,
        height: 56,
        borderRadius: 16, // WhatsApp uses squircle-ish or rounded corners for FAB
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
});
