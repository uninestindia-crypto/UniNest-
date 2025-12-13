import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';

export default function CreateListingScreen() {
    const { theme } = useTheme();
    const router = useRouter();

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.content}>
                <Text style={[styles.title, { color: theme.colors.foreground }]}>
                    Create New Listing
                </Text>
                <Text style={[styles.text, { color: theme.colors.mutedForeground }]}>
                    This feature is coming soon. Use the "Add Listing" page instead.
                </Text>
                <TouchableOpacity
                    style={[styles.button, { backgroundColor: theme.colors.primary[600] }]}
                    onPress={() => router.replace('/vendor/add-listing')}
                >
                    <Text style={styles.buttonText}>Go to Add Listing</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: 20 },
    title: { fontSize: 24, fontWeight: '700', marginBottom: 16 },
    text: { fontSize: 16, lineHeight: 24, marginBottom: 24 },
    button: { height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
