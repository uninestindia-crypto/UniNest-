import { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';
import { useAuth } from '@/hooks/useAuth';
import { Button, Input, Avatar, Card } from '@/components/ui';
import { supabase } from '@/services/supabase';

// Validation schema
const profileSchema = z.object({
    full_name: z
        .string()
        .min(2, 'Name must be at least 2 characters')
        .max(50, 'Name must be less than 50 characters'),
    handle: z
        .string()
        .min(3, 'Username must be at least 3 characters')
        .max(20, 'Username must be less than 20 characters')
        .regex(/^[a-z0-9_]+$/, 'Username can only contain lowercase letters, numbers, and underscores')
        .optional()
        .or(z.literal('')),
    bio: z
        .string()
        .max(200, 'Bio must be less than 200 characters')
        .optional()
        .or(z.literal('')),
    phone: z
        .string()
        .regex(/^[+]?[\d\s-]{10,15}$/, 'Please enter a valid phone number')
        .optional()
        .or(z.literal('')),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function EditProfileScreen() {
    const { theme } = useTheme();
    const router = useRouter();
    const { profile, user, refreshProfile } = useAuth();

    const [avatarUri, setAvatarUri] = useState<string | null>(profile?.avatar_url || null);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const {
        control,
        handleSubmit,
        formState: { errors, isDirty },
    } = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            full_name: profile?.full_name || '',
            handle: profile?.handle || '',
            bio: profile?.bio || '',
            phone: profile?.phone || '',
        },
    });

    const pickImage = useCallback(async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(
                'Permission Required',
                'Please allow access to your photos to change your profile picture.'
            );
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            await uploadAvatar(result.assets[0].uri);
        }
    }, []);

    const takePhoto = useCallback(async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(
                'Permission Required',
                'Please allow access to your camera to take a profile picture.'
            );
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            await uploadAvatar(result.assets[0].uri);
        }
    }, []);

    const showImageOptions = useCallback(() => {
        Alert.alert(
            'Change Profile Photo',
            'Choose an option',
            [
                { text: 'Take Photo', onPress: takePhoto },
                { text: 'Choose from Library', onPress: pickImage },
                { text: 'Cancel', style: 'cancel' },
            ]
        );
    }, [pickImage, takePhoto]);

    const uploadAvatar = async (uri: string) => {
        if (!user) return;

        setIsUploadingAvatar(true);
        try {
            // Generate unique filename
            const filename = `${user.id}-${Date.now()}.jpg`;
            const path = `avatars/${filename}`;

            // Read the file and upload
            const response = await fetch(uri);
            const blob = await response.blob();

            // Convert blob to array buffer for Supabase
            const arrayBuffer = await new Response(blob).arrayBuffer();

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(path, arrayBuffer, {
                    contentType: 'image/jpeg',
                    upsert: true,
                });

            if (uploadError) throw uploadError;

            // Get public URL
            const { data: urlData } = supabase.storage
                .from('avatars')
                .getPublicUrl(path);

            const avatarUrl = urlData.publicUrl;

            // Update profile with new avatar URL
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ avatar_url: avatarUrl })
                .eq('id', user.id);

            if (updateError) throw updateError;

            setAvatarUri(avatarUrl);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        } catch (error) {
            console.error('Avatar upload error:', error);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert('Upload Failed', 'Could not upload your profile picture. Please try again.');
        } finally {
            setIsUploadingAvatar(false);
        }
    };

    const onSubmit = async (data: ProfileFormData) => {
        if (!user) return;

        setIsSaving(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: data.full_name,
                    handle: data.handle || null,
                    bio: data.bio || null,
                    phone: data.phone || null,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', user.id);

            if (error) throw error;

            await refreshProfile();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert('Success', 'Your profile has been updated.');
            router.back();

        } catch (error: any) {
            console.error('Profile update error:', error);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

            if (error.message?.includes('handle')) {
                Alert.alert('Username Taken', 'This username is already in use. Please choose another.');
            } else {
                Alert.alert('Error', 'Failed to update your profile. Please try again.');
            }
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.keyboardView}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView
                style={[styles.container, { backgroundColor: theme.colors.background }]}
                contentContainerStyle={styles.content}
                keyboardShouldPersistTaps="handled"
            >
                {/* Avatar Section */}
                <Card variant="filled" padding="lg" style={styles.avatarCard}>
                    <View style={styles.avatarSection}>
                        <TouchableOpacity
                            onPress={showImageOptions}
                            disabled={isUploadingAvatar}
                            style={styles.avatarTouchable}
                            accessibilityLabel="Change profile photo"
                            accessibilityRole="button"
                        >
                            <Avatar
                                source={avatarUri}
                                fallback={profile?.full_name}
                                size="2xl"
                            />
                            <View
                                style={[
                                    styles.avatarOverlay,
                                    { backgroundColor: theme.colors.primary[500] }
                                ]}
                            >
                                <Ionicons
                                    name={isUploadingAvatar ? 'hourglass-outline' : 'camera'}
                                    size={16}
                                    color="#fff"
                                />
                            </View>
                        </TouchableOpacity>
                        <Text style={[styles.avatarHint, { color: theme.colors.mutedForeground }]}>
                            Tap to change photo
                        </Text>
                    </View>
                </Card>

                {/* Form Section */}
                <Card variant="outlined" padding="lg" style={styles.formCard}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.foreground }]}>
                        Personal Information
                    </Text>

                    <Controller
                        control={control}
                        name="full_name"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <Input
                                label="Full Name"
                                leftIcon="person-outline"
                                placeholder="Enter your full name"
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                error={errors.full_name?.message}
                                autoCapitalize="words"
                            />
                        )}
                    />

                    <Controller
                        control={control}
                        name="handle"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <Input
                                label="Username"
                                leftIcon="at-outline"
                                placeholder="your_username"
                                value={value}
                                onChangeText={(text) => onChange(text.toLowerCase())}
                                onBlur={onBlur}
                                error={errors.handle?.message}
                                helperText="Used for your public profile URL"
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                        )}
                    />

                    <Controller
                        control={control}
                        name="bio"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <Input
                                label="Bio"
                                leftIcon="document-text-outline"
                                placeholder="Tell us about yourself..."
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                error={errors.bio?.message}
                                helperText={`${value?.length || 0}/200 characters`}
                                multiline
                                numberOfLines={3}
                                style={{ height: 80, textAlignVertical: 'top' }}
                            />
                        )}
                    />

                    <Controller
                        control={control}
                        name="phone"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <Input
                                label="Phone Number"
                                leftIcon="call-outline"
                                placeholder="+91 98765 43210"
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                error={errors.phone?.message}
                                helperText="Optional - for order notifications"
                                keyboardType="phone-pad"
                            />
                        )}
                    />
                </Card>

                {/* Email (Read-only) */}
                <Card variant="filled" padding="lg" style={styles.formCard}>
                    <View style={styles.readOnlyField}>
                        <Ionicons
                            name="mail-outline"
                            size={20}
                            color={theme.colors.mutedForeground}
                        />
                        <View style={styles.readOnlyContent}>
                            <Text style={[styles.readOnlyLabel, { color: theme.colors.mutedForeground }]}>
                                Email Address
                            </Text>
                            <Text style={[styles.readOnlyValue, { color: theme.colors.foreground }]}>
                                {user?.email}
                            </Text>
                        </View>
                        <Ionicons
                            name="lock-closed-outline"
                            size={16}
                            color={theme.colors.mutedForeground}
                        />
                    </View>
                    <Text style={[styles.emailHint, { color: theme.colors.mutedForeground }]}>
                        Contact support to change your email address
                    </Text>
                </Card>

                {/* Action Buttons */}
                <View style={styles.actions}>
                    <Button
                        variant="primary"
                        size="lg"
                        fullWidth
                        onPress={handleSubmit(onSubmit)}
                        loading={isSaving}
                        disabled={!isDirty && !isUploadingAvatar}
                    >
                        Save Changes
                    </Button>

                    <Button
                        variant="ghost"
                        size="lg"
                        fullWidth
                        onPress={() => router.back()}
                        disabled={isSaving}
                    >
                        Cancel
                    </Button>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    keyboardView: {
        flex: 1,
    },
    container: {
        flex: 1,
    },
    content: {
        padding: 16,
        paddingBottom: 40,
    },
    avatarCard: {
        marginBottom: 16,
    },
    avatarSection: {
        alignItems: 'center',
    },
    avatarTouchable: {
        position: 'relative',
    },
    avatarOverlay: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#fff',
    },
    avatarHint: {
        marginTop: 8,
        fontSize: 14,
    },
    formCard: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
    },
    readOnlyField: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    readOnlyContent: {
        flex: 1,
    },
    readOnlyLabel: {
        fontSize: 12,
        marginBottom: 2,
    },
    readOnlyValue: {
        fontSize: 16,
    },
    emailHint: {
        marginTop: 8,
        fontSize: 12,
    },
    actions: {
        gap: 12,
        marginTop: 8,
    },
});
