import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Switch,
    ScrollView,
    TouchableOpacity,
    Alert,
    Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import Constants from 'expo-constants';
import { useTheme } from '@/theme';
import { useAuth } from '@/hooks/useAuth';

type SettingItemProps = {
    icon: string;
    label: string;
    subLabel?: string;
    onPress?: () => void;
    value?: boolean; // For toggle
    type?: 'link' | 'toggle' | 'text';
    destructive?: boolean;
};

function SettingItem({
    icon,
    label,
    subLabel,
    onPress,
    value,
    type = 'link',
    destructive = false,
}: SettingItemProps) {
    const { theme } = useTheme();

    return (
        <TouchableOpacity
            style={[styles.itemContainer, { backgroundColor: theme.colors.card }]}
            onPress={type === 'toggle' ? onPress : onPress}
            disabled={type === 'toggle' && !onPress}
            activeOpacity={type === 'toggle' ? 1 : 0.7}
        >
            <View style={styles.itemLeft}>
                <View
                    style={[
                        styles.iconContainer,
                        {
                            backgroundColor: destructive
                                ? theme.colors.destructive + '20'
                                : theme.colors.muted,
                        },
                    ]}
                >
                    <Ionicons
                        name={icon as any}
                        size={20}
                        color={destructive ? theme.colors.destructive : theme.colors.foreground}
                    />
                </View>
                <View style={styles.textContainer}>
                    <Text
                        style={[
                            styles.label,
                            {
                                color: destructive
                                    ? theme.colors.destructive
                                    : theme.colors.foreground,
                            },
                        ]}
                    >
                        {label}
                    </Text>
                    {subLabel && (
                        <Text style={[styles.subLabel, { color: theme.colors.mutedForeground }]}>
                            {subLabel}
                        </Text>
                    )}
                </View>
            </View>

            {type === 'link' && (
                <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={theme.colors.mutedForeground}
                />
            )}

            {type === 'toggle' && (
                <Switch
                    value={value}
                    onValueChange={onPress as any}
                    trackColor={{
                        false: theme.colors.muted,
                        true: theme.colors.primary[500],
                    }}
                    thumbColor={Platform.OS === 'ios' ? '#fff' : '#f4f3f4'}
                />
            )}

            {type === 'text' && <View />}
        </TouchableOpacity>
    );
}

function SectionLabel({ title }: { title: string }) {
    const { theme } = useTheme();
    return (
        <Text style={[styles.sectionTitle, { color: theme.colors.mutedForeground }]}>
            {title}
        </Text>
    );
}

export default function SettingsScreen() {
    const { theme, toggleTheme, theme: currentTheme } = useTheme();
    const router = useRouter();
    const { signOut, user } = useAuth();

    // Mock state for notifications (in real app, this would check permissions)
    const [pushEnabled, setPushEnabled] = useState(true);
    const [emailEnabled, setEmailEnabled] = useState(true);

    const handleSignOut = () => {
        Alert.alert(
            'Sign Out',
            'Are you sure you want to sign out?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Sign Out',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await signOut();
                            router.replace('/(auth)/login');
                        } catch (error) {
                            Alert.alert('Error', 'Failed to sign out');
                        }
                    },
                },
            ]
        );
    };

    const handleOpenSettings = () => {
        // Open device settings
        Linking.openSettings();
    };

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: theme.colors.background }]}
            contentContainerStyle={styles.content}
        >
            <SectionLabel title="Preferences" />

            <SettingItem
                icon="moon-outline"
                label="Dark Mode"
                type="toggle"
                value={currentTheme.isDark}
                onPress={toggleTheme}
            />

            <SettingItem
                icon="notifications-outline"
                label="Push Notifications"
                type="toggle"
                value={pushEnabled}
                onPress={() => setPushEnabled(!pushEnabled)}
            />

            <SettingItem
                icon="mail-outline"
                label="Email Updates"
                type="toggle"
                value={emailEnabled}
                onPress={() => setEmailEnabled(!emailEnabled)}
            />

            <SectionLabel title="Account" />

            <SettingItem
                icon="person-outline"
                label="Edit Profile"
                onPress={() => router.push('/profile')}
            />

            <SettingItem
                icon="lock-closed-outline"
                label="Change Password"
                onPress={() => router.push('/(auth)/password-reset')}
            />

            <SettingItem
                icon="shield-checkmark-outline"
                label="Privacy & Security"
                onPress={handleOpenSettings}
                subLabel="Manage device permissions"
            />

            <SectionLabel title="About" />

            <SettingItem
                icon="document-text-outline"
                label="Terms of Service"
                onPress={() => router.push('/terms')}
            />

            <SettingItem
                icon="information-circle-outline"
                label="Privacy Policy"
                onPress={() => Linking.openURL('https://uninest.app/privacy')}
            />

            <SettingItem
                icon="code-slash-outline"
                label="App Version"
                type="text"
                subLabel={`${Constants.expoConfig?.version || '1.0.0'} (${Platform.OS})`}
            />

            <View style={styles.destructveSection}>
                <SettingItem
                    icon="log-out-outline"
                    label="Sign Out"
                    onPress={handleSignOut}
                    destructive
                    type="link"
                />
            </View>

            <Text style={[styles.copyright, { color: theme.colors.mutedForeground }]}>
                © 2024 Uninest. All rights reserved.
            </Text>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        paddingVertical: 16,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '600',
        textTransform: 'uppercase',
        marginLeft: 16,
        marginBottom: 8,
        marginTop: 24,
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(0,0,0,0.05)',
        justifyContent: 'space-between',
    },
    itemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    textContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    label: {
        fontSize: 16,
        fontWeight: '500',
    },
    subLabel: {
        fontSize: 12,
        marginTop: 2,
    },
    destructveSection: {
        marginTop: 32,
        marginBottom: 16,
    },
    copyright: {
        textAlign: 'center',
        fontSize: 12,
        marginBottom: 32,
    }
});
