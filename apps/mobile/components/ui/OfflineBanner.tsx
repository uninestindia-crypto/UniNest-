import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export function OfflineBanner() {
    const insets = useSafeAreaInsets();
    const [isConnected, setIsConnected] = useState(true);

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            setIsConnected(state.isConnected ?? true);
        });

        return () => unsubscribe();
    }, []);

    if (isConnected) return null;

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.content}>
                <Ionicons name="cloud-offline" size={16} color="white" />
                <Text style={styles.text}>No Internet Connection</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#ef4444', // Red-500
        width: '100%',
        position: 'absolute',
        top: 0,
        zIndex: 9999,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        gap: 8,
    },
    text: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
    },
});
