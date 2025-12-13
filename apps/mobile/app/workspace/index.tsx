import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '@/theme';
import { workspaceApi } from '@/services/supabase';
import type { Competition, Internship } from '@uninest/shared-types';

type TabType = 'competitions' | 'internships';

function CompetitionCard({ item }: { item: Competition }) {
    const { theme } = useTheme();
    const router = useRouter();

    return (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: theme.colors.card }, theme.shadows.sm]}
            onPress={() => router.push(`/workspace/competitions/${item.id}`)}
        >
            <View style={styles.cardHeader}>
                <View style={[styles.badge, { backgroundColor: theme.colors.primary[50] }]}>
                    <Text style={[styles.badgeText, { color: theme.colors.primary[600] }]}>
                        Competition
                    </Text>
                </View>
                <Text style={[styles.dateText, { color: theme.colors.mutedForeground }]}>
                    Ends {new Date(item.deadline).toLocaleDateString()}
                </Text>
            </View>

            <Text style={[styles.cardTitle, { color: theme.colors.foreground }]} numberOfLines={2}>
                {item.title}
            </Text>

            <Text style={[styles.cardDescription, { color: theme.colors.mutedForeground }]} numberOfLines={2}>
                {item.description}
            </Text>

            <View style={styles.cardFooter}>
                <View style={styles.footerItem}>
                    <Ionicons name="trophy-outline" size={16} color={theme.colors.warning} />
                    <Text style={[styles.footerText, { color: theme.colors.foreground }]}>
                        ₹{item.prize.toLocaleString()}
                    </Text>
                </View>
                <View style={styles.footerItem}>
                    <Ionicons name="cash-outline" size={16} color={theme.colors.success} />
                    <Text style={[styles.footerText, { color: theme.colors.foreground }]}>
                        {item.entry_fee === 0 ? 'Free' : `₹${item.entry_fee}`}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
}

function InternshipCard({ item }: { item: Internship }) {
    const { theme } = useTheme();
    const router = useRouter();

    return (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: theme.colors.card }, theme.shadows.sm]}
            onPress={() => router.push(`/workspace/internships/${item.id}`)}
        >
            <View style={styles.cardHeader}>
                <View style={[styles.badge, { backgroundColor: '#f3e8ff' }]}>
                    <Text style={[styles.badgeText, { color: '#9333ea' }]}>
                        Internship
                    </Text>
                </View>
                <Text style={[styles.dateText, { color: theme.colors.mutedForeground }]}>
                    Apply by {new Date(item.deadline).toLocaleDateString()}
                </Text>
            </View>

            <View style={styles.internshipContent}>
                {item.image_url ? (
                    <Image source={{ uri: item.image_url }} style={styles.companyLogo} />
                ) : (
                    <View style={[styles.companyLogoPlaceholder, { backgroundColor: theme.colors.muted }]}>
                        <Ionicons name="business-outline" size={24} color={theme.colors.mutedForeground} />
                    </View>
                )}
                <View style={styles.internshipDetails}>
                    <Text style={[styles.cardTitle, { color: theme.colors.foreground }]} numberOfLines={1}>
                        {item.role}
                    </Text>
                    <Text style={[styles.companyName, { color: theme.colors.mutedForeground }]}>
                        {item.company}
                    </Text>
                </View>
            </View>

            <View style={styles.cardFooter}>
                <View style={styles.footerItem}>
                    <Ionicons name="wallet-outline" size={16} color={theme.colors.foreground} />
                    <Text style={[styles.footerText, { color: theme.colors.foreground }]}>
                        {item.stipend > 0 ? `₹${item.stipend.toLocaleString()}` : 'Unpaid'}
                    </Text>
                </View>
                <View style={styles.footerItem}>
                    <Ionicons name="location-outline" size={16} color={theme.colors.foreground} />
                    <Text style={[styles.footerText, { color: theme.colors.foreground }]}>
                        {item.location}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
}

export default function WorkspaceScreen() {
    const { theme } = useTheme();
    const [activeTab, setActiveTab] = useState<TabType>('competitions');

    const { data: competitions, isLoading: loadingCompetitions } = useQuery({
        queryKey: ['workspace', 'competitions'],
        queryFn: () => workspaceApi.getCompetitions(),
        enabled: activeTab === 'competitions',
    });

    const { data: internships, isLoading: loadingInternships } = useQuery({
        queryKey: ['workspace', 'internships'],
        queryFn: () => workspaceApi.getInternships(),
        enabled: activeTab === 'internships',
    });

    const isLoading = activeTab === 'competitions' ? loadingCompetitions : loadingInternships;

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.tabsContainer}>
                <TouchableOpacity
                    style={[
                        styles.tab,
                        activeTab === 'competitions' && {
                            backgroundColor: theme.colors.card,
                            ...theme.shadows.sm
                        }
                    ]}
                    onPress={() => setActiveTab('competitions')}
                >
                    <Text
                        style={[
                            styles.tabText,
                            {
                                color: activeTab === 'competitions'
                                    ? theme.colors.primary[600]
                                    : theme.colors.mutedForeground
                            }
                        ]}
                    >
                        Competitions
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.tab,
                        activeTab === 'internships' && {
                            backgroundColor: theme.colors.card,
                            ...theme.shadows.sm
                        }
                    ]}
                    onPress={() => setActiveTab('internships')}
                >
                    <Text
                        style={[
                            styles.tabText,
                            {
                                color: activeTab === 'internships'
                                    ? theme.colors.primary[600]
                                    : theme.colors.mutedForeground
                            }
                        ]}
                    >
                        Internships
                    </Text>
                </TouchableOpacity>
            </View>

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary[500]} />
                </View>
            ) : activeTab === 'competitions' ? (
                <FlatList
                    data={competitions}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    renderItem={({ item }) => <CompetitionCard item={item} />}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={[styles.emptyText, { color: theme.colors.mutedForeground }]}>
                                No competitions found
                            </Text>
                        </View>
                    }
                />
            ) : (
                <FlatList
                    data={internships}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    renderItem={({ item }) => <InternshipCard item={item} />}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={[styles.emptyText, { color: theme.colors.mutedForeground }]}>
                                No internships found
                            </Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    tabsContainer: {
        flexDirection: 'row',
        padding: 16,
        gap: 12,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 20,
    },
    tabText: {
        fontWeight: '600',
        fontSize: 14,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: 16,
        paddingTop: 0,
        gap: 16,
    },
    card: {
        borderRadius: 16,
        padding: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '600',
    },
    dateText: {
        fontSize: 12,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 8,
    },
    cardDescription: {
        fontSize: 14,
        marginBottom: 12,
        lineHeight: 20,
    },
    cardFooter: {
        flexDirection: 'row',
        gap: 16,
        marginTop: 4,
    },
    footerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    footerText: {
        fontSize: 14,
        fontWeight: '500',
    },
    internshipContent: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    companyLogo: {
        width: 48,
        height: 48,
        borderRadius: 8,
    },
    companyLogoPlaceholder: {
        width: 48,
        height: 48,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    internshipDetails: {
        marginLeft: 12,
        flex: 1,
    },
    companyName: {
        fontSize: 14,
        marginTop: 2,
    },
    emptyContainer: {
        padding: 32,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
    },
});
