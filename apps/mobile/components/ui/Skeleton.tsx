import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle, DimensionValue } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    interpolate,
} from 'react-native-reanimated';
import { useTheme } from '@/theme';

type SkeletonVariant = 'text' | 'rectangular' | 'circular' | 'rounded';

export interface SkeletonProps {
    /** Width of the skeleton (number or percentage string) */
    width?: DimensionValue;
    /** Height of the skeleton */
    height?: number;
    /** Skeleton shape variant */
    variant?: SkeletonVariant;
    /** Border radius (overrides variant) */
    radius?: number;
    /** Disable animation */
    animation?: boolean;
    /** Custom style override */
    style?: ViewStyle;
}

export function Skeleton({
    width = '100%',
    height = 20,
    variant = 'text',
    radius,
    animation = true,
    style,
}: SkeletonProps) {
    const { theme } = useTheme();
    const { colors, radius: themeRadius } = theme;
    const shimmer = useSharedValue(0);

    useEffect(() => {
        if (animation) {
            shimmer.value = withRepeat(
                withTiming(1, { duration: 1500 }),
                -1, // Infinite
                false
            );
        }
    }, [animation, shimmer]);

    const getBorderRadius = (): number => {
        if (radius !== undefined) return radius;

        switch (variant) {
            case 'circular':
                return typeof height === 'number' ? height / 2 : 9999;
            case 'rounded':
                return themeRadius.md;
            case 'rectangular':
                return 0;
            case 'text':
            default:
                return themeRadius.sm;
        }
    };

    const animatedStyle = useAnimatedStyle(() => {
        if (!animation) {
            return {};
        }

        const opacity = interpolate(shimmer.value, [0, 0.5, 1], [0.3, 0.6, 0.3]);

        return {
            opacity,
        };
    });

    return (
        <Animated.View
            style={[
                styles.skeleton,
                {
                    width,
                    height,
                    borderRadius: getBorderRadius(),
                    backgroundColor: colors.muted,
                },
                animatedStyle,
                style,
            ]}
        />
    );
}

// Skeleton Group for common patterns
export interface SkeletonCardProps {
    /** Show image placeholder */
    hasImage?: boolean;
    /** Number of text lines */
    lines?: number;
    /** Custom style */
    style?: ViewStyle;
}

export function SkeletonCard({ hasImage = true, lines = 3, style }: SkeletonCardProps) {
    const { theme } = useTheme();
    const { spacing, radius } = theme;

    return (
        <View style={[styles.card, { borderRadius: radius.lg }, style]}>
            {hasImage && (
                <Skeleton
                    variant="rectangular"
                    width="100%"
                    height={160}
                    radius={0}
                    style={styles.cardImage}
                />
            )}
            <View style={[styles.cardContent, { padding: spacing.md }]}>
                <Skeleton variant="text" width="60%" height={20} style={styles.cardTitle} />
                {Array.from({ length: lines }).map((_, index) => (
                    <Skeleton
                        key={index}
                        variant="text"
                        width={index === lines - 1 ? '40%' : '100%'}
                        height={14}
                        style={styles.cardLine}
                    />
                ))}
            </View>
        </View>
    );
}

// Skeleton List Item
export interface SkeletonListItemProps {
    /** Show avatar */
    hasAvatar?: boolean;
    /** Avatar size */
    avatarSize?: number;
    /** Number of text lines */
    lines?: number;
    /** Custom style */
    style?: ViewStyle;
}

export function SkeletonListItem({
    hasAvatar = true,
    avatarSize = 48,
    lines = 2,
    style,
}: SkeletonListItemProps) {
    const { theme } = useTheme();
    const { spacing } = theme;

    return (
        <View style={[styles.listItem, { padding: spacing.md }, style]}>
            {hasAvatar && (
                <Skeleton
                    variant="circular"
                    width={avatarSize}
                    height={avatarSize}
                    style={styles.listAvatar}
                />
            )}
            <View style={styles.listContent}>
                <Skeleton variant="text" width="70%" height={16} style={styles.listTitle} />
                {lines > 1 && (
                    <Skeleton variant="text" width="50%" height={12} style={styles.listSubtitle} />
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    skeleton: {
        overflow: 'hidden',
    },
    card: {
        overflow: 'hidden',
    },
    cardImage: {
        // Image placeholder
    },
    cardContent: {
        // Content area
    },
    cardTitle: {
        marginBottom: 12,
    },
    cardLine: {
        marginBottom: 8,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    listAvatar: {
        marginRight: 12,
    },
    listContent: {
        flex: 1,
    },
    listTitle: {
        marginBottom: 6,
    },
    listSubtitle: {
        // Subtitle styles
    },
});
