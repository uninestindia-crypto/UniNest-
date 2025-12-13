import React from 'react';
import { View, StyleSheet, ViewStyle, StatusBar, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme';

type SafeViewProps = {
    children: React.ReactNode;
    style?: ViewStyle;
    edges?: ('top' | 'bottom' | 'left' | 'right')[];
    statusBarStyle?: 'light-content' | 'dark-content' | 'auto';
};

/**
 * SafeView - A wrapper component that handles safe area insets consistently
 * across iOS and Android, including notches, dynamic islands, and home indicators.
 * 
 * @example
 * <SafeView edges={['top', 'bottom']}>
 *   <YourContent />
 * </SafeView>
 */
export function SafeView({
    children,
    style,
    edges = ['top', 'bottom'],
    statusBarStyle = 'auto',
}: SafeViewProps) {
    const insets = useSafeAreaInsets();
    const { theme } = useTheme();

    const paddingStyle: ViewStyle = {
        paddingTop: edges.includes('top') ? insets.top : 0,
        paddingBottom: edges.includes('bottom') ? insets.bottom : 0,
        paddingLeft: edges.includes('left') ? insets.left : 0,
        paddingRight: edges.includes('right') ? insets.right : 0,
    };

    // Determine status bar style
    const barStyle = statusBarStyle === 'auto'
        ? (theme.isDark ? 'light-content' : 'dark-content')
        : statusBarStyle;

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }, paddingStyle, style]}>
            <StatusBar
                barStyle={barStyle}
                backgroundColor={theme.colors.background}
                translucent={Platform.OS === 'android'}
            />
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
