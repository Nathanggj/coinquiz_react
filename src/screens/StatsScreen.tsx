import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

interface UserStats {
    tasksCompleted: number;
    tasksSkipped: number;
    completionRate: number;
    points: number;
    user: {
        id: string;
        name: string;
    };
}

interface HouseholdStats {
    totalShifts: number;
    completedShifts: number;
    overdueShifts: number;
    completionRate: string;
}

export default function StatsScreen() {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [memberStats, setMemberStats] = useState<UserStats[]>([]);
    const [householdStats, setHouseholdStats] = useState<HouseholdStats | null>(null);
    const [households, setHouseholds] = useState<any[]>([]);
    const [selectedHousehold, setSelectedHousehold] = useState<any>(null);

    const theme = useTheme();
    const { user } = useAuth();

    useEffect(() => {
        loadHouseholds();
    }, []);

    useEffect(() => {
        if (selectedHousehold) {
            loadStats();
        }
    }, [selectedHousehold]);

    async function loadHouseholds() {
        try {
            const response = await api.get('/households');
            setHouseholds(response.data);
            if (response.data.length > 0) {
                setSelectedHousehold(response.data[0]);
            }
        } catch (error) {
            console.error('Error loading households:', error);
        } finally {
            setLoading(false);
        }
    }

    async function loadStats() {
        try {
            const response = await api.get(`/households/${selectedHousehold.id}/stats`);
            setHouseholdStats(response.data.household);
            setMemberStats(response.data.members);
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    }

    const onRefresh = async () => {
        setRefreshing(true);
        await loadStats();
        setRefreshing(false);
    };

    const getMedalEmoji = (index: number): string => {
        switch (index) {
            case 0:
                return '🥇';
            case 1:
                return '🥈';
            case 2:
                return '🥉';
            default:
                return '';
        }
    };

    if (loading) {
        return (
            <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
                }
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Statistiche</Text>
                    {selectedHousehold && (
                        <Text style={[styles.householdName, { color: theme.colors.textSecondary }]}>
                            {selectedHousehold.name}
                        </Text>
                    )}
                </View>

                {/* Household Overview */}
                {householdStats && (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                            Panoramica Casa
                        </Text>
                        <View style={styles.overviewGrid}>
                            <View style={[styles.statCard, { backgroundColor: theme.colors.surface }, theme.shadows.sm]}>
                                <View style={[styles.statIcon, { backgroundColor: theme.colors.primary + '20' }]}>
                                    <Ionicons name="calendar" size={24} color={theme.colors.primary} />
                                </View>
                                <Text style={[styles.statValue, { color: theme.colors.text }]}>
                                    {householdStats.totalShifts}
                                </Text>
                                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                                    Turni Totali
                                </Text>
                            </View>

                            <View style={[styles.statCard, { backgroundColor: theme.colors.surface }, theme.shadows.sm]}>
                                <View style={[styles.statIcon, { backgroundColor: theme.colors.success + '20' }]}>
                                    <Ionicons name="checkmark-circle" size={24} color={theme.colors.success} />
                                </View>
                                <Text style={[styles.statValue, { color: theme.colors.text }]}>
                                    {householdStats.completedShifts}
                                </Text>
                                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                                    Completati
                                </Text>
                            </View>

                            <View style={[styles.statCard, { backgroundColor: theme.colors.surface }, theme.shadows.sm]}>
                                <View style={[styles.statIcon, { backgroundColor: theme.colors.error + '20' }]}>
                                    <Ionicons name="alert-circle" size={24} color={theme.colors.error} />
                                </View>
                                <Text style={[styles.statValue, { color: theme.colors.text }]}>
                                    {householdStats.overdueShifts}
                                </Text>
                                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                                    Scaduti
                                </Text>
                            </View>

                            <View style={[styles.statCard, { backgroundColor: theme.colors.surface }, theme.shadows.sm]}>
                                <View style={[styles.statIcon, { backgroundColor: theme.colors.info + '20' }]}>
                                    <Ionicons name="trending-up" size={24} color={theme.colors.info} />
                                </View>
                                <Text style={[styles.statValue, { color: theme.colors.text }]}>
                                    {householdStats.completionRate}%
                                </Text>
                                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                                    Completamento
                                </Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* Member Leaderboard */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                            Classifica Coinquilini
                        </Text>
                        <Ionicons name="trophy" size={24} color={theme.colors.warning} />
                    </View>

                    {memberStats.map((member, index) => {
                        const isCurrentUser = member.user.id === user?.id;
                        const medal = getMedalEmoji(index);

                        return (
                            <View
                                key={member.user.id}
                                style={[
                                    styles.memberCard,
                                    { backgroundColor: theme.colors.surface },
                                    theme.shadows.sm,
                                    isCurrentUser && { borderWidth: 2, borderColor: theme.colors.primary },
                                ]}
                            >
                                <View style={styles.memberRank}>
                                    <Text style={[styles.rankNumber, { color: theme.colors.text }]}>
                                        {medal || `${index + 1}`}
                                    </Text>
                                </View>

                                <View style={styles.memberInfo}>
                                    <Text style={[styles.memberName, { color: theme.colors.text }]}>
                                        {member.user.name}
                                        {isCurrentUser && <Text style={{ color: theme.colors.primary }}> (Tu)</Text>}
                                    </Text>
                                    <View style={styles.memberStatsRow}>
                                        <View style={styles.memberStat}>
                                            <Ionicons name="checkmark" size={16} color={theme.colors.success} />
                                            <Text style={[styles.memberStatText, { color: theme.colors.textSecondary }]}>
                                                {member.tasksCompleted} completati
                                            </Text>
                                        </View>
                                        <View style={styles.memberStat}>
                                            <Ionicons name="close" size={16} color={theme.colors.error} />
                                            <Text style={[styles.memberStatText, { color: theme.colors.textSecondary }]}>
                                                {member.tasksSkipped} saltati
                                            </Text>
                                        </View>
                                    </View>
                                </View>

                                <View style={styles.memberPoints}>
                                    <View style={[styles.pointsBadge, { backgroundColor: theme.colors.warning + '20' }]}>
                                        <Ionicons name="star" size={16} color={theme.colors.warning} />
                                        <Text style={[styles.pointsText, { color: theme.colors.warning }]}>
                                            {member.points}
                                        </Text>
                                    </View>
                                    <Text style={[styles.completionText, { color: theme.colors.textSecondary }]}>
                                        {member.completionRate.toFixed(0)}%
                                    </Text>
                                </View>
                            </View>
                        );
                    })}

                    {memberStats.length === 0 && (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="people-outline" size={64} color={theme.colors.textSecondary} />
                            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                                Nessuna statistica disponibile
                            </Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        paddingBottom: 100,
    },
    header: {
        paddingHorizontal: 24,
        paddingVertical: 20,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
        marginBottom: 4,
    },
    householdName: {
        fontSize: 16,
    },
    section: {
        paddingHorizontal: 24,
        marginBottom: 32,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 16,
    },
    overviewGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -6,
    },
    statCard: {
        width: '48%',
        margin: '1%',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    statIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    statValue: {
        fontSize: 28,
        fontWeight: '700',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 14,
        textAlign: 'center',
    },
    memberCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
    memberRank: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    rankNumber: {
        fontSize: 20,
        fontWeight: '700',
    },
    memberInfo: {
        flex: 1,
        marginLeft: 12,
    },
    memberName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
    },
    memberStatsRow: {
        flexDirection: 'row',
    },
    memberStat: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 16,
    },
    memberStatText: {
        fontSize: 12,
        marginLeft: 4,
    },
    memberPoints: {
        alignItems: 'flex-end',
    },
    pointsBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        marginBottom: 4,
    },
    pointsText: {
        fontSize: 14,
        fontWeight: '700',
        marginLeft: 4,
    },
    completionText: {
        fontSize: 12,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 48,
    },
    emptyText: {
        fontSize: 16,
        marginTop: 16,
    },
});