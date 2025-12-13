import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator, FlatList, Dimensions } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';
import { productsApi } from '@/services/supabase';
import type { Product } from '@uninest/shared-types';

const { width } = Dimensions.get('window');

function RoomCard({ item }: { item: Product }) {
    const { theme } = useTheme();
    const router = useRouter();

    return (
        <View style={[styles.roomCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <Image
                source={{ uri: item.image_url || 'https://via.placeholder.com/200' }}
                style={styles.roomImage}
            />
            <View style={styles.roomContent}>
                <Text style={[styles.roomTitle, { color: theme.colors.foreground }]}>{item.name}</Text>

                {/* Room Features */}
                <View style={styles.roomFeatures}>
                    {item.occupancy && (
                        <View style={styles.featureItem}>
                            <Ionicons name="people-outline" size={14} color={theme.colors.mutedForeground} />
                            <Text style={[styles.featureText, { color: theme.colors.mutedForeground }]}>{item.occupancy} Share</Text>
                        </View>
                    )}
                    {item.furnishing && (
                        <View style={styles.featureItem}>
                            <Ionicons name="bed-outline" size={14} color={theme.colors.mutedForeground} />
                            <Text style={[styles.featureText, { color: theme.colors.mutedForeground }]}>{item.furnishing}</Text>
                        </View>
                    )}
                </View>

                {/* Price and Book */}
                <View style={styles.roomFooter}>
                    <View>
                        <Text style={[styles.roomPrice, { color: theme.colors.foreground }]}>₹{item.price.toLocaleString()}</Text>
                        <Text style={[styles.periodText, { color: theme.colors.mutedForeground }]}>per person</Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.bookButton, { backgroundColor: theme.colors.primary[600] }]}
                        onPress={() => router.push(`/booking/${item.id}`)}
                    >
                        <Text style={styles.bookButtonText}>Book</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

export default function HostelDetailScreen() {
    const { id } = useLocalSearchParams();
    const { theme } = useTheme();
    const router = useRouter();

    // 1. Fetch Hostel Details
    const { data: hostel, isLoading: loadingHostel } = useQuery({
        queryKey: ['hostel', id],
        queryFn: () => productsApi.getProduct(Number(id)),
        enabled: !!id,
    });

    // 2. Fetch Hostel Rooms (using seller_id from hostel)
    const { data: rooms, isLoading: loadingRooms } = useQuery({
        queryKey: ['hostel-rooms', hostel?.seller_id],
        queryFn: () => productsApi.getHostelRooms(hostel!.seller_id),
        enabled: !!hostel?.seller_id,
    });

    if (loadingHostel) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator size="large" color={theme.colors.primary[500]} />
            </View>
        );
    }

    if (!hostel) {
        return (
            <View style={[styles.container, { backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' }]}>
                <Text>Hostel not found</Text>
            </View>
        );
    }

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {/* Banner */}
            <Image
                source={{ uri: hostel.image_url || 'https://via.placeholder.com/800' }}
                style={styles.banner}
                resizeMode="cover"
            />

            <View style={styles.content}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={[styles.title, { color: theme.colors.foreground }]}>{hostel.name}</Text>
                    {hostel.location && (
                        <View style={styles.locationRow}>
                            <Ionicons name="location-outline" size={16} color={theme.colors.mutedForeground} />
                            <Text style={[styles.locationText, { color: theme.colors.mutedForeground }]}>{hostel.location}</Text>
                        </View>
                    )}
                </View>

                {/* Description */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.foreground }]}>About</Text>
                    <Text style={[styles.description, { color: theme.colors.mutedForeground }]}>{hostel.description}</Text>
                </View>

                {/* Amenities */}
                {hostel.amenities && hostel.amenities.length > 0 && (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: theme.colors.foreground }]}>Amenities</Text>
                        <View style={styles.amenitiesGrid}>
                            {hostel.amenities.map((amenity, index) => (
                                <View key={index} style={[styles.amenityItem, { backgroundColor: theme.colors.card }]}>
                                    <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
                                    <Text style={[styles.amenityText, { color: theme.colors.foreground }]}>{amenity}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* Rooms Selection */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.foreground }]}>Available Rooms</Text>

                    {loadingRooms ? (
                        <ActivityIndicator color={theme.colors.primary[500]} />
                    ) : rooms && rooms.length > 0 ? (
                        <View style={styles.roomsList}>
                            {rooms.map(room => <RoomCard key={room.id} item={room} />)}
                        </View>
                    ) : (
                        <Text style={[styles.emptyText, { color: theme.colors.mutedForeground }]}>
                            No rooms currently listed for online booking. Please contact the hostel directly.
                        </Text>
                    )}
                </View>

                {/* Contact */}
                {(hostel.phone_number || hostel.whatsapp_number) && (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: theme.colors.foreground }]}>Contact</Text>
                        <View style={styles.contactButtons}>
                            {hostel.phone_number && (
                                <TouchableOpacity style={[styles.contactBtn, { backgroundColor: theme.colors.muted }]}>
                                    <Ionicons name="call" size={20} color={theme.colors.foreground} />
                                    <Text style={[styles.contactBtnText, { color: theme.colors.foreground }]}>Call</Text>
                                </TouchableOpacity>
                            )}
                            {hostel.whatsapp_number && (
                                <TouchableOpacity style={[styles.contactBtn, { backgroundColor: '#25D366' }]}>
                                    <Ionicons name="logo-whatsapp" size={20} color="white" />
                                    <Text style={[styles.contactBtnText, { color: 'white' }]}>WhatsApp</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                )}
            </View>
        </ScrollView>
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
    banner: {
        width: width,
        height: 250,
    },
    content: {
        padding: 20,
    },
    header: {
        marginBottom: 20,
    },
    title: {
        fontSize: 26,
        fontWeight: '700',
        marginBottom: 8,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    locationText: {
        fontSize: 16,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 12,
    },
    description: {
        fontSize: 15,
        lineHeight: 24,
    },
    amenitiesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    amenityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        gap: 8,
    },
    amenityText: {
        fontSize: 14,
    },
    roomsList: {
        gap: 16,
    },
    roomCard: {
        flexDirection: 'row',
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
    },
    roomImage: {
        width: 100,
        height: 120,
        backgroundColor: '#eee',
    },
    roomContent: {
        flex: 1,
        padding: 12,
        justifyContent: 'space-between',
    },
    roomTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    roomFeatures: {
        flexDirection: 'row',
        gap: 12,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    featureText: {
        fontSize: 12,
    },
    roomFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    roomPrice: {
        fontSize: 16,
        fontWeight: '700',
    },
    periodText: {
        fontSize: 11,
    },
    bookButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 6,
    },
    bookButtonText: {
        color: 'white',
        fontSize: 13,
        fontWeight: '600',
    },
    emptyText: {
        fontSize: 14,
        fontStyle: 'italic',
    },
    contactButtons: {
        flexDirection: 'row',
        gap: 16,
    },
    contactBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 10,
        gap: 8,
    },
    contactBtnText: {
        fontSize: 16,
        fontWeight: '600',
    },
});
