import { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';
import { useAuth } from '@/hooks/useAuth';

export default function EditProfileScreen() {
    const { theme } = useTheme();
    const router = useRouter();
    const { profile } = useAuth();

    const [fullName, setFullName] = useState(profile?.full_name || '');
    const [handle, setHandle] = useState(profile?.handle || '');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // TODO: Implement profile update via API
            Alert.alert('Success', 'Profile updated successfully');
            router.back();
        } catch (error) {
            Alert.alert('Error', 'Failed to update profile');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: theme.colors.background }]}
            contentContainerStyle={styles.content}
        >
            {/* Avatar */}
            <View style={styles.avatarSection}>
                <Image
                    source={{
                        uri: profile?.avatar_url || `https://ui-avatars.com/api/?name=${fullName || 'User'}`,
                    }}
                    style={styles.avatar}
                />
                <TouchableOpacity style={[styles.changeAvatarBtn, { backgroundColor: theme.colors.primary[600] }]}>
                    <Ionicons name="camera-outline" size={16} color="#fff" />
                    <Text style={styles.changeAvatarText}>Change Photo</Text>
                </TouchableOpacity>
            </View>

            {/* Form */}
            <View style={styles.form}>
                <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: theme.colors.foreground }]}>Full Name</Text>
                    <TextInput
                        style={[styles.input, {
                            backgroundColor: theme.colors.card,
                            color: theme.colors.foreground,
                            borderColor: theme.colors.border,
                        }]}
                        value={fullName}
                        onChangeText={setFullName}
                        placeholder="Enter your full name"
                        placeholderTextColor={theme.colors.mutedForeground}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: theme.colors.foreground }]}>Username</Text>
                    <TextInput
                        style={[styles.input, {
                            backgroundColor: theme.colors.card,
                            color: theme.colors.foreground,
                            borderColor: theme.colors.border,
                        }]}
                        value={handle}
                        onChangeText={setHandle}
                        placeholder="Enter your username"
                        placeholderTextColor={theme.colors.mutedForeground}
                        autoCapitalize="none"
                    />
                </View>
            </View>

            {/* Save Button */}
            <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: theme.colors.primary[600] }]}
                onPress={handleSave}
                disabled={isSaving}
            >
                {isSaving ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                )}
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: 20 },
    avatarSection: { alignItems: 'center', marginBottom: 32 },
    avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 12 },
    changeAvatarBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 6,
    },
    changeAvatarText: { color: '#fff', fontSize: 14, fontWeight: '500' },
    form: { gap: 20 },
    inputGroup: { gap: 8 },
    label: { fontSize: 14, fontWeight: '600' },
    input: {
        height: 48,
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 16,
        borderWidth: 1,
    },
    saveButton: {
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 32,
    },
    saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
