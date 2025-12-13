import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/services/supabase';

export default function MyListingsScreen() {
    const { theme } = useTheme();
    const router = useRouter();
    const { user } = useAuth();

    const { data: listings, isLoading, refetch, isRefetching } = useQuery({
        queryKey: ['my-listings', user?.id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('seller_id', user!.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data;
        },
        enabled: !!user,
    });

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: theme.colors.card }]}
            onPress={() => router.push(`/product/${item.id}`)} // Or edit route
        >
            <Image
                source={{ uri: item.image_url || 'https://via.placeholder.com/150' }}
                style={styles.image}
            />
            <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                    <Text style={[styles.name, { color: theme.colors.foreground }]} numberOfLines={1}>{item.name}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: item.status === 'active' ? '#dcfce7' : '#f3f4f6' }]}>
                        <Text style={[styles.statusText, { color: item.status === 'active' ? '#166534' : '#6b7280' }]}>
                            {item.status}
                        </Text>
                    </View>
                </View>
                <Text style={[styles.category, { color: theme.colors.mutedForeground }]}>{item.category}</Text>
                <Text style={[styles.price, { color: theme.colors.primary[600] }]}>₹{item.price.toLocaleString()}</Text>
            </View>
            <TouchableOpacity style={styles.moreButton}>
                <Ionicons name="ellipsis-vertical" size={20} color={theme.colors.mutedForeground} />
            </TouchableOpacity>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <FlatList
                data={listings}
                keyExtractor={item => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
                refreshControl={<RefreshControl refreshing={isLoading || isRefetching} onRefresh={refetch} />}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={{ color: theme.colors.mutedForeground }}>No listings yet.</Text>
                    </View>
                }
            />
            <TouchableOpacity
                style={[styles.fab, { backgroundColor: theme.colors.primary[600] }]}
                onPress={() => router.push('/vendor/create-listing')} // Assuming this exists or will exist
            >
                <Ionicons name="add" size={24} color="white" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    list: {
        padding: 16,
        gap: 16,
    },
    card: {
        flexDirection: 'row',
        borderRadius: 12,
        padding: 12,
        alignItems: 'center',
    },
    image: {
        width: 60,
        height: 60,
        borderRadius: 8,
        backgroundColor: '#eee',
    },
    cardContent: {
        flex: 1,
        marginLeft: 12,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 2,
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
        flex: 1,
        marginRight: 8,
    },
    category: {
        fontSize: 12,
        marginBottom: 4,
    },
    price: {
        fontSize: 14,
        fontWeight: '700',
    },
    statusBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    moreButton: {
        padding: 8,
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
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
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 6,
    },
});
