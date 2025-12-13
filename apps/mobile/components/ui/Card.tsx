import React from 'react';
import { View, StyleSheet, ViewStyle, Pressable, PressableProps } from 'react-native';
import { useTheme } from '@/theme';

export interface CardProps extends Omit<PressableProps, 'style'> {
    /** Card content */
    children: React.ReactNode;
    /** Card variant */
    variant?: 'elevated' | 'outlined' | 'filled';
    /** Padding size */
    padding?: 'none' | 'sm' | 'md' | 'lg';
    /** Border radius size */
    radius?: 'sm' | 'md' | 'lg' | 'xl';
    /** Custom style override */
    style?: ViewStyle;
    /** Make the card pressable */
    pressable?: boolean;
}

export function Card({
    children,
    variant = 'elevated',
    padding = 'md',
    radius = 'lg',
    style,
    pressable = false,
    onPress,
    ...props
}: CardProps) {
    const { theme } = useTheme();
    const { colors, radius: themeRadius, spacing, shadows } = theme;

    const getPadding = () => {
        switch (padding) {
            case 'none':
                return 0;
            case 'sm':
                return spacing.sm;
            case 'lg':
                return spacing.lg;
            default:
                return spacing.md;
        }
    };

    const getVariantStyles = (): ViewStyle => {
        switch (variant) {
            case 'outlined':
                return {
                    backgroundColor: colors.card,
                    borderWidth: 1,
                    borderColor: colors.border,
                };
            case 'filled':
                return {
                    backgroundColor: colors.muted,
                };
            default:
                return {
                    backgroundColor: colors.card,
                    ...shadows.md,
                };
        }
    };

    const cardStyles: ViewStyle = {
        padding: getPadding(),
        borderRadius: themeRadius[radius],
        ...getVariantStyles(),
    };

    if (pressable || onPress) {
        return (
            <Pressable
                {...props}
                onPress={onPress}
                style={({ pressed }) => [
                    styles.base,
                    cardStyles,
                    pressed && styles.pressed,
                    style,
                ]}
            >
                {children}
            </Pressable>
        );
    }

    return <View style={[styles.base, cardStyles, style]}>{children}</View>;
}

// Card Header component
export interface CardHeaderProps {
    children: React.ReactNode;
    style?: ViewStyle;
}

export function CardHeader({ children, style }: CardHeaderProps) {
    return <View style={[styles.header, style]}>{children}</View>;
}

// Card Content component
export interface CardContentProps {
    children: React.ReactNode;
    style?: ViewStyle;
}

export function CardContent({ children, style }: CardContentProps) {
    return <View style={[styles.content, style]}>{children}</View>;
}

// Card Footer component
export interface CardFooterProps {
    children: React.ReactNode;
    style?: ViewStyle;
}

export function CardFooter({ children, style }: CardFooterProps) {
    return <View style={[styles.footer, style]}>{children}</View>;
}

const styles = StyleSheet.create({
    base: {
        overflow: 'hidden',
    },
    pressed: {
        opacity: 0.9,
        transform: [{ scale: 0.99 }],
    },
    header: {
        marginBottom: 12,
    },
    content: {
        // Default content styles
    },
    footer: {
        marginTop: 12,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 8,
    },
});
