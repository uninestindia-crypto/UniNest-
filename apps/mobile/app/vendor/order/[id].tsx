import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';
import { ordersApi } from '@/services/supabase';
import type { OrderStatus } from '@uninest/shared-types';

const STATUS_CONFIG = {
    pending_approval: { label: 'Pending', color: '#f59e0b', icon: 'time-outline' },
    approved: { label: 'Approved', color: '#22c55e', icon: 'checkmark-circle-outline' },
    rejected: { label: 'Rejected', color: '#ef4444', icon: 'close-circle-outline' },
    completed: { label: 'Completed', color: '#3b82f6', icon: 'checkmark-done-outline' },
} as const;

export default function OrderDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { theme } = useTheme();
    const router = useRouter();
    const queryClient = useQueryClient();

    const { data: order, isLoading } = useQuery({
        queryKey: ['order', id],
        queryFn: () => ordersApi.getOrder(Number(id)),
        enabled: !!id,
    });

    const updateStatusMutation = useMutation({
        mutationFn: (status: OrderStatus) => ordersApi.updateOrderStatus(Number(id), status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['order', id] });
            queryClient.invalidateQueries({ queryKey: ['vendor-orders'] });
            queryClient.invalidateQueries({ queryKey: ['orders'] });
        },
        onError: (error) => {
            Alert.alert('Error', error.message);
        },
    });

    const handleUpdateStatus = (status: OrderStatus, label: string) => {
        Alert.alert(
            `${label} Order`,
            `Are you sure you want to mark this order as ${label.toLowerCase()}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                { text: label, onPress: () => updateStatusMutation.mutate(status) },
            ]
        );
    };

    if (isLoading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator size="large" color={theme.colors.primary[600]} />
            </View>
        );
    }

    if (!order) {
        return (
            <View style={[styles.errorContainer, { backgroundColor: theme.colors.background }]}>
                <Text style={{ color: theme.colors.foreground }}>Order not found</Text>
            </View>
        );
    }

    const status = order.status || 'pending_approval';
    const statusConfig = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG];

    return (
        <>
            <Stack.Screen options={{ headerTitle: `Order #${order.id}` }} />
            <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
                {/* Status Banner */}
                <View style={[styles.statusBanner, { backgroundColor: `${statusConfig.color}20` }]}>
                    <Ionicons name={statusConfig.icon as any} size={24} color={statusConfig.color} />
                    <Text style={[styles.statusText, { color: statusConfig.color }]}>
                        {statusConfig.label}
                    </Text>
                </View>

                {/* Customer Info */}
                <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.foreground }]}>
                        Customer Details
                    </Text>
                    <View style={styles.customerRow}>
                        <Image
                            source={{
                                uri: order.buyer?.avatar_url || `https://ui-avatars.com/api/?name=${order.buyer?.full_name || 'Customer'}`,
                            }}
                            style={styles.avatar}
                        />
                        <View style={styles.customerInfo}>
                            <Text style={[styles.customerName, { color: theme.colors.foreground }]}>
                                {order.buyer?.full_name || 'Customer'}
                            </Text>
                            {order.buyer?.handle && (
                                <Text style={[styles.customerHandle, { color: theme.colors.mutedForeground }]}>
                                    @{order.buyer.handle}
                                </Text>
                            )}
                        </View>
                    </View>
                </View>

                {/* Order Items */}
                <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.foreground }]}>
                        Order Items
                    </Text>
                    {order.order_items?.map((item) => (
                        <View key={item.id} style={[styles.itemRow, { borderBottomColor: theme.colors.border }]}>
                            <Image
                                source={{ uri: item.products?.image_url || 'https://via.placeholder.com/50' }}
                                style={styles.itemImage}
                            />
                            <View style={styles.itemInfo}>
                                <Text style={[styles.itemName, { color: theme.colors.foreground }]}>
                                    {item.products?.name}
                                </Text>
                                <Text style={[styles.itemQty, { color: theme.colors.mutedForeground }]}>
                                    Qty: {item.quantity}
                                </Text>
                            </View>
                            <Text style={[styles.itemPrice, { color: theme.colors.foreground }]}>
                                ₹{item.price.toLocaleString()}
                            </Text>
                        </View>
                    ))}
                    <View style={styles.totalRow}>
                        <Text style={[styles.totalLabel, { color: theme.colors.foreground }]}>Total</Text>
                        <Text style={[styles.totalValue, { color: theme.colors.primary[600] }]}>
                            ₹{order.total_amount.toLocaleString()}
                        </Text>
                    </View>
                </View>

                {/* Booking Details */}
                {(order.booking_date || order.booking_slot) && (
                    <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
                        <Text style={[styles.sectionTitle, { color: theme.colors.foreground }]}>
                            Booking Details
                        </Text>
                        {order.booking_date && (
                            <View style={styles.detailRow}>
                                <Ionicons name="calendar-outline" size={18} color={theme.colors.mutedForeground} />
                                <Text style={[styles.detailText, { color: theme.colors.foreground }]}>
                                    {new Date(order.booking_date).toLocaleDateString()}
                                </Text>
                            </View>
                        )}
                        {order.booking_slot && (
                            <View style={styles.detailRow}>
                                <Ionicons name="time-outline" size={18} color={theme.colors.mutedForeground} />
                                <Text style={[styles.detailText, { color: theme.colors.foreground }]}>
                                    {order.booking_slot}
                                </Text>
                            </View>
                        )}
                    </View>
                )}

                {/* Payment Info */}
                <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.foreground }]}>
                        Payment Info
                    </Text>
                    <View style={styles.detailRow}>
                        <Text style={[styles.detailLabel, { color: theme.colors.mutedForeground }]}>
                            Payment ID
                        </Text>
                        <Text style={[styles.detailValue, { color: theme.colors.foreground }]}>
                            {order.razorpay_payment_id}
                        </Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={[styles.detailLabel, { color: theme.colors.mutedForeground }]}>
                            Order Date
                        </Text>
                        <Text style={[styles.detailValue, { color: theme.colors.foreground }]}>
                            {new Date(order.created_at).toLocaleString()}
                        </Text>
                    </View>
                </View>

                {/* Actions */}
                {status === 'pending_approval' && (
                    <View style={styles.actions}>
                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: '#22c55e' }]}
                            onPress={() => handleUpdateStatus('approved', 'Approve')}
                            disabled={updateStatusMutation.isPending}
                        >
                            <Ionicons name="checkmark" size={20} color="#ffffff" />
                            <Text style={styles.actionButtonText}>Approve</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: '#ef4444' }]}
                            onPress={() => handleUpdateStatus('rejected', 'Reject')}
                            disabled={updateStatusMutation.isPending}
                        >
                            <Ionicons name="close" size={20} color="#ffffff" />
                            <Text style={styles.actionButtonText}>Reject</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {status === 'approved' && (
                    <View style={styles.actions}>
                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: theme.colors.primary[600], flex: 1 }]}
                            onPress={() => handleUpdateStatus('completed', 'Complete')}
                            disabled={updateStatusMutation.isPending}
                        >
                            <Ionicons name="checkmark-done" size={20} color="#ffffff" />
                            <Text style={styles.actionButtonText}>Mark as Completed</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </>
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
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statusBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        gap: 8,
    },
    statusText: {
        fontSize: 16,
        fontWeight: '600',
    },
    section: {
        margin: 16,
        marginBottom: 0,
        padding: 16,
        borderRadius: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 16,
    },
    customerRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
    },
    customerInfo: {
        marginLeft: 12,
    },
    customerName: {
        fontSize: 16,
        fontWeight: '600',
    },
    customerHandle: {
        fontSize: 14,
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    itemImage: {
        width: 50,
        height: 50,
        borderRadius: 8,
    },
    itemInfo: {
        flex: 1,
        marginLeft: 12,
    },
    itemName: {
        fontSize: 14,
        fontWeight: '500',
    },
    itemQty: {
        fontSize: 12,
    },
    itemPrice: {
        fontSize: 14,
        fontWeight: '600',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 12,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: '600',
    },
    totalValue: {
        fontSize: 18,
        fontWeight: '700',
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 8,
    },
    detailLabel: {
        fontSize: 14,
        flex: 1,
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '500',
    },
    detailText: {
        fontSize: 14,
    },
    actions: {
        flexDirection: 'row',
        padding: 16,
        gap: 12,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 48,
        borderRadius: 8,
        gap: 8,
    },
    actionButtonText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '600',
    },
});
