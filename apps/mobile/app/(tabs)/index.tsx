import { useState, useCallback } from 'react';
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
import { Link, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';
import { useAuth } from '@/hooks/useAuth';
import { productsApi } from '@/services/supabase';
import type { Product } from '@uninest/shared-types';

const CATEGORIES = [
    { id: 'all', label: 'All', icon: 'grid-outline' },
    { id: 'hostel', label: 'Hostels', icon: 'bed-outline' },
    { id: 'pg', label: 'PG', icon: 'home-outline' },
    { id: 'mess', label: 'Mess', icon: 'restaurant-outline' },
    { id: 'tiffin', label: 'Tiffin', icon: 'fast-food-outline' },
    { id: 'library', label: 'Library', icon: 'library-outline' },
    { id: 'gym', label: 'Gym', icon: 'barbell-outline' },
] as const;

function ProductCard({ product }: { product: Product }) {
    const { theme } = useTheme();
    const router = useRouter();

    return (
        <TouchableOpacity
            style={[styles.productCard, { backgroundColor: theme.colors.card }, theme.shadows.sm]}
            onPress={() => router.push(`/product/${product.id}`)}
            activeOpacity={0.8}
        >
            <Image
                source={{ uri: product.image_url || 'https://via.placeholder.com/150' }}
                style={styles.productImage}
                resizeMode="cover"
            />
            <View style={styles.productInfo}>
                <Text style={[styles.productName, { color: theme.colors.foreground }]} numberOfLines={1}>
                    {product.name}
                </Text>
                <Text style={[styles.productCategory, { color: theme.colors.mutedForeground }]}>
                    {product.category}
                </Text>
                <View style={styles.productFooter}>
                    <Text style={[styles.productPrice, { color: theme.colors.primary[600] }]}>
                        ₹{product.price.toLocaleString()}
                    </Text>
                    {product.location && (
                        <View style={styles.locationContainer}>
                            <Ionicons name="location-outline" size={12} color={theme.colors.mutedForeground} />
                            <Text style={[styles.productLocation, { color: theme.colors.mutedForeground }]} numberOfLines={1}>
                                {product.location}
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
}

export default function HomeScreen() {
    const { theme } = useTheme();
    const { profile, role } = useAuth();
    const router = useRouter();
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    const { data: products, isLoading, refetch, isRefetching } = useQuery({
        queryKey: ['products', selectedCategory === 'all' ? undefined : selectedCategory],
        queryFn: () => productsApi.getProducts(selectedCategory === 'all' ? undefined : selectedCategory as any),
    });

    const renderHeader = useCallback(() => (
        <View style={styles.header}>
            {/* Welcome */}
            <View style={styles.welcomeSection}>
                <View>
                    <Text style={[styles.welcomeText, { color: theme.colors.mutedForeground }]}>
                        Welcome back,
                    </Text>
                    <Text style={[styles.userName, { color: theme.colors.foreground }]}>
                        {profile?.full_name || 'User'}
                    </Text>
                </View>
                <TouchableOpacity onPress={() => router.push('/notifications')}>
                    <Ionicons name="notifications-outline" size={24} color={theme.colors.foreground} />
                </TouchableOpacity>
            </View>

            {/* Categories */}
            {/* Categories */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoriesContainer}
                style={{ flexGrow: 0 }}
            >
                {CATEGORIES.map((cat) => (
                    <TouchableOpacity
                        key={cat.id}
                        style={[
                            styles.categoryChip,
                            {
                                backgroundColor: selectedCategory === cat.id ? theme.colors.primary[600] : theme.colors.card,
                                borderColor: theme.colors.border,
                                borderWidth: 1
                            }
                        ]}
                        onPress={() => {
                            if (cat.id === 'hostel') {
                                router.push('/hostels');
                            } else {
                                setSelectedCategory(cat.id === selectedCategory ? 'all' : cat.id);
                            }
                        }}
                    >
                        <Ionicons
                            name={cat.icon as any}
                            size={16}
                            color={selectedCategory === cat.id ? '#fff' : theme.colors.foreground}
                        />
                        <Text style={[
                            styles.categoryText,
                            { color: selectedCategory === cat.id ? '#fff' : theme.colors.foreground }
                        ]}>
                            {cat.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Vendor Dashboard Link */}
            {role === 'vendor' && (
                <Link href="/vendor/dashboard" asChild>
                    <TouchableOpacity
                        style={[styles.vendorBanner, { backgroundColor: theme.colors.primary[50] }]}
                    >
                        <Ionicons name="storefront-outline" size={20} color={theme.colors.primary[600]} />
                        <Text style={[styles.vendorBannerText, { color: theme.colors.primary[600] }]}>
                            Go to Vendor Dashboard
                        </Text>
                        <Ionicons name="chevron-forward" size={20} color={theme.colors.primary[600]} />
                    </TouchableOpacity>
                </Link>
            )}

            {/* Workspace Banner */}
            <Link href="/workspace" asChild>
                <TouchableOpacity
                    style={[styles.vendorBanner, { backgroundColor: theme.colors.card, marginBottom: 24, marginHorizontal: 16 }]}
                >
                    <Ionicons name="briefcase-outline" size={20} color={theme.colors.foreground} />
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.vendorBannerText, { color: theme.colors.foreground }]}>
                            Explore Workspace
                        </Text>
                        <Text style={{ fontSize: 12, color: theme.colors.mutedForeground }}>
                            Competitions, Internships & More
                        </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={theme.colors.mutedForeground} />
                </TouchableOpacity>
            </Link>

            {/* Section Title */}
            <Text style={[styles.sectionTitle, { color: theme.colors.foreground }]}>
                {selectedCategory === 'all' ? 'Popular Listings' : CATEGORIES.find(c => c.id === selectedCategory)?.label}
            </Text>

            {(selectedCategory === 'all' || selectedCategory === 'hostel') && (
                <View style={{ marginHorizontal: 16, marginBottom: 16 }}>
                    <TouchableOpacity
                        style={[styles.vendorBanner, { backgroundColor: theme.colors.primary[50], flexDirection: 'row', alignItems: 'center', padding: 12 }]}
                        onPress={() => router.push('/hostels')}
                    >
                        <Ionicons name="bed-outline" size={24} color={theme.colors.primary[600]} />
                        <View style={{ marginLeft: 12, flex: 1 }}>
                            <Text style={{ fontWeight: '700', color: theme.colors.primary[700] }}>Looking for Hostels?</Text>
                            <Text style={{ fontSize: 12, color: theme.colors.primary[600] }}>View dedicated hostel listings</Text>
                        </View>
                        <Ionicons name="arrow-forward" size={20} color={theme.colors.primary[600]} />
                    </TouchableOpacity>
                </View>
            )}
        </View>
    ), [theme, profile, role, selectedCategory, router]);

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
                data={products}
                keyExtractor={(item) => item.id.toString()}
                numColumns={2}
                columnWrapperStyle={styles.productRow}
                contentContainerStyle={styles.productList}
                ListHeaderComponent={renderHeader}
                renderItem={({ item }) => <ProductCard product={item} />}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefetching}
                        onRefresh={refetch}
                        tintColor={theme.colors.primary[600]}
                    />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="search-outline" size={48} color={theme.colors.mutedForeground} />
                        <Text style={[styles.emptyText, { color: theme.colors.mutedForeground }]}>
                            No listings found
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
    header: {
        paddingTop: 16,
    },
    welcomeSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    welcomeText: {
        fontSize: 14,
    },
    userName: {
        fontSize: 20,
        fontWeight: '600',
    },
    categoriesContainer: {
        paddingHorizontal: 16,
        paddingBottom: 16,
        gap: 8,
    },
    categoryChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
        gap: 6,
    },
    categoryText: {
        fontSize: 14,
        fontWeight: '500',
    },
    vendorBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 16,
        marginBottom: 16,
        padding: 12,
        borderRadius: 8,
        gap: 8,
    },
    vendorBannerText: {
        flex: 1,
        fontSize: 14,
        fontWeight: '500',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    productList: {
        paddingHorizontal: 12,
        paddingBottom: 24,
    },
    productRow: {
        justifyContent: 'space-between',
    },
    productCard: {
        width: '48%',
        borderRadius: 12,
        marginBottom: 12,
        overflow: 'hidden',
    },
    productImage: {
        width: '100%',
        height: 120,
    },
    productInfo: {
        padding: 12,
    },
    productName: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
    },
    productCategory: {
        fontSize: 12,
        marginBottom: 8,
        textTransform: 'capitalize',
    },
    productFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    productPrice: {
        fontSize: 14,
        fontWeight: '700',
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginLeft: 8,
    },
    productLocation: {
        fontSize: 10,
        marginLeft: 2,
        flex: 1,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 48,
    },
    emptyText: {
        fontSize: 16,
        marginTop: 12,
    },
});
