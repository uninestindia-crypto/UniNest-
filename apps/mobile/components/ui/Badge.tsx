import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/theme';

type BadgeVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline';
type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps {
    /** Badge text content */
    children: React.ReactNode;
    /** Badge visual variant */
    variant?: BadgeVariant;
    /** Badge size */
    size?: BadgeSize;
    /** Custom style override */
    style?: ViewStyle;
    /** Left icon */
    leftIcon?: React.ReactNode;
    /** Use dot indicator instead of text */
    dot?: boolean;
}

export function Badge({
    children,
    variant = 'default',
    size = 'md',
    style,
    leftIcon,
    dot = false,
}: BadgeProps) {
    const { theme } = useTheme();
    const { colors, radius } = theme;

    const getBackgroundColor = (): string => {
        switch (variant) {
            case 'primary':
                return colors.primary[500];
            case 'secondary':
                return colors.muted;
            case 'success':
                return colors.success;
            case 'warning':
                return colors.warning;
            case 'destructive':
                return colors.destructive;
            case 'outline':
                return 'transparent';
            default:
                return colors.muted;
        }
    };

    const getTextColor = (): string => {
        switch (variant) {
            case 'primary':
                return '#ffffff';
            case 'secondary':
            case 'default':
                return colors.foreground;
            case 'success':
                return colors.successForeground;
            case 'warning':
                return colors.warningForeground;
            case 'destructive':
                return colors.destructiveForeground;
            case 'outline':
                return colors.foreground;
            default:
                return colors.foreground;
        }
    };

    const getBorderColor = (): string => {
        if (variant === 'outline') {
            return colors.border;
        }
        return 'transparent';
    };

    const getPadding = (): { paddingVertical: number; paddingHorizontal: number } => {
        if (dot) {
            return { paddingVertical: 0, paddingHorizontal: 0 };
        }
        switch (size) {
            case 'sm':
                return { paddingVertical: 2, paddingHorizontal: 6 };
            case 'lg':
                return { paddingVertical: 6, paddingHorizontal: 12 };
            default:
                return { paddingVertical: 4, paddingHorizontal: 8 };
        }
    };

    const getFontSize = (): number => {
        switch (size) {
            case 'sm':
                return 10;
            case 'lg':
                return 14;
            default:
                return 12;
        }
    };

    const getDotSize = (): number => {
        switch (size) {
            case 'sm':
                return 6;
            case 'lg':
                return 10;
            default:
                return 8;
        }
    };

    const padding = getPadding();
    const textColor = getTextColor();
    const backgroundColor = getBackgroundColor();
    const borderColor = getBorderColor();

    if (dot) {
        const dotSize = getDotSize();
        return (
            <View
                style={[
                    styles.dot,
                    {
                        width: dotSize,
                        height: dotSize,
                        borderRadius: dotSize / 2,
                        backgroundColor,
                    },
                    style,
                ]}
                accessibilityLabel={typeof children === 'string' ? children : 'Status indicator'}
            />
        );
    }

    return (
        <View
            style={[
                styles.badge,
                {
                    backgroundColor,
                    borderColor,
                    borderWidth: variant === 'outline' ? 1 : 0,
                    borderRadius: radius.full,
                    ...padding,
                },
                style,
            ]}
        >
            {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
            <Text
                style={[
                    styles.text,
                    {
                        color: textColor,
                        fontSize: getFontSize(),
                    },
                ]}
            >
                {children}
            </Text>
        </View>
    );
}

// Notification Badge (for icons)
export interface NotificationBadgeProps {
    /** Number to display */
    count?: number;
    /** Max number to display (shows +) */
    max?: number;
    /** Show dot only */
    dot?: boolean;
    /** Children to wrap */
    children: React.ReactNode;
    /** Badge style override */
    badgeStyle?: ViewStyle;
}

export function NotificationBadge({
    count,
    max = 99,
    dot = false,
    children,
    badgeStyle,
}: NotificationBadgeProps) {
    const { theme } = useTheme();
    const { colors } = theme;

    const showBadge = dot || (count !== undefined && count > 0);
    const displayCount = count && count > max ? `${max}+` : count;

    return (
        <View style={styles.notificationContainer}>
            {children}
            {showBadge && (
                <View
                    style={[
                        styles.notificationBadge,
                        dot ? styles.notificationDot : styles.notificationCount,
                        { backgroundColor: colors.destructive },
                        badgeStyle,
                    ]}
                >
                    {!dot && (
                        <Text style={styles.notificationText}>{displayCount}</Text>
                    )}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
    },
    text: {
        fontWeight: '500',
    },
    leftIcon: {
        marginRight: 4,
    },
    dot: {
        // Inline styles handle sizing
    },
    notificationContainer: {
        position: 'relative',
    },
    notificationBadge: {
        position: 'absolute',
        top: -4,
        right: -4,
    },
    notificationDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    notificationCount: {
        minWidth: 18,
        height: 18,
        borderRadius: 9,
        paddingHorizontal: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    notificationText: {
        color: '#ffffff',
        fontSize: 10,
        fontWeight: '600',
    },
});
