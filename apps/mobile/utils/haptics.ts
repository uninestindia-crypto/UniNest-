import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

/**
 * Haptic feedback utility for tactile user feedback.
 * Provides consistent haptic feedback across iOS and Android.
 * Falls back silently on devices that don't support haptics.
 */
export const haptics = {
    /**
     * Light tap - for selections, toggles, and subtle interactions
     */
    light: async () => {
        if (Platform.OS === 'ios') {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } else {
            await Haptics.selectionAsync();
        }
    },

    /**
     * Medium tap - for button presses and confirmations
     */
    medium: async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    },

    /**
     * Heavy tap - for important actions and emphasis
     */
    heavy: async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    },

    /**
     * Selection - for picker selections and scrolling feedback
     */
    selection: async () => {
        await Haptics.selectionAsync();
    },

    /**
     * Success - for successful actions (checkmarks, confirmations)
     */
    success: async () => {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },

    /**
     * Warning - for warnings and alerts
     */
    warning: async () => {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    },

    /**
     * Error - for errors and failures
     */
    error: async () => {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    },
};
