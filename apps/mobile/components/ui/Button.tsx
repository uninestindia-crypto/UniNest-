import React from 'react';
import {
    Pressable,
    Text,
    StyleSheet,
    ActivityIndicator,
    ViewStyle,
    TextStyle,
    PressableProps,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/theme';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<PressableProps, 'style'> {
    /** Button visual variant */
    variant?: ButtonVariant;
    /** Button size */
    size?: ButtonSize;
    /** Show loading spinner */
    loading?: boolean;
    /** Disable the button */
    disabled?: boolean;
    /** Full width button */
    fullWidth?: boolean;
    /** Button content */
    children: React.ReactNode;
    /** Optional left icon */
    leftIcon?: React.ReactNode;
    /** Optional right icon */
    rightIcon?: React.ReactNode;
    /** Custom style override */
    style?: ViewStyle;
}

export function Button({
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    fullWidth = false,
    children,
    leftIcon,
    rightIcon,
    style,
    onPress,
    ...props
}: ButtonProps) {
    const { theme } = useTheme();
    const { colors, radius } = theme;

    const handlePress = (e: any) => {
        if (disabled || loading) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress?.(e);
    };

    const getBackgroundColor = (pressed: boolean): string => {
        if (disabled) return colors.muted;

        switch (variant) {
            case 'primary':
                return pressed ? colors.primary[600] : colors.primary[500];
            case 'secondary':
                return pressed ? colors.muted : colors.muted;
            case 'outline':
            case 'ghost':
                return pressed ? colors.muted : 'transparent';
            case 'destructive':
                return pressed ? '#dc2626' : colors.destructive;
            default:
                return colors.primary[500];
        }
    };

    const getBorderColor = (): string => {
        if (disabled) return colors.border;

        switch (variant) {
            case 'outline':
                return colors.border;
            case 'destructive':
                return colors.destructive;
            default:
                return 'transparent';
        }
    };

    const getTextColor = (): string => {
        if (disabled) return colors.mutedForeground;

        switch (variant) {
            case 'primary':
                return '#ffffff';
            case 'secondary':
                return colors.foreground;
            case 'outline':
            case 'ghost':
                return colors.foreground;
            case 'destructive':
                return colors.destructiveForeground;
            default:
                return '#ffffff';
        }
    };

    const getPadding = (): { paddingVertical: number; paddingHorizontal: number } => {
        switch (size) {
            case 'sm':
                return { paddingVertical: 8, paddingHorizontal: 12 };
            case 'lg':
                return { paddingVertical: 16, paddingHorizontal: 24 };
            default:
                return { paddingVertical: 12, paddingHorizontal: 16 };
        }
    };

    const getFontSize = (): number => {
        switch (size) {
            case 'sm':
                return 14;
            case 'lg':
                return 18;
            default:
                return 16;
        }
    };

    const padding = getPadding();
    const textColor = getTextColor();
    const borderColor = getBorderColor();

    return (
        <Pressable
            {...props}
            onPress={handlePress}
            disabled={disabled || loading}
            style={({ pressed }) => [
                styles.base,
                {
                    backgroundColor: getBackgroundColor(pressed),
                    borderColor,
                    borderWidth: variant === 'outline' ? 1 : 0,
                    borderRadius: radius.md,
                    ...padding,
                },
                fullWidth && styles.fullWidth,
                disabled && styles.disabled,
                style,
            ]}
            accessibilityRole="button"
            accessibilityState={{ disabled: disabled || loading }}
        >
            {loading ? (
                <ActivityIndicator
                    testID="button-loading"
                    size="small"
                    color={variant === 'primary' || variant === 'destructive' ? '#fff' : colors.primary[500]}
                />
            ) : (
                <>
                    {leftIcon}
                    <Text
                        style={[
                            styles.text,
                            {
                                color: textColor,
                                fontSize: getFontSize(),
                                marginLeft: leftIcon ? 8 : 0,
                                marginRight: rightIcon ? 8 : 0,
                            },
                        ]}
                    >
                        {children}
                    </Text>
                    {rightIcon}
                </>
            )}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    base: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    fullWidth: {
        width: '100%',
    },
    disabled: {
        opacity: 0.6,
    },
    text: {
        fontWeight: '600',
        textAlign: 'center',
    },
});
