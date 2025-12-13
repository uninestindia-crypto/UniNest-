import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/services/supabase';

// Helper to fetch stats
const fetchVendorStats = async (userId: string) => {
    // 1. Total Sales
    const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('vendor_id', userId)
        .eq('status', 'completed');

    const totalSales = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;

    // 2. Active Listings
    const { count: listingsCount, error: listingsError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('seller_id', userId)
        .eq('status', 'active');

    // 3. Pending Orders
    const { count: pendingCount, error: pendingError } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('vendor_id', userId)
        .eq('status', 'pending_approval'); // If you use that status

    if (ordersError || listingsError || pendingError) {
        throw new Error('Failed to fetch stats');
    }

    return { totalSales, listingsCount: listingsCount || 0, pendingCount: pendingCount || 0 };
};

export default function VendorDashboard() {
    const { theme } = useTheme();
    const router = useRouter();
    const { user } = useAuth();

    const { data: stats, isLoading, refetch } = useQuery({
        queryKey: ['vendor-stats', user?.id],
        queryFn: () => fetchVendorStats(user!.id),
        enabled: !!user,
    });

    const menuItems = [
        {
            icon: 'list-outline',
            label: 'My Listings',
            description: 'Manage your products and services',
            route: '/vendor/listings',
            color: '#3b82f6',
        },
        {
            icon: 'receipt-outline',
            label: 'Orders',
            description: 'View and manage customer orders',
            route: '/vendor/orders',
            color: '#10b981',
            badge: stats?.pendingCount,
        },
        {
            icon: 'open-outline',
            label: 'Live Preview',
            description: 'See how your store looks to others',
            route: `/profile/${user?.user_metadata?.handle || ''}`, // Assuming profile route works
            color: '#f59e0b',
        },
    ];

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: theme.colors.background }]}
            refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
        >
            {/* Header / Stats */}
            <View style={[styles.header, { backgroundColor: theme.colors.card }]}>
                <Text style={[styles.greeting, { color: theme.colors.mutedForeground }]}>Dashboard</Text>
                <Text style={[styles.title, { color: theme.colors.foreground }]}>Overview</Text>

                <View style={styles.statsRow}>
                    <View style={[styles.statCard, { backgroundColor: theme.colors.background }]}>
                        <Text style={[styles.statLabel, { color: theme.colors.mutedForeground }]}>Total Sales</Text>
                        <Text style={[styles.statValue, { color: theme.colors.primary[600] }]}>₹{stats?.totalSales.toLocaleString() || '0'}</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: theme.colors.background }]}>
                        <Text style={[styles.statLabel, { color: theme.colors.mutedForeground }]}>Active Listings</Text>
                        <Text style={[styles.statValue, { color: theme.colors.foreground }]}>{stats?.listingsCount || '0'}</Text>
                    </View>
                </View>
            </View>

            {/* Menu Grid */}
            <View style={styles.menuContainer}>
                {menuItems.map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[styles.menuItem, { backgroundColor: theme.colors.card }]}
                        onPress={() => router.push(item.route as any)}
                    >
                        <View style={[styles.iconContainer, { backgroundColor: `${item.color}20` }]}>
                            <Ionicons name={item.icon as any} size={24} color={item.color} />
                        </View>
                        <View style={styles.menuText}>
                            <Text style={[styles.menuLabel, { color: theme.colors.foreground }]}>{item.label}</Text>
                            <Text style={[styles.menuDescription, { color: theme.colors.mutedForeground }]}>{item.description}</Text>
                        </View>
                        {item.badge ? (
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>{item.badge}</Text>
                            </View>
                        ) : (
                            <Ionicons name="chevron-forward" size={20} color={theme.colors.mutedForeground} />
                        )}
                    </TouchableOpacity>
                ))}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: 20,
        paddingBottom: 30,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    greeting: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 4,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        marginBottom: 20,
    },
    statsRow: {
        flexDirection: 'row',
        gap: 12,
    },
    statCard: {
        flex: 1,
        padding: 16,
        borderRadius: 16,
    },
    statLabel: {
        fontSize: 12,
        marginBottom: 4,
    },
    statValue: {
        fontSize: 20,
        fontWeight: '700',
    },
    menuContainer: {
        padding: 20,
        gap: 16,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    menuText: {
        flex: 1,
    },
    menuLabel: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
    menuDescription: {
        fontSize: 12,
    },
    badge: {
        backgroundColor: '#ef4444',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
    },
    badgeText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
    },
});
