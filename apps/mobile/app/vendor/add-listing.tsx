import { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    ActivityIndicator,
    Alert,
    Image,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '@/theme';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/services/supabase';

const CATEGORIES = [
    { id: 'hostel', label: 'Hostel', icon: 'bed-outline' },
    { id: 'pg', label: 'PG', icon: 'home-outline' },
    { id: 'mess', label: 'Mess', icon: 'restaurant-outline' },
    { id: 'tiffin', label: 'Tiffin', icon: 'fast-food-outline' },
    { id: 'library', label: 'Library', icon: 'library-outline' },
    { id: 'gym', label: 'Gym', icon: 'barbell-outline' },
    { id: 'laundry', label: 'Laundry', icon: 'shirt-outline' },
    { id: 'other', label: 'Other', icon: 'ellipsis-horizontal-outline' },
];

export default function AddListingScreen() {
    const { theme } = useTheme();
    const { user } = useAuth();
    const router = useRouter();
    const queryClient = useQueryClient();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('');
    const [location, setLocation] = useState('');
    const [phone, setPhone] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const createMutation = useMutation({
        mutationFn: async () => {
            if (!user) throw new Error('Not authenticated');
            if (!name || !description || !price || !category) {
                throw new Error('Please fill in all required fields');
            }

            let imageUrl = null;

            // Upload image if selected
            if (imageUri) {
                setIsUploading(true);
                const fileName = `${user.id}/${Date.now()}.jpg`;
                const response = await fetch(imageUri);
                const blob = await response.blob();

                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('product-images')
                    .upload(fileName, blob, { contentType: 'image/jpeg' });

                if (uploadError) {
                    console.error('Upload error:', uploadError);
                } else {
                    const { data: urlData } = supabase.storage
                        .from('product-images')
                        .getPublicUrl(fileName);
                    imageUrl = urlData.publicUrl;
                }
                setIsUploading(false);
            }

            // Create product
            const { error } = await supabase.from('products').insert({
                name,
                description,
                price: parseFloat(price),
                category,
                location,
                phone_number: phone || null,
                whatsapp_number: whatsapp || null,
                image_url: imageUrl,
                seller_id: user.id,
                status: 'active',
            });

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vendor-products'] });
            Alert.alert('Success', 'Listing created successfully!', [
                { text: 'OK', onPress: () => router.back() },
            ]);
        },
        onError: (error) => {
            Alert.alert('Error', error.message);
        },
    });

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
        }
    };

    const isSubmitting = createMutation.isPending || isUploading;

    return (
        <>
            <Stack.Screen options={{ headerTitle: 'Add Listing' }} />
            <ScrollView
                style={[styles.container, { backgroundColor: theme.colors.background }]}
                keyboardShouldPersistTaps="handled"
            >
                {/* Image Upload */}
                <TouchableOpacity
                    style={[styles.imageUpload, { backgroundColor: theme.colors.muted, borderColor: theme.colors.border }]}
                    onPress={pickImage}
                >
                    {imageUri ? (
                        <Image source={{ uri: imageUri }} style={styles.previewImage} />
                    ) : (
                        <>
                            <Ionicons name="camera-outline" size={32} color={theme.colors.mutedForeground} />
                            <Text style={[styles.uploadText, { color: theme.colors.mutedForeground }]}>
                                Add Photo
                            </Text>
                        </>
                    )}
                </TouchableOpacity>

                {/* Form */}
                <View style={styles.form}>
                    {/* Name */}
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: theme.colors.foreground }]}>Name *</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: theme.colors.muted, borderColor: theme.colors.border, color: theme.colors.foreground }]}
                            placeholder="Enter listing name"
                            placeholderTextColor={theme.colors.mutedForeground}
                            value={name}
                            onChangeText={setName}
                        />
                    </View>

                    {/* Category */}
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: theme.colors.foreground }]}>Category *</Text>
                        <View style={styles.categoryGrid}>
                            {CATEGORIES.map((cat) => (
                                <TouchableOpacity
                                    key={cat.id}
                                    style={[
                                        styles.categoryButton,
                                        {
                                            backgroundColor: category === cat.id ? theme.colors.primary[600] : theme.colors.muted,
                                            borderColor: theme.colors.border,
                                        },
                                    ]}
                                    onPress={() => setCategory(cat.id)}
                                >
                                    <Ionicons
                                        name={cat.icon as any}
                                        size={18}
                                        color={category === cat.id ? '#ffffff' : theme.colors.foreground}
                                    />
                                    <Text
                                        style={[
                                            styles.categoryText,
                                            { color: category === cat.id ? '#ffffff' : theme.colors.foreground },
                                        ]}
                                    >
                                        {cat.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Description */}
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: theme.colors.foreground }]}>Description *</Text>
                        <TextInput
                            style={[styles.textArea, { backgroundColor: theme.colors.muted, borderColor: theme.colors.border, color: theme.colors.foreground }]}
                            placeholder="Describe your listing..."
                            placeholderTextColor={theme.colors.mutedForeground}
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                        />
                    </View>

                    {/* Price */}
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: theme.colors.foreground }]}>Price (₹) *</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: theme.colors.muted, borderColor: theme.colors.border, color: theme.colors.foreground }]}
                            placeholder="0"
                            placeholderTextColor={theme.colors.mutedForeground}
                            value={price}
                            onChangeText={setPrice}
                            keyboardType="numeric"
                        />
                    </View>

                    {/* Location */}
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: theme.colors.foreground }]}>Location</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: theme.colors.muted, borderColor: theme.colors.border, color: theme.colors.foreground }]}
                            placeholder="Enter location"
                            placeholderTextColor={theme.colors.mutedForeground}
                            value={location}
                            onChangeText={setLocation}
                        />
                    </View>

                    {/* Contact */}
                    <View style={styles.row}>
                        <View style={[styles.inputGroup, { flex: 1 }]}>
                            <Text style={[styles.label, { color: theme.colors.foreground }]}>Phone</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: theme.colors.muted, borderColor: theme.colors.border, color: theme.colors.foreground }]}
                                placeholder="Phone number"
                                placeholderTextColor={theme.colors.mutedForeground}
                                value={phone}
                                onChangeText={setPhone}
                                keyboardType="phone-pad"
                            />
                        </View>
                        <View style={[styles.inputGroup, { flex: 1 }]}>
                            <Text style={[styles.label, { color: theme.colors.foreground }]}>WhatsApp</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: theme.colors.muted, borderColor: theme.colors.border, color: theme.colors.foreground }]}
                                placeholder="WhatsApp number"
                                placeholderTextColor={theme.colors.mutedForeground}
                                value={whatsapp}
                                onChangeText={setWhatsapp}
                                keyboardType="phone-pad"
                            />
                        </View>
                    </View>

                    {/* Submit */}
                    <TouchableOpacity
                        style={[
                            styles.submitButton,
                            { backgroundColor: theme.colors.primary[600] },
                            isSubmitting && styles.submitButtonDisabled,
                        ]}
                        onPress={() => createMutation.mutate()}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator color="#ffffff" />
                        ) : (
                            <Text style={styles.submitButtonText}>Create Listing</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    imageUpload: {
        height: 200,
        margin: 16,
        borderRadius: 12,
        borderWidth: 2,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    previewImage: {
        width: '100%',
        height: '100%',
    },
    uploadText: {
        marginTop: 8,
        fontSize: 14,
    },
    form: {
        padding: 16,
        paddingTop: 0,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 8,
    },
    input: {
        height: 48,
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 16,
        fontSize: 16,
    },
    textArea: {
        height: 100,
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
    },
    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    categoryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        gap: 6,
    },
    categoryText: {
        fontSize: 13,
        fontWeight: '500',
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    submitButton: {
        height: 52,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 16,
        marginBottom: 32,
    },
    submitButtonDisabled: {
        opacity: 0.7,
    },
    submitButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
});
