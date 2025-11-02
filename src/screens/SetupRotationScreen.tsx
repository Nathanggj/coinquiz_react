import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../contexts/ThemeContext';
import api from '../services/api';

type Props = NativeStackScreenProps<any, 'SetupRotation'>;

interface Member {
    id: string;
    user: {
        id: string;
        name: string;
        email: string;
        avatarUrl?: string;
    };
}

export default function SetupRotationScreen({ navigation, route }: Props) {
    const { householdId, taskTypeId, taskTypeName } = route.params;
    const theme = useTheme();

    const [members, setMembers] = useState<Member[]>([]);
    const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadMembers();
    }, []);

    async function loadMembers() {
        try {
            const response = await api.get(`/households/${householdId}`);
            setMembers(response.data.members || []);
        } catch (error) {
            console.error('Error loading members:', error);
            Alert.alert('Errore', 'Impossibile caricare i membri');
        } finally {
            setLoading(false);
        }
    }

    function toggleMember(userId: string) {
        setSelectedMembers((prev) => {
            if (prev.includes(userId)) {
                return prev.filter((id) => id !== userId);
            } else {
                return [...prev, userId];
            }
        });
    }

    function moveUp(index: number) {
        if (index === 0) return;
        const newOrder = [...selectedMembers];
        [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
        setSelectedMembers(newOrder);
    }

    function moveDown(index: number) {
        if (index === selectedMembers.length - 1) return;
        const newOrder = [...selectedMembers];
        [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
        setSelectedMembers(newOrder);
    }

    async function handleSave() {
        if (selectedMembers.length === 0) {
            Alert.alert('Errore', 'Seleziona almeno un membro per la rotazione');
            return;
        }

        setSaving(true);
        try {
            await api.put(`/task-types/${taskTypeId}/rotation`, {
                userIds: selectedMembers,
            });

            Alert.alert('Successo', 'Rotazione impostata!', [
                {
                    text: 'OK',
                    onPress: () => navigation.goBack(),
                },
            ]);
        } catch (error: any) {
            console.error('Error saving rotation:', error);
            Alert.alert('Errore', error.response?.data?.error || 'Impossibile salvare la rotazione');
        } finally {
            setSaving(false);
        }
    }

    const renderMember = ({ item }: { item: Member }) => {
        const isSelected = selectedMembers.includes(item.user.id);
        const selectedIndex = selectedMembers.indexOf(item.user.id);

        return (
            <TouchableOpacity
                style={[
                    styles.memberCard,
                    { backgroundColor: theme.colors.surface },
                    theme.shadows.sm,
                    isSelected && {
                        borderWidth: 2,
                        borderColor: theme.colors.primary,
                        backgroundColor: theme.colors.primary + '10',
                    },
                ]}
                onPress={() => toggleMember(item.user.id)}
            >
                <View style={styles.memberInfo}>
                    <View
                        style={[
                            styles.avatar,
                            {
                                backgroundColor: isSelected
                                    ? theme.colors.primary
                                    : theme.colors.textSecondary + '30',
                            },
                        ]}
                    >
                        <Text
                            style={[
                                styles.avatarText,
                                { color: isSelected ? '#FFFFFF' : theme.colors.textSecondary },
                            ]}
                        >
                            {item.user.name.charAt(0).toUpperCase()}
                        </Text>
                    </View>
                    <View style={styles.memberDetails}>
                        <Text style={[styles.memberName, { color: theme.colors.text }]}>
                            {item.user.name}
                        </Text>
                        <Text style={[styles.memberEmail, { color: theme.colors.textSecondary }]}>
                            {item.user.email}
                        </Text>
                    </View>
                </View>

                {isSelected && (
                    <View style={styles.orderBadge}>
                        <Text style={[styles.orderText, { color: theme.colors.primary }]}>
                            #{selectedIndex + 1}
                        </Text>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    const renderSelectedMember = ({ item, index }: { item: string; index: number }) => {
        const member = members.find((m) => m.user.id === item);
        if (!member) return null;

        return (
            <View
                style={[
                    styles.selectedCard,
                    { backgroundColor: theme.colors.surface },
                    theme.shadows.sm,
                ]}
            >
                <View style={styles.orderNumber}>
                    <Text style={[styles.orderNumberText, { color: theme.colors.primary }]}>
                        {index + 1}
                    </Text>
                </View>

                <View style={styles.selectedInfo}>
                    <Text style={[styles.selectedName, { color: theme.colors.text }]}>
                        {member.user.name}
                    </Text>
                </View>

                <View style={styles.controls}>
                    <TouchableOpacity
                        style={[
                            styles.controlButton,
                            { backgroundColor: theme.colors.background },
                        ]}
                        onPress={() => moveUp(index)}
                        disabled={index === 0}
                    >
                        <Ionicons
                            name="arrow-up"
                            size={20}
                            color={index === 0 ? theme.colors.textSecondary : theme.colors.text}
                        />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.controlButton,
                            { backgroundColor: theme.colors.background },
                        ]}
                        onPress={() => moveDown(index)}
                        disabled={index === selectedMembers.length - 1}
                    >
                        <Ionicons
                            name="arrow-down"
                            size={20}
                            color={
                                index === selectedMembers.length - 1
                                    ? theme.colors.textSecondary
                                    : theme.colors.text
                            }
                        />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.controlButton,
                            { backgroundColor: theme.colors.error + '20' },
                        ]}
                        onPress={() => toggleMember(item)}
                    >
                        <Ionicons name="close" size={20} color={theme.colors.error} />
                    </TouchableOpacity>
                </View>
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

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
                        Imposta Rotazione
                    </Text>
                    <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
                        {taskTypeName}
                    </Text>
                </View>
                <View style={{ width: 24 }} />
            </View>

            {/* Istruzioni */}
            <View style={[styles.instructions, { backgroundColor: theme.colors.primary + '10' }]}>
                <Ionicons name="information-circle" size={20} color={theme.colors.primary} />
                <Text style={[styles.instructionsText, { color: theme.colors.primary }]}>
                    Seleziona i membri e imposta l'ordine di rotazione
                </Text>
            </View>

            {/* Rotazione corrente */}
            {selectedMembers.length > 0 && (
                <View style={styles.rotationSection}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                        Ordine Rotazione ({selectedMembers.length})
                    </Text>
                    <FlatList
                        data={selectedMembers}
                        renderItem={renderSelectedMember}
                        keyExtractor={(item) => item}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.rotationList}
                    />
                </View>
            )}

            {/* Lista membri */}
            <View style={styles.membersSection}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                    Membri Casa
                </Text>
                <FlatList
                    data={members}
                    renderItem={renderMember}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.membersList}
                    showsVerticalScrollIndicator={false}
                />
            </View>

            {/* Bottone Salva */}
            <TouchableOpacity
                style={[
                    styles.saveButton,
                    { backgroundColor: theme.colors.primary },
                    theme.shadows.md,
                    saving && { opacity: 0.6 },
                ]}
                onPress={handleSave}
                disabled={saving || selectedMembers.length === 0}
            >
                {saving ? (
                    <ActivityIndicator color="#FFFFFF" />
                ) : (
                    <>
                        <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
                        <Text style={styles.saveButtonText}>Salva Rotazione</Text>
                    </>
                )}
            </TouchableOpacity>
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
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    headerTitleContainer: {
        flex: 1,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    headerSubtitle: {
        fontSize: 14,
        marginTop: 2,
    },
    instructions: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 16,
        marginBottom: 16,
        padding: 12,
        borderRadius: 12,
        gap: 8,
    },
    instructionsText: {
        flex: 1,
        fontSize: 14,
        fontWeight: '500',
    },
    rotationSection: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginHorizontal: 16,
        marginBottom: 12,
    },
    rotationList: {
        paddingHorizontal: 16,
        gap: 12,
    },
    selectedCard: {
        width: 160,
        padding: 12,
        borderRadius: 12,
        gap: 8,
    },
    orderNumber: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#6366F1',
        justifyContent: 'center',
        alignItems: 'center',
    },
    orderNumberText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    selectedInfo: {
        flex: 1,
    },
    selectedName: {
        fontSize: 14,
        fontWeight: '600',
    },
    controls: {
        flexDirection: 'row',
        gap: 6,
    },
    controlButton: {
        width: 32,
        height: 32,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    membersSection: {
        flex: 1,
    },
    membersList: {
        paddingHorizontal: 16,
        paddingBottom: 100,
    },
    memberCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
    memberInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 20,
        fontWeight: '600',
    },
    memberDetails: {
        flex: 1,
        marginLeft: 12,
    },
    memberName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    memberEmail: {
        fontSize: 14,
    },
    orderBadge: {
        backgroundColor: '#6366F1',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    orderText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    saveButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        height: 56,
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 12,
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});