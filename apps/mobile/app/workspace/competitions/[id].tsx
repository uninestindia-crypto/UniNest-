import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator, Alert, Linking } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';
import { workspaceApi } from '@/services/supabase';

export default function CompetitionDetailScreen() {
    const { id } = useLocalSearchParams();
    const { theme } = useTheme();
    const router = useRouter();

    const { data: competition, isLoading, error } = useQuery({
        queryKey: ['competition', id],
        queryFn: () => workspaceApi.getCompetitionById(Number(id)),
        enabled: !!id,
    });

    if (isLoading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator size="large" color={theme.colors.primary[500]} />
            </View>
        );
    }

    if (error || !competition) {
        return (
            <View style={[styles.errorContainer, { backgroundColor: theme.colors.background }]}>
                <Text style={[styles.errorText, { color: theme.colors.destructive }]}>
                    Failed to load competition details
                </Text>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={[styles.backText, { color: theme.colors.primary[500] }]}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const handleApply = () => {
        // For Phase 1, we'll redirect to web or show alert
        Alert.alert('Apply', 'Application features will be available in the next update. Please use the web platform to apply.');
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <ScrollView contentContainerStyle={styles.content}>
                {competition.image_url && (
                    <Image source={{ uri: competition.image_url }} style={styles.bannerImage} resizeMode="cover" />
                )}

                <View style={styles.header}>
                    <Text style={[styles.title, { color: theme.colors.foreground }]}>{competition.title}</Text>
                    <View style={styles.metaRow}>
                        <View style={[styles.badge, { backgroundColor: theme.colors.primary[50] }]}>
                            <Text style={[styles.badgeText, { color: theme.colors.primary[600] }]}>Competition</Text>
                        </View>
                        <Text style={[styles.deadline, { color: theme.colors.mutedForeground }]}>
                            Ends {new Date(competition.deadline).toLocaleDateString()}
                        </Text>
                    </View>
                </View>

                <View style={[styles.statsContainer, { backgroundColor: theme.colors.card }]}>
                    <View style={styles.statItem}>
                        <Ionicons name="trophy-outline" size={24} color={theme.colors.warning} />
                        <Text style={[styles.statValue, { color: theme.colors.foreground }]}>₹{competition.prize.toLocaleString()}</Text>
                        <Text style={[styles.statLabel, { color: theme.colors.mutedForeground }]}>Prize Pool</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.statItem}>
                        <Ionicons name="cash-outline" size={24} color={theme.colors.success} />
                        <Text style={[styles.statValue, { color: theme.colors.foreground }]}>
                            {competition.entry_fee === 0 ? 'Free' : `₹${competition.entry_fee}`}
                        </Text>
                        <Text style={[styles.statLabel, { color: theme.colors.mutedForeground }]}>Entry Fee</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.foreground }]}>Description</Text>
                    <Text style={[styles.description, { color: theme.colors.mutedForeground }]}>
                        {competition.description}
                    </Text>
                </View>

                {competition.rules && (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: theme.colors.foreground }]}>Rules</Text>
                        <Text style={[styles.description, { color: theme.colors.mutedForeground }]}>
                            {competition.rules}
                        </Text>
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
    bannerImage: {
        width: '100%',
        height: 200,
    },
    header: {
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    metaRow: {
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
    },
    statValue: {
        fontSize: 18,
        fontWeight: '700',
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
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
    },
    description: {
        fontSize: 16,
        lineHeight: 24,
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
