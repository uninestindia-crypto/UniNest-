import React from 'react';
import { View, Text, StyleSheet, ViewStyle, ImageStyle } from 'react-native';
import { Image } from 'expo-image';
import { useTheme } from '@/theme';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export interface AvatarProps {
    /** Image source URI */
    source?: string | null;
    /** Fallback text (usually initials) */
    fallback?: string;
    /** Avatar size */
    size?: AvatarSize;
    /** Show online status indicator */
    showStatus?: boolean;
    /** Online status */
    status?: 'online' | 'offline' | 'away';
    /** Custom style override */
    style?: ViewStyle;
    /** Alt text for accessibility */
    alt?: string;
}

const SIZE_MAP: Record<AvatarSize, number> = {
    xs: 24,
    sm: 32,
    md: 40,
    lg: 48,
    xl: 64,
    '2xl': 96,
};

const FONT_SIZE_MAP: Record<AvatarSize, number> = {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 18,
    xl: 24,
    '2xl': 36,
};

export function Avatar({
    source,
    fallback,
    size = 'md',
    showStatus = false,
    status = 'offline',
    style,
    alt,
}: AvatarProps) {
    const { theme } = useTheme();
    const { colors } = theme;

    const dimension = SIZE_MAP[size];
    const fontSize = FONT_SIZE_MAP[size];

    const getInitials = (text?: string): string => {
        if (!text) return '?';
        const words = text.trim().split(' ');
        if (words.length === 1) {
            return words[0].charAt(0).toUpperCase();
        }
        return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
    };

    const getStatusColor = (): string => {
        switch (status) {
            case 'online':
                return colors.success;
            case 'away':
                return colors.warning;
            default:
                return colors.mutedForeground;
        }
    };

    const statusSize = Math.max(dimension * 0.25, 8);

    return (
        <View
            style={[
                styles.container,
                {
                    width: dimension,
                    height: dimension,
                    borderRadius: dimension / 2,
                },
                style,
            ]}
            accessibilityLabel={alt || fallback || 'Avatar'}
            accessibilityRole="image"
        >
            {source ? (
                <Image
                    source={{ uri: source }}
                    style={[
                        styles.image,
                        {
                            width: dimension,
                            height: dimension,
                            borderRadius: dimension / 2,
                        },
                    ]}
                    contentFit="cover"
                    transition={200}
                    placeholder={require('@/assets/icon.png')}
                />
            ) : (
                <View
                    style={[
                        styles.fallback,
                        {
                            width: dimension,
                            height: dimension,
                            borderRadius: dimension / 2,
                            backgroundColor: colors.muted,
                        },
                    ]}
                >
                    <Text
                        style={[
                            styles.fallbackText,
                            {
                                fontSize,
                                color: colors.mutedForeground,
                            },
                        ]}
                    >
                        {getInitials(fallback)}
                    </Text>
                </View>
            )}
            {showStatus && (
                <View
                    style={[
                        styles.statusIndicator,
                        {
                            width: statusSize,
                            height: statusSize,
                            borderRadius: statusSize / 2,
                            backgroundColor: getStatusColor(),
                            borderColor: colors.card,
                        },
                    ]}
                    accessibilityLabel={`Status: ${status}`}
                />
            )}
        </View>
    );
}

// Avatar Group component for stacked avatars
export interface AvatarGroupProps {
    /** Array of avatar sources */
    avatars: Array<{ source?: string; fallback?: string }>;
    /** Max avatars to show */
    max?: number;
    /** Avatar size */
    size?: AvatarSize;
    /** Custom style override */
    style?: ViewStyle;
}

export function AvatarGroup({ avatars, max = 4, size = 'md', style }: AvatarGroupProps) {
    const { theme } = useTheme();
    const { colors } = theme;
    const dimension = SIZE_MAP[size];
    const displayAvatars = avatars.slice(0, max);
    const remaining = avatars.length - max;

    return (
        <View style={[styles.group, style]}>
            {displayAvatars.map((avatar, index) => (
                <View
                    key={index}
                    style={[
                        styles.groupItem,
                        {
                            marginLeft: index === 0 ? 0 : -(dimension * 0.3),
                            zIndex: displayAvatars.length - index,
                        },
                    ]}
                >
                    <Avatar
                        source={avatar.source}
                        fallback={avatar.fallback}
                        size={size}
                        style={{
                            borderWidth: 2,
                            borderColor: colors.card,
                        }}
                    />
                </View>
            ))}
            {remaining > 0 && (
                <View
                    style={[
                        styles.groupItem,
                        styles.remainingBadge,
                        {
                            width: dimension,
                            height: dimension,
                            borderRadius: dimension / 2,
                            marginLeft: -(dimension * 0.3),
                            backgroundColor: colors.muted,
                            borderWidth: 2,
                            borderColor: colors.card,
                        },
                    ]}
                >
                    <Text style={[styles.remainingText, { color: colors.mutedForeground }]}>
                        +{remaining}
                    </Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'relative',
    },
    image: {
        // Styles applied inline
    },
    fallback: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    fallbackText: {
        fontWeight: '600',
    },
    statusIndicator: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        borderWidth: 2,
    },
    group: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    groupItem: {
        // Individual group item styles
    },
    remainingBadge: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    remainingText: {
        fontSize: 12,
        fontWeight: '600',
    },
});
