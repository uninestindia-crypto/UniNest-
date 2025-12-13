import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    TextInput
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '@/theme';
import { productsApi } from '@/services/supabase';
import type { Product } from '@uninest/shared-types';

function HostelCard({ item }: { item: Product }) {
    const { theme } = useTheme();
    const router = useRouter();

    return (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: theme.colors.card }, theme.shadows.sm]}
            onPress={() => router.push(`/hostels/${item.id}`)}
        >
            <Image
                source={{ uri: item.image_url || 'https://via.placeholder.com/400' }}
                style={styles.cardImage}
                resizeMode="cover"
            />

            <View style={styles.cardContent}>
                <View style={styles.headerRow}>
                    <Text style={[styles.cardTitle, { color: theme.colors.foreground }]} numberOfLines={1}>
                        {item.name}
                    </Text>
                    {item.price > 0 && (
                        <View style={[styles.priceTag, { backgroundColor: theme.colors.primary[50] }]}>
                            <Text style={[styles.priceText, { color: theme.colors.primary[600] }]}>
                                From ₹{item.price.toLocaleString()}
                            </Text>
                        </View>
                    )}
                </View>

                {item.location && (
                    <View style={styles.locationRow}>
                        <Ionicons name="location-outline" size={14} color={theme.colors.mutedForeground} />
                        <Text style={[styles.locationText, { color: theme.colors.mutedForeground }]} numberOfLines={1}>
                            {item.location}
                        </Text>
                    </View>
                )}

                {/* Amenities Preview */}
                <View style={styles.amenitiesRow}>
                    {(item.amenities || []).slice(0, 3).map((amenity, index) => (
                        <View key={index} style={[styles.amenityBadge, { backgroundColor: theme.colors.muted }]}>
                            <Text style={[styles.amenityText, { color: theme.colors.mutedForeground }]}>{amenity}</Text>
                        </View>
                    ))}
                    {(item.amenities?.length || 0) > 3 && (
                        <Text style={[styles.moreAmenities, { color: theme.colors.mutedForeground }]}>
                            +{item.amenities!.length - 3} more
                        </Text>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
}

export default function HostelsScreen() {
    const { theme } = useTheme();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');

    const { data: hostels, isLoading } = useQuery({
        queryKey: ['products', 'hostel'],
        queryFn: () => productsApi.getProducts('hostel'),
    });

    const filteredHostels = hostels?.filter(h =>
        h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.location?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {/* Search Bar */}
            <View style={[styles.searchContainer, { backgroundColor: theme.colors.card }]}>
                <View style={[styles.searchBar, { backgroundColor: theme.colors.background }]}>
                    <Ionicons name="search-outline" size={20} color={theme.colors.mutedForeground} />
                    <TextInput
                        placeholder="Search hostels by name or location..."
                        placeholderTextColor={theme.colors.mutedForeground}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        style={[styles.searchInput, { color: theme.colors.foreground }]}
                    />
                </View>
            </View>

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary[500]} />
                </View>
            ) : (
                <FlatList
                    data={filteredHostels}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    renderItem={({ item }) => <HostelCard item={item} />}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={[styles.emptyText, { color: theme.colors.mutedForeground }]}>
                                No hostels found matching your criteria
                            </Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    searchContainer: {
        padding: 16,
        paddingBottom: 12,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        height: 44,
        borderRadius: 12,
        gap: 8,
    },
    searchInput: {
        flex: 1,
        height: '100%',
        fontSize: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: 16,
        gap: 16,
    },
    card: {
        borderRadius: 16,
        overflow: 'hidden',
    },
    cardImage: {
        width: '100%',
        height: 180,
    },
    cardContent: {
        padding: 16,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '700',
        flex: 1,
        marginRight: 8,
    },
    priceTag: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    priceText: {
        fontSize: 12,
        fontWeight: '700',
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 12,
    },
    locationText: {
        fontSize: 14,
    },
    amenitiesRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        alignItems: 'center',
    },
    amenityBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    amenityText: {
        fontSize: 12,
    },
    moreAmenities: {
        fontSize: 12,
    },
    emptyContainer: {
        padding: 32,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
    },
});
