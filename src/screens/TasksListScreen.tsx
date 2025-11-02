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
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import Modal from 'react-native-modal';

type Props = BottomTabScreenProps<any, 'TasksList'>;

interface TaskType {
    id: string;
    name: string;
    description: string;
    icon: string;
    color: string;
    frequency: string;
    frequencyDays?: number;
    estimatedDuration?: number;
    isActive: boolean;
    rotationOrders: Array<{
        id: string;
        position: number;
        user: {
            id: string;
            name: string;
            avatarUrl?: string;
        };
    }>;
    _count: {
        shifts: number;
    };
}

export default function TasksListScreen({ navigation, route }: Props) {
    const { householdId } = route.params;
    const [taskTypes, setTaskTypes] = useState<TaskType[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedTask, setSelectedTask] = useState<TaskType | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [household, setHousehold] = useState<any>(null);

    const theme = useTheme();
    const { user } = useAuth();

    useEffect(() => {
        loadHousehold();
        loadTaskTypes();
    }, [householdId]);

    async function loadHousehold() {
        try {
            const response = await api.get(`/households/${householdId}`);
            setHousehold(response.data);
        } catch (error) {
            console.error('Error loading household:', error);
        }
    }

    async function loadTaskTypes() {
        try {
            const response = await api.get(`/households/${householdId}/task-types`);
            setTaskTypes(response.data);
        } catch (error) {
            console.error('Error loading task types:', error);
            Alert.alert('Errore', 'Impossibile caricare i tipi di compito');
        } finally {
            setLoading(false);
        }
    }

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadTaskTypes();
        setRefreshing(false);
    }, [householdId]);

    async function handleGenerateShifts() {
        Alert.alert(
            'Genera Turni',
            'Vuoi generare i turni per i prossimi 30 giorni?',
            [
                { text: 'Annulla', style: 'cancel' },
                {
                    text: 'Genera',
                    onPress: async () => {
                        try {
                            const response = await api.post('/shifts/generate', {
                                householdId,
                                days: 30,
                            });
                            Alert.alert('Successo', response.data.message);
                            await loadTaskTypes();
                        } catch (error: any) {
                            Alert.alert(
                                'Errore',
                                error.response?.data?.error || 'Impossibile generare i turni'
                            );
                        }
                    },
                },
            ]
        );
    }

    async function handleDeleteTask(taskId: string) {
        Alert.alert(
            'Elimina Compito',
            'Sei sicuro di voler eliminare questo tipo di compito?',
            [
                { text: 'Annulla', style: 'cancel' },
                {
                    text: 'Elimina',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.delete(`/task-types/${taskId}`);
                            await loadTaskTypes();
                            setModalVisible(false);
                            Alert.alert('Successo', 'Compito eliminato');
                        } catch (error) {
                            Alert.alert('Errore', 'Impossibile eliminare il compito');
                        }
                    },
                },
            ]
        );
    }

    function getFrequencyLabel(frequency: string, days?: number) {
        switch (frequency) {
            case 'DAILY':
                return 'Giornaliero';
            case 'WEEKLY':
                return 'Settimanale';
            case 'BIWEEKLY':
                return 'Bisettimanale';
            case 'MONTHLY':
                return 'Mensile';
            case 'CUSTOM':
                return `Ogni ${days} giorni`;
            default:
                return frequency;
        }
    }

    const renderTaskItem = ({ item }: { item: TaskType }) => (
        <TouchableOpacity
            style={[styles.taskCard, { backgroundColor: theme.colors.surface }, theme.shadows.sm]}
            onPress={() => {
                setSelectedTask(item);
                setModalVisible(true);
            }}
            activeOpacity={0.7}
        >
            <View style={styles.taskHeader}>
                <View style={[styles.iconBadge, { backgroundColor: item.color + '20' }]}>
                    <Ionicons name={item.icon as any} size={28} color={item.color} />
                </View>
                <View style={styles.taskInfo}>
                    <Text style={[styles.taskTitle, { color: theme.colors.text }]}>
                        {item.name}
                    </Text>
                    <Text style={[styles.taskFrequency, { color: theme.colors.textSecondary }]}>
                        {getFrequencyLabel(item.frequency, item.frequencyDays)}
                    </Text>
                    {item.description && (
                        <Text
                            style={[styles.taskDescription, { color: theme.colors.textSecondary }]}
                            numberOfLines={2}
                        >
                            {item.description}
                        </Text>
                    )}
                </View>
                <Ionicons name="chevron-forward" size={24} color={theme.colors.textSecondary} />
            </View>

            {/* Rotation preview */}
            {item.rotationOrders.length > 0 && (
                <View style={styles.rotationPreview}>
                    <Ionicons name="people" size={16} color={theme.colors.textSecondary} />
                    <Text style={[styles.rotationText, { color: theme.colors.textSecondary }]}>
                        {item.rotationOrders.length} {item.rotationOrders.length === 1 ? 'persona' : 'persone'} in rotazione
                    </Text>
                </View>
            )}

            {/* Stats */}
            <View style={styles.taskStats}>
                <View style={styles.statItem}>
                    <Ionicons name="calendar" size={16} color={theme.colors.info} />
                    <Text style={[styles.statText, { color: theme.colors.textSecondary }]}>
                        {item._count.shifts} turni
                    </Text>
                </View>
                {item.estimatedDuration && (
                    <View style={styles.statItem}>
                        <Ionicons name="time" size={16} color={theme.colors.warning} />
                        <Text style={[styles.statText, { color: theme.colors.textSecondary }]}>
                            ~{item.estimatedDuration} min
                        </Text>
                    </View>
                )}
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
                <View>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
                        Tipi di Compiti
                    </Text>
                    {household && (
                        <Text style={[styles.householdName, { color: theme.colors.textSecondary }]}>
                            {household.name}
                        </Text>
                    )}
                </View>
                <TouchableOpacity
                    style={[styles.generateButton, { backgroundColor: theme.colors.success }]}
                    onPress={handleGenerateShifts}
                >
                    <Ionicons name="refresh" size={20} color="#FFFFFF" />
                    <Text style={styles.generateButtonText}>Genera Turni</Text>
                </TouchableOpacity>
            </View>

            {/* Task Types List */}
            <FlatList
                data={taskTypes}
                renderItem={renderTaskItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.tasksList}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={theme.colors.primary}
                    />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="clipboard-outline" size={80} color={theme.colors.textSecondary} />
                        <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
                            Nessun compito
                        </Text>
                        <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
                            Crea il primo tipo di compito per iniziare
                        </Text>
                    </View>
                }
            />

            {/* FAB - Create Task Type */}
            <TouchableOpacity
                style={[styles.fab, { backgroundColor: theme.colors.primary }, theme.shadows.lg]}
                onPress={() => navigation.navigate('CreateTaskType', { householdId })}
            >
                <Ionicons name="add" size={32} color="#FFFFFF" />
            </TouchableOpacity>

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

                    {selectedTask && (
                        <>
                            <View style={styles.modalHeader}>
                                <View style={[styles.modalIconBadge, { backgroundColor: selectedTask.color + '20' }]}>
                                    <Ionicons
                                        name={selectedTask.icon as any}
                                        size={40}
                                        color={selectedTask.color}
                                    />
                                </View>
                                <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                                    {selectedTask.name}
                                </Text>
                                {selectedTask.description && (
                                    <Text style={[styles.modalDescription, { color: theme.colors.textSecondary }]}>
                                        {selectedTask.description}
                                    </Text>
                                )}
                            </View>

                            <View style={styles.modalInfo}>
                                <View style={styles.infoRow}>
                                    <Ionicons name="repeat" size={20} color={theme.colors.textSecondary} />
                                    <Text style={[styles.infoText, { color: theme.colors.text }]}>
                                        {getFrequencyLabel(selectedTask.frequency, selectedTask.frequencyDays)}
                                    </Text>
                                </View>
                                {selectedTask.estimatedDuration && (
                                    <View style={styles.infoRow}>
                                        <Ionicons name="time" size={20} color={theme.colors.textSecondary} />
                                        <Text style={[styles.infoText, { color: theme.colors.text }]}>
                                            Durata stimata: {selectedTask.estimatedDuration} minuti
                                        </Text>
                                    </View>
                                )}
                                <View style={styles.infoRow}>
                                    <Ionicons name="calendar" size={20} color={theme.colors.textSecondary} />
                                    <Text style={[styles.infoText, { color: theme.colors.text }]}>
                                        {selectedTask._count.shifts} turni generati
                                    </Text>
                                </View>
                            </View>

                            {/* Rotation Section */}
                            {selectedTask.rotationOrders.length > 0 && (
                                <View style={styles.rotationSection}>
                                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                                        Ordine di Rotazione
                                    </Text>
                                    {selectedTask.rotationOrders
                                        .sort((a, b) => a.position - b.position)
                                        .map((rotation, index) => (
                                            <View key={rotation.id} style={styles.rotationItem}>
                                                <View style={styles.positionBadge}>
                                                    <Text style={[styles.positionText, { color: theme.colors.primary }]}>
                                                        {index + 1}
                                                    </Text>
                                                </View>
                                                <Text style={[styles.rotationUserName, { color: theme.colors.text }]}>
                                                    {rotation.user.name}
                                                </Text>
                                            </View>
                                        ))}
                                </View>
                            )}

                            {/* Actions */}
                            <View style={styles.modalActions}>
                                {selectedTask.rotationOrders.length === 0 && household && (
                                    <TouchableOpacity
                                        style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
                                        onPress={() => {
                                            setModalVisible(false);
                                            navigation.navigate('SetupRotation', {
                                                householdId,
                                                taskTypeId: selectedTask.id,
                                                taskTypeName: selectedTask.name,
                                            });
                                        }}
                                    >
                                        <Ionicons name="people" size={24} color="#FFFFFF" />
                                        <Text style={styles.actionButtonText}>Imposta Rotazione</Text>
                                    </TouchableOpacity>
                                )}

                                {selectedTask.rotationOrders.length > 0 && (
                                    <TouchableOpacity
                                        style={[
                                            styles.actionButton,
                                            { backgroundColor: theme.colors.surface, borderWidth: 2, borderColor: theme.colors.primary },
                                        ]}
                                        onPress={() => {
                                            setModalVisible(false);
                                            navigation.navigate('SetupRotation', {
                                                householdId,
                                                taskTypeId: selectedTask.id,
                                                taskTypeName: selectedTask.name,
                                            });
                                        }}
                                    >
                                        <Ionicons name="create" size={24} color={theme.colors.primary} />
                                        <Text style={[styles.actionButtonText, { color: theme.colors.primary }]}>
                                            Modifica Rotazione
                                        </Text>
                                    </TouchableOpacity>
                                )}

                                <TouchableOpacity
                                    style={[
                                        styles.actionButton,
                                        { backgroundColor: theme.colors.error + '20' },
                                    ]}
                                    onPress={() => handleDeleteTask(selectedTask.id)}
                                >
                                    <Ionicons name="trash" size={24} color={theme.colors.error} />
                                    <Text style={[styles.actionButtonText, { color: theme.colors.error }]}>
                                        Elimina
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity
                                style={[styles.closeButton, { borderColor: theme.colors.border }]}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={[styles.closeButtonText, { color: theme.colors.text }]}>
                                    Chiudi
                                </Text>
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
        paddingVertical: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    backButton: {
        marginBottom: 8,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
        marginBottom: 4,
    },
    householdName: {
        fontSize: 16,
    },
    generateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        marginTop: 4,
    },
    generateButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 8,
    },
    tasksList: {
        paddingHorizontal: 24,
        paddingBottom: 100,
    },
    taskCard: {
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
    },
    taskHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    iconBadge: {
        width: 56,
        height: 56,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    taskInfo: {
        flex: 1,
        marginLeft: 12,
    },
    taskTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 4,
    },
    taskFrequency: {
        fontSize: 14,
        marginBottom: 4,
    },
    taskDescription: {
        fontSize: 13,
        lineHeight: 18,
    },
    rotationPreview: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
    },
    rotationText: {
        fontSize: 14,
        marginLeft: 8,
    },
    taskStats: {
        flexDirection: 'row',
        gap: 16,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statText: {
        fontSize: 13,
        marginLeft: 6,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 80,
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
    },
    fab: {
        position: 'absolute',
        right: 24,
        bottom: 100,
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modal: {
        justifyContent: 'flex-end',
        margin: 0,
    },
    modalContent: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        maxHeight: '85%',
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
        width: 96,
        height: 96,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 26,
        fontWeight: '700',
        marginBottom: 8,
        textAlign: 'center',
    },
    modalDescription: {
        fontSize: 15,
        textAlign: 'center',
        lineHeight: 22,
    },
    modalInfo: {
        marginBottom: 24,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    infoText: {
        fontSize: 16,
        marginLeft: 12,
    },
    rotationSection: {
        marginBottom: 24,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 16,
    },
    rotationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        marginBottom: 8,
    },
    positionBadge: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    positionText: {
        fontSize: 16,
        fontWeight: '700',
    },
    rotationUserName: {
        fontSize: 16,
        fontWeight: '600',
    },
    modalActions: {
        marginBottom: 16,
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