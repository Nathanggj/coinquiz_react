import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import Modal from 'react-native-modal';

interface Shift {
    id: string;
    scheduledDate: string;
    status: string;
    notes?: string;
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

export default function ShiftsScreen() {
    const [shifts, setShifts] = useState<Shift[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState<'all' | 'my' | 'pending' | 'completed'>('all');
    const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
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
    }, [selectedHousehold, filter]);

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

    async function loadShifts() {
        try {
            const params: any = {};

            if (filter === 'my') {
                params.userId = user?.id;
            } else if (filter === 'pending') {
                params.status = 'PENDING';
            } else if (filter === 'completed') {
                params.status = 'COMPLETED';
            }

            const response = await api.get(`/households/${selectedHousehold.id}/shifts`, { params });
            setShifts(response.data);
        } catch (error) {
            console.error('Error loading shifts:', error);
        }
    }

    const onRefresh = async () => {
        setRefreshing(true);
        await loadShifts();
        setRefreshing(false);
    };

    async function handleCompleteShift() {
        if (!selectedShift) return;

        try {
            await api.put(`/shifts/${selectedShift.id}/complete`);
            setModalVisible(false);
            await loadShifts();
        } catch (error) {
            console.error('Error completing shift:', error);
        }
    }

    async function handleReassignShift(newUserId: string) {
        if (!selectedShift) return;

        try {
            await api.put(`/shifts/${selectedShift.id}/reassign`, { userId: newUserId });
            setModalVisible(false);
            await loadShifts();
        } catch (error) {
            console.error('Error reassigning shift:', error);
        }
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

    const renderShiftItem = ({ item }: { item: Shift }) => (
        <TouchableOpacity
            style={[styles.shiftCard, { backgroundColor: theme.colors.surface }, theme.shadows.sm]}
            onPress={() => {
                setSelectedShift(item);
                setModalVisible(true);
            }}
            activeOpacity={0.7}
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
                    <Text style={[styles.shiftDate, { color: theme.colors.textSecondary }]}>
                        {format(new Date(item.scheduledDate), 'EEEE d MMMM yyyy', { locale: it })}
                    </Text>
                    <Text style={[styles.shiftAssigned, { color: theme.colors.textSecondary }]}>
                        {item.assignedUser.name}
                    </Text>
                </View>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                    {getStatusText(item.status)}
                </Text>
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: theme.colors.text }]}>I Miei Turni</Text>
            </View>

            {/* Filters */}
            <View style={styles.filtersContainer}>
                {[
                    { key: 'all', label: 'Tutti' },
                    { key: 'my', label: 'I miei' },
                    { key: 'pending', label: 'In attesa' },
                    { key: 'completed', label: 'Completati' },
                ].map((item) => (
                    <TouchableOpacity
                        key={item.key}
                        style={[
                            styles.filterButton,
                            filter === item.key && { backgroundColor: theme.colors.primary },
                            { borderColor: theme.colors.border },
                        ]}
                        onPress={() => setFilter(item.key as any)}
                    >
                        <Text
                            style={[
                                styles.filterText,
                                { color: filter === item.key ? '#FFFFFF' : theme.colors.textSecondary },
                            ]}
                        >
                            {item.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Shifts List */}
            <FlatList
                data={shifts}
                renderItem={renderShiftItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.shiftsList}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="calendar-outline" size={80} color={theme.colors.textSecondary} />
                        <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                            Nessun turno trovato
                        </Text>
                    </View>
                }
            />

            {/* Detail Modal */}
            <Modal
                isVisible={modalVisible}
                onBackdropPress={() => setModalVisible(false)}
                onSwipeComplete={() => setModalVisible(false)}
                swipeDirection="down"
                style={styles.modal}
            >
                <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
                    <View style={styles.modalHandle} />

                    {selectedShift && (
                        <>
                            <View style={styles.modalHeader}>
                                <View
                                    style={[
                                        styles.modalIconBadge,
                                        { backgroundColor: selectedShift.taskType.color || theme.colors.primary + '20' },
                                    ]}
                                >
                                    <Ionicons
                                        name={(selectedShift.taskType.icon as any) || 'checkbox-outline'}
                                        size={32}
                                        color={selectedShift.taskType.color || theme.colors.primary}
                                    />
                                </View>
                                <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                                    {selectedShift.taskType.name}
                                </Text>
                                <Text style={[styles.modalDate, { color: theme.colors.textSecondary }]}>
                                    {format(new Date(selectedShift.scheduledDate), 'EEEE d MMMM yyyy', { locale: it })}
                                </Text>
                            </View>

                            <View style={styles.modalInfo}>
                                <View style={styles.infoRow}>
                                    <Ionicons name="person" size={20} color={theme.colors.textSecondary} />
                                    <Text style={[styles.infoText, { color: theme.colors.text }]}>
                                        Assegnato a {selectedShift.assignedUser.name}
                                    </Text>
                                </View>
                                <View style={styles.infoRow}>
                                    <Ionicons name="information-circle" size={20} color={theme.colors.textSecondary} />
                                    <Text style={[styles.infoText, { color: theme.colors.text }]}>
                                        Stato: {getStatusText(selectedShift.status)}
                                    </Text>
                                </View>
                            </View>

                            {selectedShift.status === 'PENDING' && selectedShift.assignedUser.id === user?.id && (
                                <TouchableOpacity
                                    style={[styles.actionButton, { backgroundColor: theme.colors.success }]}
                                    onPress={handleCompleteShift}
                                >
                                    <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
                                    <Text style={styles.actionButtonText}>Completa Turno</Text>
                                </TouchableOpacity>
                            )}

                            <TouchableOpacity
                                style={[styles.closeButton, { borderColor: theme.colors.border }]}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={[styles.closeButtonText, { color: theme.colors.text }]}>Chiudi</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </Modal>
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
        paddingHorizontal: 24,
        paddingVertical: 20,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
    },
    filtersContainer: {
        flexDirection: 'row',
        paddingHorizontal: 24,
        marginBottom: 16,
    },
    filterButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
        borderWidth: 1,
    },
    filterText: {
        fontSize: 14,
        fontWeight: '600',
    },
    shiftsList: {
        paddingHorizontal: 24,
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
        marginBottom: 12,
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
    shiftDate: {
        fontSize: 14,
        marginBottom: 2,
    },
    shiftAssigned: {
        fontSize: 14,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 48,
    },
    emptyText: {
        fontSize: 16,
        marginTop: 16,
    },
    modal: {
        justifyContent: 'flex-end',
        margin: 0,
    },
    modalContent: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        minHeight: 400,
    },
    modalHandle: {
        width: 40,
        height: 4,
        backgroundColor: '#E2E8F0',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 24,
    },
    modalHeader: {
        alignItems: 'center',
        marginBottom: 24,
    },
    modalIconBadge: {
        width: 80,
        height: 80,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 8,
    },
    modalDate: {
        fontSize: 16,
    },
    modalInfo: {
        marginBottom: 24,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    infoText: {
        fontSize: 16,
        marginLeft: 12,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
    actionButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    closeButton: {
        padding: 16,
        borderRadius: 12,
        borderWidth: 2,
        alignItems: 'center',
    },
    closeButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});