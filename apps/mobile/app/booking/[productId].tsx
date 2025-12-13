import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView, Image } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import RazorpayCheckout from 'react-native-razorpay';
import { useTheme } from '@/theme';
import { useAuth } from '@/hooks/useAuth';
import { productsApi } from '@/services/supabase';

// Helper to interact with your Next.js API
// In a real app, this should be in a separate API service file
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://studio-uninest-deployed-main.vercel.app'; // Fallback or dynamic

export default function BookingScreen() {
    const { productId } = useLocalSearchParams<{ productId: string }>();
    const { theme } = useTheme();
    const { user, session } = useAuth();
    const router = useRouter();
    const [isProcessing, setIsProcessing] = useState(false);

    // Fetch Product Details
    const { data: product, isLoading: isProductLoading } = useQuery({
        queryKey: ['product', productId],
        queryFn: () => productsApi.getProduct(Number(productId)),
        enabled: !!productId,
    });

    if (isProductLoading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator size="large" color={theme.colors.primary[600]} />
            </View>
        );
    }

    if (!product) {
        return (
            <View style={[styles.container, { backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: theme.colors.foreground }}>Product not found</Text>
            </View>
        );
    }

    const handlePay = async () => {
        if (!user || !session) {
            Alert.alert('Login Required', 'Please log in to make a purchase.');
            return;
        }

        setIsProcessing(true);

        try {
            // 1. Create Order on Server (to get Razorpay Order ID)
            const orderRes = await fetch(`${API_URL}/api/create-order`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({
                    amount: product.price * 100, // Amount in paise
                    currency: 'INR',
                })
            });

            const orderData = await orderRes.json();

            if (!orderRes.ok) {
                throw new Error(orderData.error || 'Failed to initiate payment');
            }

            // 2. Open Razorpay Checkout
            const options = {
                description: `Purchase: ${product.name}`,
                image: product.image_url || 'https://via.placeholder.com/150',
                currency: 'INR',
                key: process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_G1sD4K7w8sD4K7', // Replace with your env var
                amount: orderData.amount, // amount from server
                name: 'UniNest',
                order_id: orderData.id, // Razorpay Order ID
                prefill: {
                    email: user.email || '',
                    contact: user.phone || '',
                    name: user.user_metadata?.full_name || '',
                },
                theme: { color: theme.colors.primary[600] }
            };

            const data = await RazorpayCheckout.open(options);

            // 3. Verify Payment on Server
            const verifyRes = await fetch(`${API_URL}/api/verify-payment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({
                    type: 'marketplace_order',
                    orderId: orderData.id,
                    razorpay_payment_id: data.razorpay_payment_id,
                    razorpay_signature: data.razorpay_signature,
                    amount: product.price, // Store the actual amount (Rupees)
                    productId: product.id,
                    vendorId: product.seller_id,
                    quantity: 1
                })
            });

            const verifyData = await verifyRes.json();

            if (!verifyRes.ok) {
                // Payment succeeded at generic level but validtion failed on server?
                // In production you might want to webhook this or show pending state.
                throw new Error(verifyData.error || 'Payment verification failed');
            }

            // Success!
            Alert.alert('Success', 'Your order has been placed successfully!', [
                { text: 'OK', onPress: () => router.navigate('/(tabs)') } // Go to home or orders tab
            ]);

        } catch (error: any) {
            console.error('Payment Error:', error);
            // Handle cancellations or errors
            if (error.code && error.code === 'PAYMENT_CANCELLED') {
                // User cancelled, do nothing?
            } else {
                Alert.alert('Payment Failed', error.description || error.message || 'Something went wrong.');
            }
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <Stack.Screen options={{ headerTitle: 'Complete Booking' }} />

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Product Summary */}
                <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.foreground }]}>Order Summary</Text>

                    <View style={styles.productRow}>
                        <Image source={{ uri: product.image_url || '' }} style={styles.thumb} />
                        <View style={styles.productDetails}>
                            <Text style={[styles.productName, { color: theme.colors.foreground }]} numberOfLines={2}>{product.name}</Text>
                            <Text style={[styles.sellerName, { color: theme.colors.mutedForeground }]}>by {product.seller?.full_name}</Text>
                        </View>
                    </View>

                    <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

                    <View style={styles.priceRow}>
                        <Text style={[styles.priceLabel, { color: theme.colors.mutedForeground }]}>Subtotal</Text>
                        <Text style={[styles.priceValue, { color: theme.colors.foreground }]}>₹{product.price.toLocaleString()}</Text>
                    </View>
                    <View style={styles.priceRow}>
                        <Text style={[styles.priceLabel, { color: theme.colors.mutedForeground }]}>Booking Fee</Text>
                        <Text style={[styles.priceValue, { color: theme.colors.foreground }]}>₹0</Text>
                    </View>
                    <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
                    <View style={styles.priceRow}>
                        <Text style={[styles.totalLabel, { color: theme.colors.foreground }]}>Total</Text>
                        <Text style={[styles.totalValue, { color: theme.colors.primary[600] }]}>₹{product.price.toLocaleString()}</Text>
                    </View>
                </View>

                {/* Payment Info */}
                <View style={styles.infoBox}>
                    <Ionicons name="shield-checkmark-outline" size={20} color={theme.colors.success} style={{ marginRight: 8 }} />
                    <Text style={[styles.infoText, { color: theme.colors.mutedForeground }]}>Secure payment via Razorpay</Text>
                </View>

            </ScrollView>

            {/* Bottom Action */}
            <View style={[styles.footer, { backgroundColor: theme.colors.background, borderTopColor: theme.colors.border }]}>
                <TouchableOpacity
                    style={[styles.payButton, { backgroundColor: theme.colors.primary[600], opacity: isProcessing ? 0.7 : 1 }]}
                    onPress={handlePay}
                    disabled={isProcessing}
                >
                    {isProcessing ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text style={styles.payButtonText}>Pay ₹{product.price.toLocaleString()}</Text>
                    )}
                </TouchableOpacity>
            </View>
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
    scrollContent: {
        padding: 16,
    },
    card: {
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
    },
    productRow: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    thumb: {
        width: 60,
        height: 60,
        borderRadius: 8,
        backgroundColor: '#eee',
    },
    productDetails: {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'center',
    },
    productName: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 4,
    },
    sellerName: {
        fontSize: 14,
    },
    divider: {
        height: 1,
        width: '100%',
        marginVertical: 12,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    priceLabel: {
        fontSize: 14,
    },
    priceValue: {
        fontSize: 14,
        fontWeight: '500',
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: '700',
    },
    totalValue: {
        fontSize: 18,
        fontWeight: '700',
    },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    infoText: {
        fontSize: 12,
    },
    footer: {
        padding: 16,
        borderTopWidth: 1,
    },
    payButton: {
        height: 50,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    payButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});
