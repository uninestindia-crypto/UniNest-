import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator, Alert, Linking } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';
import { workspaceApi } from '@/services/supabase';

export default function InternshipDetailScreen() {
    const { id } = useLocalSearchParams();
    const { theme } = useTheme();
    const router = useRouter();

    const { data: internship, isLoading, error } = useQuery({
        queryKey: ['internship', id],
        queryFn: () => workspaceApi.getInternshipById(Number(id)),
        enabled: !!id,
    });

    if (isLoading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator size="large" color={theme.colors.primary[500]} />
            </View>
        );
    }

    if (error || !internship) {
        return (
            <View style={[styles.errorContainer, { backgroundColor: theme.colors.background }]}>
                <Text style={[styles.errorText, { color: theme.colors.destructive }]}>
                    Failed to load internship details
                </Text>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={[styles.backText, { color: theme.colors.primary[500] }]}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const handleApply = () => {
        if (internship.apply_link) {
            Linking.openURL(internship.apply_link);
        } else {
            Alert.alert('Apply', 'Application features will be available in the next update. Please use the web platform to apply.');
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <ScrollView contentContainerStyle={styles.content}>

                <View style={styles.header}>
                    <View style={styles.headerTop}>
                        {internship.image_url ? (
                            <Image source={{ uri: internship.image_url }} style={styles.logo} />
                        ) : (
                            <View style={[styles.logoPlaceholder, { backgroundColor: theme.colors.muted }]}>
                                <Ionicons name="business-outline" size={32} color={theme.colors.mutedForeground} />
                            </View>
                        )}
                        <View style={styles.headerText}>
                            <Text style={[styles.role, { color: theme.colors.foreground }]}>{internship.role}</Text>
                            <Text style={[styles.company, { color: theme.colors.mutedForeground }]}>{internship.company}</Text>
                        </View>
                    </View>

                    <View style={styles.metaStart}>
                        <View style={[styles.badge, { backgroundColor: '#f3e8ff' }]}>
                            <Text style={[styles.badgeText, { color: '#9333ea' }]}>Internship</Text>
                        </View>
                        <Text style={[styles.deadline, { color: theme.colors.mutedForeground }]}>
                            Apply by {new Date(internship.deadline).toLocaleDateString()}
                        </Text>
                    </View>
                </View>

                <View style={[styles.statsContainer, { backgroundColor: theme.colors.card }]}>
                    <View style={styles.statItem}>
                        <Ionicons name="wallet-outline" size={20} color={theme.colors.foreground} />
                        <Text style={[styles.statValue, { color: theme.colors.foreground }]}>
                            {internship.stipend > 0 ? `₹${internship.stipend.toLocaleString()}` : 'Unpaid'}
                        </Text>
                        <Text style={[styles.statLabel, { color: theme.colors.mutedForeground }]}>/{internship.stipend_period.slice(0, 3)}</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.statItem}>
                        <Ionicons name="location-outline" size={20} color={theme.colors.foreground} />
                        <Text style={[styles.statValue, { color: theme.colors.foreground }]}>
                            {internship.location}
                        </Text>
                        <Text style={[styles.statLabel, { color: theme.colors.mutedForeground }]}>Location</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.foreground }]}>Job Description</Text>
                    <Text style={[styles.description, { color: theme.colors.mutedForeground }]}>
                        {internship.description || 'No detailed description available.'}
                    </Text>
                </View>

                {internship.requirements && (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: theme.colors.foreground }]}>Requirements</Text>
                        {internship.requirements.map((req, index) => (
                            <View key={index} style={styles.reqItem}>
                                <Ionicons name="checkmark-circle-outline" size={16} color={theme.colors.primary[500]} />
                                <Text style={[styles.description, { color: theme.colors.mutedForeground, flex: 1 }]}>{req}</Text>
                            </View>
                        ))}
                    </View>
                )}

            </ScrollView>

            <View style={[styles.footer, { backgroundColor: theme.colors.card, borderTopColor: theme.colors.border }]}>
                <TouchableOpacity
                    style={[styles.applyButton, { backgroundColor: theme.colors.primary[600] }]}
                    onPress={handleApply}
                >
                    <Text style={styles.applyButtonText}>Apply Now</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
    },
    errorText: {
        fontSize: 16,
    },
    backText: {
        fontSize: 16,
        fontWeight: '600',
    },
    content: {
        paddingBottom: 100,
    },
    header: {
        padding: 20,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    logo: {
        width: 64,
        height: 64,
        borderRadius: 12,
    },
    logoPlaceholder: {
        width: 64,
        height: 64,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerText: {
        marginLeft: 16,
        flex: 1,
    },
    role: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    company: {
        fontSize: 16,
    },
    metaStart: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '600',
    },
    deadline: {
        fontSize: 14,
    },
    statsContainer: {
        flexDirection: 'row',
        marginHorizontal: 20,
        borderRadius: 16,
        padding: 16,
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    statItem: {
        alignItems: 'center',
        gap: 4,
        flex: 1,
    },
    statValue: {
        fontSize: 16,
        fontWeight: '700',
        textAlign: 'center',
    },
    statLabel: {
        fontSize: 12,
    },
    divider: {
        width: 1,
        height: 40,
        backgroundColor: '#e2e8f0',
    },
    section: {
        padding: 20,
        paddingBottom: 0,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 12,
    },
    description: {
        fontSize: 15,
        lineHeight: 24,
    },
    reqItem: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 8,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 16,
        paddingBottom: 32,
        borderTopWidth: 1,
    },
    applyButton: {
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    applyButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
});
