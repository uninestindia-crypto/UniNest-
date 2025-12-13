import {
    View,
    Text,
    FlatList,
    StyleSheet,
    RefreshControl,
    TouchableOpacity,
    Image,
    ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';
import { useAuth } from '@/hooks/useAuth';
import { ordersApi } from '@/services/supabase';
import type { Order } from '@uninest/shared-types';

const STATUS_COLORS = {
    pending_approval: '#f59e0b',
    approved: '#22c55e',
    rejected: '#ef4444',
    completed: '#3b82f6',
} as const;

function OrderCard({ order }: { order: Order }) {
    const { theme } = useTheme();
    const router = useRouter();
    const statusColor = STATUS_COLORS[order.status || 'pending_approval'];

    return (
        <TouchableOpacity
            style={[styles.orderCard, { backgroundColor: theme.colors.card }, theme.shadows.sm]}
            onPress={() => router.push(`/vendor/order/${order.id}`)}
        >
            <View style={styles.orderHeader}>
                <Text style={[styles.orderId, { color: theme.colors.mutedForeground }]}>
                    #{order.id}
                </Text>
                <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
                    <Text style={[styles.statusText, { color: statusColor }]}>
                        {order.status?.replace('_', ' ') || 'Pending'}
                    </Text>
                </View>
            </View>

            {/* Order Items Preview */}
            <View style={styles.itemsPreview}>
                {order.order_items?.slice(0, 2).map((item) => (
                    <View key={item.id} style={styles.itemRow}>
                        <Image
                            source={{ uri: item.products?.image_url || 'https://via.placeholder.com/40' }}
                            style={styles.itemImage}
                        />
                        <View style={styles.itemInfo}>
                            <Text style={[styles.itemName, { color: theme.colors.foreground }]} numberOfLines={1}>
                                {item.products?.name}
                            </Text>
                            <Text style={[styles.itemDetails, { color: theme.colors.mutedForeground }]}>
                                Qty: {item.quantity} • ₹{item.price.toLocaleString()}
                            </Text>
                        </View>
                    </View>
                ))}
                {order.order_items?.length > 2 && (
                    <Text style={[styles.moreItems, { color: theme.colors.mutedForeground }]}>
                        +{order.order_items.length - 2} more items
                    </Text>
                )}
            </View>

            <View style={[styles.orderFooter, { borderTopColor: theme.colors.border }]}>
                <Text style={[styles.totalLabel, { color: theme.colors.mutedForeground }]}>
                    Total
                </Text>
                <Text style={[styles.totalAmount, { color: theme.colors.foreground }]}>
                    ₹{order.total_amount.toLocaleString()}
                </Text>
            </View>
        </TouchableOpacity>
    );
}

export default function OrdersScreen() {
    const { theme } = useTheme();
    const { user, role } = useAuth();
    const isVendor = role === 'vendor';

    const { data: orders, isLoading, refetch, isRefetching } = useQuery({
        queryKey: ['orders', isVendor ? 'vendor' : 'buyer', user?.id],
        queryFn: () =>
            isVendor
                ? ordersApi.getVendorOrders(user!.id)
                : ordersApi.getBuyerOrders(user!.id),
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
                data={orders}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.ordersList}
                renderItem={({ item }) => <OrderCard order={item} />}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefetching}
                        onRefresh={refetch}
                        tintColor={theme.colors.primary[600]}
                    />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="receipt-outline" size={48} color={theme.colors.mutedForeground} />
                        <Text style={[styles.emptyTitle, { color: theme.colors.foreground }]}>
                            No orders yet
                        </Text>
                        <Text style={[styles.emptyText, { color: theme.colors.mutedForeground }]}>
                            {isVendor
                                ? "When customers book your services, orders will appear here."
                                : "Book a service to see your orders here."}
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
    ordersList: {
        padding: 16,
    },
    orderCard: {
        borderRadius: 12,
        marginBottom: 12,
        overflow: 'hidden',
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
    },
    orderId: {
        fontSize: 14,
        fontWeight: '500',
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
    itemsPreview: {
        paddingHorizontal: 12,
        paddingBottom: 12,
        gap: 8,
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    itemImage: {
        width: 40,
        height: 40,
        borderRadius: 6,
    },
    itemInfo: {
        flex: 1,
        marginLeft: 12,
    },
    itemName: {
        fontSize: 14,
        fontWeight: '500',
    },
    itemDetails: {
        fontSize: 12,
    },
    moreItems: {
        fontSize: 12,
        fontStyle: 'italic',
    },
    orderFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        borderTopWidth: 1,
    },
    totalLabel: {
        fontSize: 14,
    },
    totalAmount: {
        fontSize: 16,
        fontWeight: '700',
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 48,
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
