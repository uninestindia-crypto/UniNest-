import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/services/supabase';

export default function VendorOrdersScreen() {
    const { theme } = useTheme();
    const router = useRouter();
    const { user } = useAuth();

    const { data: orders, isLoading, refetch, isRefetching } = useQuery({
        queryKey: ['vendor-orders', user?.id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('orders')
                .select('*, order_items(*, products(*)), buyer:buyer_id(full_name, avatar_url)')
                .eq('vendor_id', user!.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data;
        },
        enabled: !!user,
    });

    const handleUpdateStatus = async (orderId: number, newStatus: string) => {
        try {
            const { error } = await supabase
                .from('orders')
                .update({ status: newStatus })
                .eq('id', orderId);

            if (error) throw error;
            refetch();
        } catch (e) {
            Alert.alert('Error', 'Failed to update status');
        }
    };

    const renderItem = ({ item }: { item: any }) => (
        <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
            <View style={styles.header}>
                <Text style={[styles.orderId, { color: theme.colors.mutedForeground }]}>Order #{item.id}</Text>
                <View style={[styles.statusBadge, {
                    backgroundColor: item.status === 'completed' ? '#dcfce7' :
                        item.status === 'pending_approval' ? '#fef9c3' : '#f3f4f6'
                }]}>
                    <Text style={[styles.statusText, {
                        color: item.status === 'completed' ? '#166534' :
                            item.status === 'pending_approval' ? '#854d0e' : '#6b7280'
                    }]}>
                        {item.status?.replace('_', ' ')}
                    </Text>
                </View>
            </View>

            <Text style={[styles.date, { color: theme.colors.mutedForeground }]}>
                {new Date(item.created_at).toLocaleDateString()}
            </Text>

            <View style={[styles.buyerRow, { borderColor: theme.colors.border }]}>
                <Text style={[styles.buyerLabel, { color: theme.colors.mutedForeground }]}>Buyer: </Text>
                <Text style={[styles.buyerName, { color: theme.colors.foreground }]}>{item.buyer?.full_name || 'Unknown'}</Text>
            </View>

            <View style={styles.itemsContainer}>
                {item.order_items?.map((orderItem: any, idx: number) => (
                    <View key={idx} style={styles.itemRow}>
                        <Text style={[styles.itemName, { color: theme.colors.foreground }]}>
                            {orderItem.quantity}x {orderItem.products?.name}
                        </Text>
                        <Text style={[styles.itemPrice, { color: theme.colors.foreground }]}>
                            ₹{orderItem.price}
                        </Text>
                    </View>
                ))}
            </View>

            <View style={[styles.footer, { borderColor: theme.colors.border }]}>
                <Text style={[styles.totalLabel, { color: theme.colors.foreground }]}>Total</Text>
                <Text style={[styles.totalValue, { color: theme.colors.primary[600] }]}>₹{item.total_amount}</Text>
            </View>

            {/* Actions for Pending Orders */}
            {item.status === 'pending_approval' && (
                <View style={styles.actions}>
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: '#dcfce7' }]}
                        onPress={() => handleUpdateStatus(item.id, 'approved')}
                    >
                        <Text style={[styles.actionText, { color: '#166534' }]}>Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: '#fee2e2' }]}
                        onPress={() => handleUpdateStatus(item.id, 'rejected')}
                    >
                        <Text style={[styles.actionText, { color: '#991b1b' }]}>Reject</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <FlatList
                data={orders}
                keyExtractor={item => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
                refreshControl={<RefreshControl refreshing={isLoading || isRefetching} onRefresh={refetch} />}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={{ color: theme.colors.mutedForeground }}>No orders received yet.</Text>
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
    list: {
        padding: 16,
        gap: 16,
    },
    card: {
        borderRadius: 12,
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    orderId: {
        fontSize: 14,
        fontWeight: '600',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    date: {
        fontSize: 12,
        marginBottom: 12,
    },
    buyerRow: {
        flexDirection: 'row',
        paddingVertical: 8,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        marginBottom: 8,
    },
    buyerLabel: {
        fontSize: 14,
    },
    buyerName: {
        fontSize: 14,
        fontWeight: '600',
    },
    itemsContainer: {
        marginBottom: 12,
        gap: 4,
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    itemName: {
        fontSize: 14,
        flex: 1,
    },
    itemPrice: {
        fontSize: 14,
        fontWeight: '500',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 12,
        borderTopWidth: 1,
        alignItems: 'center',
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: '600',
    },
    totalValue: {
        fontSize: 18,
        fontWeight: '700',
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 16,
    },
    actionButton: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    actionText: {
        fontSize: 14,
        fontWeight: '600',
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
    },
});
