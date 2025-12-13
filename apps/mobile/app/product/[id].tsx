import { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    Linking,
    Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';
import { useAuth } from '@/hooks/useAuth';
import { productsApi } from '@/services/supabase';
import { supabase } from '@/services/supabase';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { theme } = useTheme();
    const { user } = useAuth();
    const router = useRouter();

    const { data: product, isLoading } = useQuery({
        queryKey: ['product', id],
        queryFn: () => productsApi.getProduct(Number(id)),
        enabled: !!id,
    });

    if (isLoading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator size="large" color={theme.colors.primary[600]} />
            </View>
        );
    }

    if (!product) {
        return (
            <View style={[styles.errorContainer, { backgroundColor: theme.colors.background }]}>
                <Ionicons name="alert-circle-outline" size={48} color={theme.colors.destructive} />
                <Text style={[styles.errorText, { color: theme.colors.foreground }]}>
                    Product not found
                </Text>
            </View>
        );
    }

    const handleCallSeller = () => {
        if (product.phone_number) {
            Linking.openURL(`tel:${product.phone_number}`);
        }
    };

    const handleWhatsApp = () => {
        if (product.whatsapp_number) {
            Linking.openURL(`whatsapp://send?phone=${product.whatsapp_number}`);
        }
    };

    const handleBook = () => {
        router.push(`/booking/${product.id}`);
    };

    // Favorites Logic
    const [isFavorited, setIsFavorited] = useState(false);

    useEffect(() => {
        if (!user || !product) return;

        const checkFavorite = async () => {
            const { data } = await supabase
                .from('favorites')
                .select('product_id')
                .eq('user_id', user.id)
                .eq('product_id', product.id)
                .single();
            setIsFavorited(!!data);
        };
        checkFavorite();
    }, [user, product]);

    const toggleFavorite = async () => {
        if (!user) return;

        const newStatus = !isFavorited;
        setIsFavorited(newStatus); // Optimistic

        if (newStatus) {
            await supabase.from('favorites').insert({ user_id: user.id, product_id: product.id });
        } else {
            await supabase.from('favorites').delete().eq('user_id', user.id).eq('product_id', product.id);
        }
    };

    return (
        <>
            <Stack.Screen
                options={{
                    headerTitle: product.name,
                    headerRight: () => (
                        <TouchableOpacity onPress={toggleFavorite}>
                            <Ionicons
                                name={isFavorited ? "heart" : "heart-outline"}
                                size={24}
                                color={isFavorited ? "#ef4444" : theme.colors.foreground}
                            />
                        </TouchableOpacity>
                    )
                }}
            />
            <ScrollView
                style={[styles.container, { backgroundColor: theme.colors.background }]}
                showsVerticalScrollIndicator={false}
            >
                {/* Image */}
                <Image
                    source={{ uri: product.image_url || 'https://via.placeholder.com/400' }}
                    style={styles.image}
                    resizeMode="cover"
                />

                {/* Content */}
                <View style={styles.content}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.categoryBadge}>
                            <Text style={[styles.categoryText, { color: theme.colors.primary[600] }]}>
                                {product.category}
                            </Text>
                        </View>
                        <Text style={[styles.name, { color: theme.colors.foreground }]}>
                            {product.name}
                        </Text>
                        <Text style={[styles.price, { color: theme.colors.primary[600] }]}>
                            ₹{product.price.toLocaleString()}
                            {product.subscription_price && (
                                <Text style={[styles.subscriptionPrice, { color: theme.colors.mutedForeground }]}>
                                    {' '}/ ₹{product.subscription_price.toLocaleString()} monthly
                                </Text>
                            )}
                        </Text>
                    </View>

                    {/* Location */}
                    {product.location && (
                        <View style={[styles.section, { borderColor: theme.colors.border }]}>
                            <View style={styles.sectionHeader}>
                                <Ionicons name="location-outline" size={20} color={theme.colors.primary[600]} />
                                <Text style={[styles.sectionTitle, { color: theme.colors.foreground }]}>
                                    Location
                                </Text>
                            </View>
                            <Text style={[styles.sectionContent, { color: theme.colors.mutedForeground }]}>
                                {product.location}
                            </Text>
                        </View>
                    )}

                    {/* Description */}
                    <View style={[styles.section, { borderColor: theme.colors.border }]}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="document-text-outline" size={20} color={theme.colors.primary[600]} />
                            <Text style={[styles.sectionTitle, { color: theme.colors.foreground }]}>
                                Description
                            </Text>
                        </View>
                        <Text style={[styles.sectionContent, { color: theme.colors.mutedForeground }]}>
                            {product.description}
                        </Text>
                    </View>

                    {/* Amenities */}
                    {product.amenities && product.amenities.length > 0 && (
                        <View style={[styles.section, { borderColor: theme.colors.border }]}>
                            <View style={styles.sectionHeader}>
                                <Ionicons name="checkmark-circle-outline" size={20} color={theme.colors.primary[600]} />
                                <Text style={[styles.sectionTitle, { color: theme.colors.foreground }]}>
                                    Amenities
                                </Text>
                            </View>
                            <View style={styles.amenitiesGrid}>
                                {product.amenities.map((amenity, index) => (
                                    <View
                                        key={index}
                                        style={[styles.amenityChip, { backgroundColor: theme.colors.muted }]}
                                    >
                                        <Ionicons name="checkmark" size={14} color={theme.colors.success} />
                                        <Text style={[styles.amenityText, { color: theme.colors.foreground }]}>
                                            {amenity}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Seller Info */}
                    <View style={[styles.section, { borderColor: theme.colors.border }]}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="person-outline" size={20} color={theme.colors.primary[600]} />
                            <Text style={[styles.sectionTitle, { color: theme.colors.foreground }]}>
                                Listed by
                            </Text>
                        </View>
                        <View style={styles.sellerInfo}>
                            <Image
                                source={{
                                    uri: product.seller?.avatar_url || `https://ui-avatars.com/api/?name=${product.seller?.full_name || 'Seller'}`,
                                }}
                                style={styles.sellerAvatar}
                            />
                            <View style={styles.sellerDetails}>
                                <Text style={[styles.sellerName, { color: theme.colors.foreground }]}>
                                    {product.seller?.full_name || 'Seller'}
                                </Text>
                                {product.seller?.handle && (
                                    <Text style={[styles.sellerHandle, { color: theme.colors.mutedForeground }]}>
                                        @{product.seller.handle}
                                    </Text>
                                )}
                            </View>
                        </View>
                    </View>

                    {/* Contact Buttons */}
                    <View style={styles.contactButtons}>
                        {product.phone_number && (
                            <TouchableOpacity
                                style={[styles.contactButton, { backgroundColor: theme.colors.muted }]}
                                onPress={handleCallSeller}
                            >
                                <Ionicons name="call-outline" size={20} color={theme.colors.foreground} />
                                <Text style={[styles.contactButtonText, { color: theme.colors.foreground }]}>
                                    Call
                                </Text>
                            </TouchableOpacity>
                        )}
                        {product.whatsapp_number && (
                            <TouchableOpacity
                                style={[styles.contactButton, { backgroundColor: '#25D366' }]}
                                onPress={handleWhatsApp}
                            >
                                <Ionicons name="logo-whatsapp" size={20} color="#ffffff" />
                                <Text style={[styles.contactButtonText, { color: '#ffffff' }]}>
                                    WhatsApp
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </ScrollView>

            {/* Book Now Button */}
            <View style={[styles.footer, { backgroundColor: theme.colors.background, borderTopColor: theme.colors.border }]}>
                <View style={styles.footerPrice}>
                    <Text style={[styles.footerPriceLabel, { color: theme.colors.mutedForeground }]}>
                        Price
                    </Text>
                    <Text style={[styles.footerPriceValue, { color: theme.colors.foreground }]}>
                        ₹{product.price.toLocaleString()}
                    </Text>
                </View>
                <TouchableOpacity
                    style={[styles.bookButton, { backgroundColor: theme.colors.primary[600] }]}
                    onPress={handleBook}
                >
                    <Text style={styles.bookButtonText}>Book Now</Text>
                </TouchableOpacity>
            </View>
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
    errorText: {
        fontSize: 16,
        marginTop: 12,
    },
    image: {
        width: width,
        height: width * 0.75,
    },
    content: {
        padding: 16,
    },
    header: {
        marginBottom: 16,
    },
    categoryBadge: {
        alignSelf: 'flex-start',
        marginBottom: 8,
    },
    categoryText: {
        fontSize: 14,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    name: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 8,
    },
    price: {
        fontSize: 20,
        fontWeight: '700',
    },
    subscriptionPrice: {
        fontSize: 14,
        fontWeight: '400',
    },
    section: {
        paddingVertical: 16,
        borderTopWidth: 1,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 8,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    sectionContent: {
        fontSize: 14,
        lineHeight: 22,
    },
    amenitiesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    amenityChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 16,
        gap: 4,
    },
    amenityText: {
        fontSize: 13,
    },
    sellerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    sellerAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
    },
    sellerDetails: {
        marginLeft: 12,
    },
    sellerName: {
        fontSize: 16,
        fontWeight: '600',
    },
    sellerHandle: {
        fontSize: 14,
    },
    contactButtons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 16,
    },
    contactButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 8,
        gap: 8,
    },
    contactButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderTopWidth: 1,
    },
    footerPrice: {
        flex: 1,
    },
    footerPriceLabel: {
        fontSize: 12,
    },
    footerPriceValue: {
        fontSize: 18,
        fontWeight: '700',
    },
    bookButton: {
        paddingHorizontal: 32,
        paddingVertical: 14,
        borderRadius: 8,
    },
    bookButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
});
