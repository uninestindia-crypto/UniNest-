import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '@/theme';

export default function TermsScreen() {
    const { theme } = useTheme();

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.content}>
                <Text style={[styles.title, { color: theme.colors.foreground }]}>
                    Terms of Service
                </Text>
                <Text style={[styles.text, { color: theme.colors.mutedForeground }]}>
                    By using Uninest, you agree to our terms and conditions.
                </Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: 20 },
    title: { fontSize: 24, fontWeight: '700', marginBottom: 16 },
    text: { fontSize: 16, lineHeight: 24 },
});
