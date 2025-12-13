import { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    Image,
    ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';
import { productsApi } from '@/services/supabase';
import type { Product } from '@uninest/shared-types';

export default function SearchScreen() {
    const { theme } = useTheme();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');

    const { data: products, isLoading, refetch } = useQuery({
        queryKey: ['products', 'search', searchQuery],
        queryFn: () => productsApi.searchProducts(searchQuery),
        enabled: searchQuery.length > 2,
    });

    const renderProduct = ({ item }: { item: Product }) => (
        <TouchableOpacity
            style={[styles.productRow, { borderBottomColor: theme.colors.border }]}
            onPress={() => router.push(`/product/${item.id}`)}
        >
            <Image
                source={{ uri: item.image_url || 'https://via.placeholder.com/60' }}
                style={styles.productImage}
            />
            <View style={styles.productInfo}>
                <Text style={[styles.productName, { color: theme.colors.foreground }]}>
                    {item.name}
                </Text>
                <Text style={[styles.productCategory, { color: theme.colors.mutedForeground }]}>
                    {item.category} • {item.location}
                </Text>
                <Text style={[styles.productPrice, { color: theme.colors.primary[600] }]}>
                    ₹{item.price.toLocaleString()}
                </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.mutedForeground} />
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {/* Search Input */}
            <View style={styles.searchContainer}>
                <View
                    style={[
                        styles.searchInput,
                        { backgroundColor: theme.colors.muted, borderColor: theme.colors.border },
                    ]}
                >
                    <Ionicons name="search-outline" size={20} color={theme.colors.mutedForeground} />
                    <TextInput
                        style={[styles.input, { color: theme.colors.foreground }]}
                        placeholder="Search for hostels, PG, mess..."
                        placeholderTextColor={theme.colors.mutedForeground}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={20} color={theme.colors.mutedForeground} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Results */}
            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary[600]} />
                </View>
            ) : searchQuery.length < 3 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="search-outline" size={48} color={theme.colors.mutedForeground} />
                    <Text style={[styles.emptyText, { color: theme.colors.mutedForeground }]}>
                        Type at least 3 characters to search
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={products}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderProduct}
                    contentContainerStyle={styles.resultsList}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="alert-circle-outline" size={48} color={theme.colors.mutedForeground} />
                            <Text style={[styles.emptyText, { color: theme.colors.mutedForeground }]}>
                                No results found for "{searchQuery}"
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
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    searchInput: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 48,
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 12,
        gap: 8,
    },
    input: {
        flex: 1,
        fontSize: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    resultsList: {
        paddingBottom: 24,
    },
    productRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    productImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
    },
    productInfo: {
        flex: 1,
        marginLeft: 12,
    },
    productName: {
        fontSize: 16,
        fontWeight: '600',
    },
    productCategory: {
        fontSize: 14,
        marginTop: 2,
    },
    productPrice: {
        fontSize: 14,
        fontWeight: '600',
        marginTop: 4,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
        marginTop: 16,
    },
});
