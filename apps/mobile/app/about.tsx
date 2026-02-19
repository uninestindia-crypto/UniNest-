import React from 'react';
import { ScrollView, View, Text, StyleSheet, Image, TouchableOpacity, Linking } from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';

const STATS = [
    { label: 'Students', value: '10,000+', icon: 'people' },
    { label: 'Vendors', value: '200+', icon: 'storefront' },
    { label: 'Libraries', value: '50+', icon: 'library' },
    { label: 'Partners', value: '15+', icon: 'business' },
];

const VALUES = [
    { title: 'Innovation First', description: 'We constantly build and iterate to solve real student problems.' },
    { title: 'Community Matters', description: 'Our platform is built for, and by, the student community.' },
    { title: 'Education for All', description: 'We believe in breaking down barriers to knowledge and opportunity.' },
    { title: 'Student-Centered', description: 'Every decision is driven by what\'s best for our students.' },
];

export default function AboutScreen() {
    const { theme } = useTheme();

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <Stack.Screen options={{ title: 'About UniNest', headerShown: true }} />

            <View style={styles.hero}>
                <View style={styles.badge}>
                    <Ionicons name="sparkles" size={16} color={theme.colors.primary[600]} />
                    <Text style={[styles.badgeText, { color: theme.colors.primary[600] }]}>Revolutionizing Campus Life</Text>
                </View>
                <Text style={[styles.heroTitle, { color: theme.colors.foreground }]}>
                    10,000+ Students. {'\n'}
                    <Text style={{ color: theme.colors.primary[600] }}>One Unified Campus.</Text>
                </Text>
                <Text style={[styles.heroDesc, { color: theme.colors.mutedForeground }]}>
                    UniNest is more than a platform — it’s a movement. We are bridging the gap between students, knowledge, and opportunity to create the campus of the future.
                </Text>
            </View>

            <View style={styles.missionSection}>
                <Image
                    source={{ uri: 'https://picsum.photos/seed/uninest-mission/800/800' }}
                    style={styles.missionImage}
                />
                <View style={styles.missionContent}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.foreground }]}>Our Mission</Text>
                    <Text style={[styles.sectionDesc, { color: theme.colors.mutedForeground }]}>
                        At UniNest, we believe every student deserves equal access to knowledge, opportunity, and community. The modern campus is fragmented — we exist to bring it all together in one seamless digital ecosystem.
                    </Text>
                </View>
            </View>

            <View style={styles.statsContainer}>
                {STATS.map((stat, index) => (
                    <View key={index} style={[styles.statCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                        <Ionicons name={stat.icon as any} size={24} color={theme.colors.primary[600]} />
                        <Text style={[styles.statValue, { color: theme.colors.foreground }]}>{stat.value}</Text>
                        <Text style={[styles.statLabel, { color: theme.colors.mutedForeground }]}>{stat.label}</Text>
                    </View>
                ))}
            </View>

            <View style={styles.valuesSection}>
                <Text style={[styles.sectionTitle, { color: theme.colors.foreground, textAlign: 'center' }]}>Driven by Values</Text>
                <View style={styles.valuesGrid}>
                    {VALUES.map((value, index) => (
                        <View key={index} style={styles.valueItem}>
                            <View style={[styles.valueIcon, { backgroundColor: theme.colors.primary[100] }]}>
                                <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary[600]} />
                            </View>
                            <View style={styles.valueText}>
                                <Text style={[styles.valueTitle, { color: theme.colors.foreground }]}>{value.title}</Text>
                                <Text style={[styles.valueDesc, { color: theme.colors.mutedForeground }]}>{value.description}</Text>
                            </View>
                        </View>
                    ))}
                </View>
            </View>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.socialButton, { backgroundColor: theme.colors.primary[600] }]}
                    onPress={() => Linking.openURL('https://instagram.com/uninest_x')}
                >
                    <Ionicons name="logo-instagram" size={20} color="#fff" />
                    <Text style={styles.socialButtonText}>Follow Our Story</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    hero: {
        padding: 24,
        paddingTop: 40,
        alignItems: 'center',
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        marginBottom: 20,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: 'bold',
        marginLeft: 6,
    },
    heroTitle: {
        fontSize: 32,
        fontWeight: '800',
        textAlign: 'center',
        lineHeight: 40,
        marginBottom: 16,
    },
    heroDesc: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: 10,
    },
    missionSection: {
        padding: 24,
    },
    missionImage: {
        width: '100%',
        height: 200,
        borderRadius: 24,
        marginBottom: 20,
    },
    missionContent: {
        gap: 8,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    sectionDesc: {
        fontSize: 16,
        lineHeight: 24,
    },
    statsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 12,
        gap: 12,
    },
    statCard: {
        flex: 1,
        minWidth: '45%',
        padding: 20,
        borderRadius: 20,
        borderWidth: 1,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 8,
    },
    statLabel: {
        fontSize: 14,
    },
    valuesSection: {
        padding: 24,
        marginTop: 20,
    },
    valuesGrid: {
        marginTop: 20,
        gap: 20,
    },
    valueItem: {
        flexDirection: 'row',
        gap: 16,
    },
    valueIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    valueText: {
        flex: 1,
    },
    valueTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 4,
    },
    valueDesc: {
        fontSize: 14,
        lineHeight: 20,
    },
    footer: {
        padding: 40,
        alignItems: 'center',
    },
    socialButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 30,
        gap: 10,
    },
    socialButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
