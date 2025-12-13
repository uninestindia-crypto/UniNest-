import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '@/theme';

export default function AboutScreen() {
    const { theme } = useTheme();

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.content}>
                <Text style={[styles.title, { color: theme.colors.foreground }]}>
                    About Uninest
                </Text>
                <Text style={[styles.text, { color: theme.colors.mutedForeground }]}>
                    Uninest is your one-stop platform for student accommodations,
                    services, and opportunities.
                </Text>
                <Text style={[styles.version, { color: theme.colors.mutedForeground }]}>
                    Version 1.0.0
                </Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: 20 },
    title: { fontSize: 24, fontWeight: '700', marginBottom: 16 },
    text: { fontSize: 16, lineHeight: 24, marginBottom: 24 },
    version: { fontSize: 14 },
});
