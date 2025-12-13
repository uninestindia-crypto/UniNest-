import React, { forwardRef, useState } from 'react';
import {
    TextInput,
    View,
    Text,
    StyleSheet,
    TextInputProps,
    ViewStyle,
    Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';

export interface InputProps extends TextInputProps {
    /** Label text above the input */
    label?: string;
    /** Error message to display */
    error?: string;
    /** Helper text below the input */
    helperText?: string;
    /** Left icon name from Ionicons */
    leftIcon?: keyof typeof Ionicons.glyphMap;
    /** Right icon name from Ionicons */
    rightIcon?: keyof typeof Ionicons.glyphMap;
    /** Callback when right icon is pressed */
    onRightIconPress?: () => void;
    /** Container style override */
    containerStyle?: ViewStyle;
    /** Full width input */
    fullWidth?: boolean;
    /** Disable the input */
    disabled?: boolean;
}

export const Input = forwardRef<TextInput, InputProps>(
    (
        {
            label,
            error,
            helperText,
            leftIcon,
            rightIcon,
            onRightIconPress,
            containerStyle,
            fullWidth = true,
            disabled = false,
            secureTextEntry,
            ...props
        },
        ref
    ) => {
        const { theme } = useTheme();
        const { colors, radius, spacing } = theme;
        const [isFocused, setIsFocused] = useState(false);
        const [isSecureVisible, setIsSecureVisible] = useState(!secureTextEntry);

        const handleFocus = (e: any) => {
            setIsFocused(true);
            props.onFocus?.(e);
        };

        const handleBlur = (e: any) => {
            setIsFocused(false);
            props.onBlur?.(e);
        };

        const toggleSecureVisibility = () => {
            setIsSecureVisible(!isSecureVisible);
        };

        const getBorderColor = () => {
            if (error) return colors.destructive;
            if (isFocused) return colors.primary[500];
            return colors.border;
        };

        const showPasswordToggle = secureTextEntry !== undefined;

        return (
            <View style={[styles.container, fullWidth && styles.fullWidth, containerStyle]}>
                {label && (
                    <Text
                        style={[
                            styles.label,
                            { color: error ? colors.destructive : colors.foreground },
                        ]}
                    >
                        {label}
                    </Text>
                )}
                <View
                    style={[
                        styles.inputContainer,
                        {
                            backgroundColor: disabled ? colors.muted : colors.card,
                            borderColor: getBorderColor(),
                            borderRadius: radius.md,
                        },
                    ]}
                >
                    {leftIcon && (
                        <Ionicons
                            name={leftIcon}
                            size={20}
                            color={colors.mutedForeground}
                            style={styles.leftIcon}
                        />
                    )}
                    <TextInput
                        ref={ref}
                        {...props}
                        editable={!disabled}
                        secureTextEntry={secureTextEntry && !isSecureVisible}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        placeholderTextColor={colors.mutedForeground}
                        style={[
                            styles.input,
                            {
                                color: colors.foreground,
                                paddingLeft: leftIcon ? 0 : spacing.md,
                                paddingRight: rightIcon || showPasswordToggle ? 0 : spacing.md,
                            },
                            props.style,
                        ]}
                        accessibilityLabel={label}
                        accessibilityState={{ disabled }}
                    />
                    {showPasswordToggle && (
                        <Pressable
                            onPress={toggleSecureVisibility}
                            style={styles.rightIcon}
                            accessibilityLabel={isSecureVisible ? 'Hide password' : 'Show password'}
                        >
                            <Ionicons
                                name={isSecureVisible ? 'eye-off-outline' : 'eye-outline'}
                                size={20}
                                color={colors.mutedForeground}
                            />
                        </Pressable>
                    )}
                    {rightIcon && !showPasswordToggle && (
                        <Pressable
                            onPress={onRightIconPress}
                            style={styles.rightIcon}
                            disabled={!onRightIconPress}
                        >
                            <Ionicons name={rightIcon} size={20} color={colors.mutedForeground} />
                        </Pressable>
                    )}
                </View>
                {(error || helperText) && (
                    <Text
                        style={[
                            styles.helperText,
                            { color: error ? colors.destructive : colors.mutedForeground },
                        ]}
                    >
                        {error || helperText}
                    </Text>
                )}
            </View>
        );
    }
);

Input.displayName = 'Input';

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    fullWidth: {
        width: '100%',
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 6,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        minHeight: 48,
    },
    input: {
        flex: 1,
        fontSize: 16,
        paddingVertical: 12,
    },
    leftIcon: {
        marginLeft: 12,
        marginRight: 8,
    },
    rightIcon: {
        padding: 12,
    },
    helperText: {
        fontSize: 12,
        marginTop: 4,
    },
});
