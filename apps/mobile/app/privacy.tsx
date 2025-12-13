import { View, StyleSheet, Text, Pressable, Linking } from 'react-native';
import { Stack } from 'expo-router';
import { WebView } from 'react-native-webview';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';
import Constants from 'expo-constants';

const PRIVACY_POLICY_URL = 'https://uninest.app/privacy';

export default function PrivacyPolicyScreen() {
    const { theme } = useTheme();
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    const handleOpenExternal = () => {
        Linking.openURL(PRIVACY_POLICY_URL);
    };

    if (hasError) {
        return (
            <>
                <Stack.Screen
                    options={{
                        headerTitle: 'Privacy Policy',
                        headerRight: () => (
                            <Pressable onPress={handleOpenExternal} style={styles.headerButton}>
                                <Ionicons name="open-outline" size={22} color={theme.colors.primary[500]} />
                            </Pressable>
                        ),
                    }}
                />
                <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
                    <View style={styles.errorContainer}>
                        <Ionicons name="cloud-offline-outline" size={64} color={theme.colors.mutedForeground} />
                        <Text style={[styles.errorTitle, { color: theme.colors.foreground }]}>
                            Unable to Load
                        </Text>
                        <Text style={[styles.errorText, { color: theme.colors.mutedForeground }]}>
                            The privacy policy could not be loaded. Please check your internet connection.
                        </Text>
                        <Pressable
                            style={[styles.retryButton, { backgroundColor: theme.colors.primary[500] }]}
                            onPress={() => setHasError(false)}
                        >
                            <Text style={styles.retryButtonText}>Try Again</Text>
                        </Pressable>
                        <Pressable
                            style={styles.externalButton}
                            onPress={handleOpenExternal}
                        >
                            <Text style={[styles.externalButtonText, { color: theme.colors.primary[500] }]}>
                                Open in Browser
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </>
        );
    }

    return (
        <>
            <Stack.Screen
                options={{
                    headerTitle: 'Privacy Policy',
                    headerRight: () => (
                        <Pressable onPress={handleOpenExternal} style={styles.headerButton}>
                            <Ionicons name="open-outline" size={22} color={theme.colors.primary[500]} />
                        </Pressable>
                    ),
                }}
            />
            <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
                {isLoading && (
                    <View style={styles.loadingOverlay}>
                        <Text style={[styles.loadingText, { color: theme.colors.mutedForeground }]}>
                            Loading...
                        </Text>
                    </View>
                )}
                <WebView
                    source={{ uri: PRIVACY_POLICY_URL }}
                    style={styles.webview}
                    onLoadStart={() => setIsLoading(true)}
                    onLoadEnd={() => setIsLoading(false)}
                    onError={() => setHasError(true)}
                    startInLoadingState
                    javaScriptEnabled
                    domStorageEnabled
                />
                <View style={[styles.footer, { backgroundColor: theme.colors.card, borderTopColor: theme.colors.border }]}>
                    <Text style={[styles.footerText, { color: theme.colors.mutedForeground }]}>
                        Uninest v{Constants.expoConfig?.version || '1.0.0'}
                    </Text>
                    <Text style={[styles.footerText, { color: theme.colors.mutedForeground }]}>
                        Last updated: December 2024
                    </Text>
                </View>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    webview: {
        flex: 1,
    },
    headerButton: {
        padding: 8,
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    loadingText: {
        fontSize: 16,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    errorTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginTop: 16,
        marginBottom: 8,
    },
    errorText: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 24,
    },
    retryButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
        marginBottom: 12,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    externalButton: {
        padding: 12,
    },
    externalButtonText: {
        fontSize: 16,
        fontWeight: '500',
    },
    footer: {
        padding: 16,
        alignItems: 'center',
        borderTopWidth: 1,
    },
    footerText: {
        fontSize: 12,
    },
});
