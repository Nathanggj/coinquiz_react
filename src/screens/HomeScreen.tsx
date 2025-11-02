import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Calendar, DateData } from 'react-native-calendars';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { it } from 'date-fns/locale';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { MainTabParamList } from '../navigation/MainNavigator';

type Props = BottomTabScreenProps<MainTabParamList, 'Home'>;

interface Shift {
    id: string;
    scheduledDate: string;
    status: string;
    taskType: {
        name: string;
        icon: string;
        color: string;
    };
    assignedUser: {
        id: string;
        name: string;
    };
}

export default function HomeScreen({ navigation }: Props) {
    const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [shifts, setShifts] = useState<Shift[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [households, setHouseholds] = useState<any[]>([]);
    const [selectedHousehold, setSelectedHousehold] = useState<any>(null);

    const theme = useTheme();
    const { user } = useAuth();

    useEffect(() => {
        loadHouseholds();
    }, []);

    useEffect(() => {
        if (selectedHousehold) {
            loadShifts();
        }
    }, [selectedHousehold, selectedDate]);

    async function loadHouseholds() {
        try {
            const response = await api.get('/households');
            setHouseholds(response.data);
            if (response.data.length > 0) {
                setSelectedHousehold(response.data[0]);
            }
        } catch (error) {
            console.error('Error loading households:', error);
            Alert.alert('Errore', 'Impossibile caricare le case');
        } finally {
            setLoading(false);
        }
    }

    async function loadShifts() {
        try {
            const currentDate = new Date(selectedDate);
            const start = format(startOfMonth(currentDate), 'yyyy-MM-dd');
            const end = format(endOfMonth(currentDate), 'yyyy-MM-dd');

            const response = await api.get(`/households/${selectedHousehold.id}/shifts`, {
                params: { startDate: start, endDate: end },
            });
            setShifts(response.data);
        } catch (error) {
            console.error('Error loading shifts:', error);
        }
    }

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await Promise.all([loadHouseholds(), loadShifts()]);
        setRefreshing(false);
    }, [selectedHousehold, selectedDate]);

    function getShiftsForSelectedDate() {
        return shifts.filter((shift) => shift.scheduledDate === selectedDate);
    }

    function getStatusColor(status: string) {
        switch (status) {
            case 'COMPLETED':
                return theme.colors.success;
            case 'PENDING':
                return theme.colors.warning;
            case 'OVERDUE':
                return theme.colors.error;
            default:
                return theme.colors.textSecondary;
        }
    }

    function getStatusText(status: string) {
        switch (status) {
            case 'COMPLETED':
                return 'Completato';
            case 'PENDING':
                return 'In attesa';
            case 'OVERDUE':
                return 'Scaduto';
            case 'SKIPPED':
                return 'Saltato';
            default:
                return status;
        }
    }

    async function handleCompleteShift(shiftId: string) {
        try {
            await api.put(`/shifts/${shiftId}/complete`);
            await loadShifts();
            Alert.alert('Successo', 'Turno completato!');
        } catch (error) {
            Alert.alert('Errore', 'Impossibile completare il turno');
        }
    }

    const renderShiftItem = ({ item }: { item: Shift }) => {
        const isMyShift = item.assignedUser.id === user?.id;
        const canComplete = isMyShift && item.status === 'PENDING';

        return (
            <View
                style={[styles.shiftCard, { backgroundColor: theme.colors.surface }, theme.shadows.sm]}
            >
                <View style={styles.shiftHeader}>
                    <View
                        style={[
                            styles.iconBadge,
                            { backgroundColor: item.taskType.color || theme.colors.primary + '20' },
                        ]}
                    >
                        <Ionicons
                            name={(item.taskType.icon as any) || 'checkbox-outline'}
                            size={24}
                            color={item.taskType.color || theme.colors.primary}
                        />
                    </View>
                    <View style={styles.shiftInfo}>
                        <Text style={[styles.shiftTitle, { color: theme.colors.text }]}>
                            {item.taskType.name}
                        </Text>
                        <Text style={[styles.shiftAssigned, { color: theme.colors.textSecondary }]}>
                            {isMyShift ? 'Il tuo turno' : `Assegnato a ${item.assignedUser.name}`}
                        </Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                        <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                            {getStatusText(item.status)}
                        </Text>
                    </View>
                </View>

                {canComplete && (
                    <TouchableOpacity
                        style={[styles.completeButton, { backgroundColor: theme.colors.success }]}
                        onPress={() => handleCompleteShift(item.id)}
                    >
                        <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                        <Text style={styles.completeButtonText}>Completa</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    if (loading) {
        return (
            <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    if (!selectedHousehold) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <View style={styles.emptyContainer}>
                    <Ionicons name="home-outline" size={80} color={theme.colors.textSecondary} />
                    <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
                        Nessuna casa trovata
                    </Text>
                    <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
                        Crea una nuova casa o unisciti a una esistente nelle impostazioni
                    </Text>
                    <TouchableOpacity
                        style={[styles.primaryButton, { backgroundColor: theme.colors.primary }]}
                        onPress={() => navigation.navigate('Settings')}
                    >
                        <Text style={styles.primaryButtonText}>Vai alle Impostazioni</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={[styles.greeting, { color: theme.colors.textSecondary }]}>
                        Ciao, {user?.name}!
                    </Text>
                    <Text style={[styles.householdName, { color: theme.colors.text }]}>
                        {selectedHousehold.name}
                    </Text>
                </View>
                <View style={styles.headerActions}>
                    <TouchableOpacity
                        style={[styles.headerButton, theme.shadows.sm]}
                        onPress={() => navigation.navigate('TasksList', { householdId: selectedHousehold.id })}
                    >
                        <Ionicons name="list" size={24} color={theme.colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.headerButton, theme.shadows.sm]}
                        onPress={() => navigation.navigate('Settings')}
                    >
                        <Ionicons name="settings" size={24} color={theme.colors.primary} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Quick Stats */}
            <View style={styles.quickStats}>
                <View style={[styles.statCard, { backgroundColor: theme.colors.surface }, theme.shadows.sm]}>
                    <Ionicons name="checkmark-circle" size={28} color={theme.colors.success} />
                    <Text style={[styles.statValue, { color: theme.colors.text }]}>
                        {shifts.filter(s => s.status === 'COMPLETED' && s.scheduledDate === selectedDate).length}
                    </Text>
                    <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                        Completati oggi
                    </Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: theme.colors.surface }, theme.shadows.sm]}>
                    <Ionicons name="time" size={28} color={theme.colors.warning} />
                    <Text style={[styles.statValue, { color: theme.colors.text }]}>
                        {shifts.filter(s => s.status === 'PENDING' && s.assignedUser.id === user?.id).length}
                    </Text>
                    <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                        I miei turni
                    </Text>
                </View>
            </View>

            {/* Calendar */}
            <View style={[styles.calendarContainer, { backgroundColor: theme.colors.surface }, theme.shadows.md]}>
                <Calendar
                    current={selectedDate}
                    onDayPress={(day: DateData) => setSelectedDate(day.dateString)}
                    markedDates={{
                        [selectedDate]: {
                            selected: true,
                            selectedColor: theme.colors.primary,
                        },
                        // Aggiungi marker per date con turni
                        ...shifts.reduce((acc, shift) => {
                            if (shift.scheduledDate !== selectedDate) {
                                acc[shift.scheduledDate] = {
                                    marked: true,
                                    dotColor: theme.colors.primary,
                                };
                            }
                            return acc;
                        }, {} as any),
                    }}
                    theme={{
                        backgroundColor: theme.colors.surface,
                        calendarBackground: theme.colors.surface,
                        textSectionTitleColor: theme.colors.textSecondary,
                        selectedDayBackgroundColor: theme.colors.primary,
                        selectedDayTextColor: '#FFFFFF',
                        todayTextColor: theme.colors.primary,
                        dayTextColor: theme.colors.text,
                        textDisabledColor: theme.colors.textSecondary,
                        monthTextColor: theme.colors.text,
                        textMonthFontWeight: '600',
                        textMonthFontSize: 18,
                    }}
                />
            </View>

            {/* Shifts List */}
            <View style={styles.shiftsSection}>
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                        Turni del {format(new Date(selectedDate), 'd MMMM', { locale: it })}
                    </Text>
                    <TouchableOpacity onPress={onRefresh}>
                        <Ionicons name="refresh" size={24} color={theme.colors.primary} />
                    </TouchableOpacity>
                </View>

                <FlatList
                    data={getShiftsForSelectedDate()}
                    renderItem={renderShiftItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.shiftsList}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor={theme.colors.primary}
                        />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyShifts}>
                            <Ionicons name="calendar-outline" size={64} color={theme.colors.textSecondary} />
                            <Text style={[styles.emptyShiftsText, { color: theme.colors.textSecondary }]}>
                                Nessun turno per questa data
                            </Text>
                            <TouchableOpacity
                                style={[styles.addTaskButton, { backgroundColor: theme.colors.primary + '20' }]}
                                onPress={() => navigation.navigate('TasksList', { householdId: selectedHousehold.id })}
                            >
                                <Text style={[styles.addTaskButtonText, { color: theme.colors.primary }]}>
                                    Gestisci Compiti
                                </Text>
                            </TouchableOpacity>
                        </View>
                    }
                />
            </View>
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 16,
    },
    greeting: {
        fontSize: 14,
        marginBottom: 4,
    },
    householdName: {
        fontSize: 24,
        fontWeight: '700',
    },
    headerActions: {
        flexDirection: 'row',
        gap: 12,
    },
    headerButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    quickStats: {
        flexDirection: 'row',
        paddingHorizontal: 24,
        marginBottom: 16,
        gap: 12,
    },
    statCard: {
        flex: 1,
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
    },
    statValue: {
        fontSize: 28,
        fontWeight: '700',
        marginTop: 8,
    },
    statLabel: {
        fontSize: 12,
        marginTop: 4,
    },
    calendarContainer: {
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 16,
        padding: 16,
    },
    shiftsSection: {
        flex: 1,
        paddingHorizontal: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    shiftsList: {
        paddingBottom: 100,
    },
    shiftCard: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    shiftHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconBadge: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    shiftInfo: {
        flex: 1,
        marginLeft: 12,
    },
    shiftTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    shiftAssigned: {
        fontSize: 14,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    completeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 12,
        paddingVertical: 10,
        borderRadius: 8,
    },
    completeButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 6,
    },
    emptyShifts: {
        alignItems: 'center',
        paddingVertical: 48,
    },
    emptyShiftsText: {
        fontSize: 16,
        marginTop: 16,
        marginBottom: 24,
    },
    addTaskButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    addTaskButtonText: {
        fontSize: 15,
        fontWeight: '600',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    emptyTitle: {
        fontSize: 24,
        fontWeight: '700',
        marginTop: 24,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 32,
    },
    primaryButton: {
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 12,
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});