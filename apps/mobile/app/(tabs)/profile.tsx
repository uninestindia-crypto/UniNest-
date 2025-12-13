import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ScrollView,
    Alert,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';
import { useAuth } from '@/hooks/useAuth';

type MenuItemProps = {
    icon: string;
    label: string;
    onPress: () => void;
    showChevron?: boolean;
    destructive?: boolean;
};

function MenuItem({ icon, label, onPress, showChevron = true, destructive = false }: MenuItemProps) {
    const { theme } = useTheme();

    return (
        <TouchableOpacity style={styles.menuItem} onPress={onPress}>
            <Ionicons
                name={icon as any}
                size={22}
                color={destructive ? theme.colors.destructive : theme.colors.foreground}
            />
            <Text
                style={[
                    styles.menuLabel,
                    { color: destructive ? theme.colors.destructive : theme.colors.foreground },
                ]}
            >
                {label}
            </Text>
            {showChevron && (
                <Ionicons name="chevron-forward" size={20} color={theme.colors.mutedForeground} />
            )}
        </TouchableOpacity>
    );
}

export default function ProfileScreen() {
    const { theme } = useTheme();
    const router = useRouter();
    const { user, profile, role, signOut } = useAuth();

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
                        await signOut();
                    },
                },
            ]
        );
    };

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: theme.colors.background }]}
            contentContainerStyle={styles.content}
        >
            {/* Profile Header */}
            <View style={[styles.header, { backgroundColor: theme.colors.card }]}>
                <Image
                    source={{
                        uri: profile?.avatar_url || `https://ui-avatars.com/api/?name=${profile?.full_name || 'User'}`,
                    }}
                    style={styles.avatar}
                />
                <View style={styles.profileInfo}>
                    <Text style={[styles.name, { color: theme.colors.foreground }]}>
                        {profile?.full_name || 'User'}
                    </Text>
                    {profile?.handle && (
                        <Text style={[styles.handle, { color: theme.colors.mutedForeground }]}>
                            @{profile.handle}
                        </Text>
                    )}
                    <View style={[styles.roleBadge, { backgroundColor: theme.colors.primary[100] }]}>
                        <Text style={[styles.roleText, { color: theme.colors.primary[700] }]}>
                            {role.charAt(0).toUpperCase() + role.slice(1)}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Menu Sections */}
            <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
                <Text style={[styles.sectionTitle, { color: theme.colors.mutedForeground }]}>
                    Account
                </Text>
                <MenuItem
                    icon="person-outline"
                    label="Edit Profile"
                    onPress={() => router.push('/profile/edit')}
                />
                <MenuItem
                    icon="notifications-outline"
                    label="Notifications"
                    onPress={() => router.push('/notifications')}
                />
                <MenuItem
                    icon="settings-outline"
                    label="Settings"
                    onPress={() => router.push('/settings')}
                />
            </View>

            {role === 'vendor' && (
                <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.mutedForeground }]}>
                        Vendor
                    </Text>
                    <MenuItem
                        icon="storefront-outline"
                        label="Dashboard"
                        onPress={() => router.push('/vendor/dashboard')}
                    />
                    <MenuItem
                        icon="list-outline"
                        label="My Listings"
                        onPress={() => router.push('/vendor/listings')}
                    />
                    <MenuItem
                        icon="add-circle-outline"
                        label="Add Listing"
                        onPress={() => router.push('/vendor/add-listing')}
                    />
                </View>
            )}

            <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
                <Text style={[styles.sectionTitle, { color: theme.colors.mutedForeground }]}>
                    Support
                </Text>
                <MenuItem
                    icon="help-circle-outline"
                    label="Help & Support"
                    onPress={() => router.push('/support')}
                />
                <MenuItem
                    icon="document-text-outline"
                    label="Terms of Service"
                    onPress={() => router.push('/terms')}
                />
                <MenuItem
                    icon="information-circle-outline"
                    label="About"
                    onPress={() => router.push('/about')}
                />
            </View>

            <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
                <MenuItem
                    icon="log-out-outline"
                    label="Sign Out"
                    onPress={handleSignOut}
                    showChevron={false}
                    destructive
                />
            </View>

            {/* App Version */}
            <Text style={[styles.version, { color: theme.colors.mutedForeground }]}>
                Uninest v1.0.0
            </Text>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        paddingBottom: 32,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        marginBottom: 16,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
    },
    profileInfo: {
        flex: 1,
        marginLeft: 16,
    },
    name: {
        fontSize: 20,
        fontWeight: '700',
    },
    handle: {
        fontSize: 14,
        marginTop: 2,
    },
    roleBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginTop: 8,
    },
    roleText: {
        fontSize: 12,
        fontWeight: '600',
    },
    section: {
        marginBottom: 16,
        paddingVertical: 8,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    menuLabel: {
        flex: 1,
        fontSize: 16,
        marginLeft: 12,
    },
    version: {
        textAlign: 'center',
        fontSize: 12,
        marginTop: 16,
    },
});
