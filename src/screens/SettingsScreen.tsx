import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
    TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import Modal from 'react-native-modal';

export default function SettingsScreen() {
    const [households, setHouseholds] = useState<any[]>([]);
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [joinModalVisible, setJoinModalVisible] = useState(false);
    const [householdName, setHouseholdName] = useState('');
    const [inviteCode, setInviteCode] = useState('');

    const theme = useTheme();
    const { user, logout } = useAuth();

    useEffect(() => {
        loadHouseholds();
    }, []);

    async function loadHouseholds() {
        try {
            const response = await api.get('/households');
            setHouseholds(response.data);
        } catch (error) {
            console.error('Error loading households:', error);
        }
    }

    async function handleCreateHousehold() {
        if (!householdName.trim()) {
            Alert.alert('Errore', 'Inserisci un nome per la casa');
            return;
        }

        try {
            await api.post('/households', { name: householdName });
            setCreateModalVisible(false);
            setHouseholdName('');
            await loadHouseholds();
            Alert.alert('Successo', 'Casa creata con successo!');
        } catch (error) {
            Alert.alert('Errore', 'Impossibile creare la casa');
        }
    }

    async function handleJoinHousehold() {
        if (!inviteCode.trim()) {
            Alert.alert('Errore', 'Inserisci un codice invito');
            return;
        }

        try {
            await api.post('/households/join', { inviteCode: inviteCode.toUpperCase() });
            setJoinModalVisible(false);
            setInviteCode('');
            await loadHouseholds();
            Alert.alert('Successo', 'Sei entrato nella casa!');
        } catch (error: any) {
            Alert.alert('Errore', error.response?.data?.error || 'Codice invito non valido');
        }
    }

    async function handleLogout() {
        Alert.alert(
            'Logout',
            'Sei sicuro di voler uscire?',
            [
                { text: 'Annulla', style: 'cancel' },
                {
                    text: 'Esci',
                    style: 'destructive',
                    onPress: async () => {
                        await logout();
                    },
                },
            ]
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Impostazioni</Text>
                </View>

                {/* Profile Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Profilo</Text>
                    <View style={[styles.card, { backgroundColor: theme.colors.surface }, theme.shadows.sm]}>
                        <View style={styles.profileHeader}>
                            <View style={[styles.avatar, { backgroundColor: theme.colors.primary }]}>
                                <Text style={styles.avatarText}>
                                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                                </Text>
                            </View>
                            <View style={styles.profileInfo}>
                                <Text style={[styles.profileName, { color: theme.colors.text }]}>
                                    {user?.name}
                                </Text>
                                <Text style={[styles.profileEmail, { color: theme.colors.textSecondary }]}>
                                    {user?.email}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Households Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Le Mie Case</Text>
                        <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>
                            {households.length} {households.length === 1 ? 'casa' : 'case'}
                        </Text>
                    </View>

                    {households.map((household) => (
                        <View
                            key={household.id}
                            style={[styles.card, { backgroundColor: theme.colors.surface }, theme.shadows.sm]}
                        >
                            <View style={styles.householdHeader}>
                                <View>
                                    <Text style={[styles.householdName, { color: theme.colors.text }]}>
                                        {household.name}
                                    </Text>
                                    <Text style={[styles.householdMembers, { color: theme.colors.textSecondary }]}>
                                        {household.members?.length || 0} {household.members?.length === 1 ? 'membro' : 'membri'}
                                    </Text>
                                </View>
                                <TouchableOpacity
                                    onPress={() => {
                                        Alert.alert(
                                            'Codice Invito',
                                            `Condividi questo codice per invitare altri coinquilini:\n\n${household.invite_code}`,
                                            [{ text: 'OK' }]
                                        );
                                    }}
                                >
                                    <Ionicons name="qr-code" size={24} color={theme.colors.primary} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}

                    <View style={styles.actionButtons}>
                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
                            onPress={() => setCreateModalVisible(true)}
                        >
                            <Ionicons name="add-circle" size={20} color="#FFFFFF" />
                            <Text style={styles.actionButtonText}>Crea Casa</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.actionButton,
                                { backgroundColor: theme.colors.surface, borderWidth: 2, borderColor: theme.colors.primary },
                            ]}
                            onPress={() => setJoinModalVisible(true)}
                        >
                            <Ionicons name="log-in" size={20} color={theme.colors.primary} />
                            <Text style={[styles.actionButtonText, { color: theme.colors.primary }]}>
                                Unisciti
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Settings Options */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Altro</Text>

                    <TouchableOpacity
                        style={[styles.settingItem, { backgroundColor: theme.colors.surface }, theme.shadows.sm]}
                    >
                        <Ionicons name="notifications-outline" size={24} color={theme.colors.text} />
                        <Text style={[styles.settingText, { color: theme.colors.text }]}>Notifiche</Text>
                        <Ionicons name="chevron-forward" size={24} color={theme.colors.textSecondary} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.settingItem, { backgroundColor: theme.colors.surface }, theme.shadows.sm]}
                    >
                        <Ionicons name="help-circle-outline" size={24} color={theme.colors.text} />
                        <Text style={[styles.settingText, { color: theme.colors.text }]}>Aiuto</Text>
                        <Ionicons name="chevron-forward" size={24} color={theme.colors.textSecondary} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.settingItem, { backgroundColor: theme.colors.surface }, theme.shadows.sm]}
                    >
                        <Ionicons name="information-circle-outline" size={24} color={theme.colors.text} />
                        <Text style={[styles.settingText, { color: theme.colors.text }]}>Info App</Text>
                        <Ionicons name="chevron-forward" size={24} color={theme.colors.textSecondary} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.settingItem,
                            { backgroundColor: theme.colors.error + '10', marginTop: 24 },
                            theme.shadows.sm,
                        ]}
                        onPress={handleLogout}
                    >
                        <Ionicons name="log-out-outline" size={24} color={theme.colors.error} />
                        <Text style={[styles.settingText, { color: theme.colors.error }]}>Esci</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Create Household Modal */}
            <Modal
                isVisible={createModalVisible}
                onBackdropPress={() => setCreateModalVisible(false)}
                onSwipeComplete={() => setCreateModalVisible(false)}
                swipeDirection="down"
                style={styles.modal}
            >
                <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
                    <View style={styles.modalHandle} />
                    <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Crea Nuova Casa</Text>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: theme.colors.text }]}>Nome Casa</Text>
                        <TextInput
                            style={[
                                styles.input,
                                { backgroundColor: theme.colors.background, color: theme.colors.text, borderColor: theme.colors.border },
                            ]}
                            placeholder="Es. Casa Via Roma"
                            placeholderTextColor={theme.colors.textSecondary}
                            value={householdName}
                            onChangeText={setHouseholdName}
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.primaryButton, { backgroundColor: theme.colors.primary }]}
                        onPress={handleCreateHousehold}
                    >
                        <Text style={styles.primaryButtonText}>Crea</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.secondaryButton, { borderColor: theme.colors.border }]}
                        onPress={() => setCreateModalVisible(false)}
                    >
                        <Text style={[styles.secondaryButtonText, { color: theme.colors.text }]}>Annulla</Text>
                    </TouchableOpacity>
                </View>
            </Modal>

            {/* Join Household Modal */}
            <Modal
                isVisible={joinModalVisible}
                onBackdropPress={() => setJoinModalVisible(false)}
                onSwipeComplete={() => setJoinModalVisible(false)}
                swipeDirection="down"
                style={styles.modal}
            >
                <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
                    <View style={styles.modalHandle} />
                    <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Unisciti a una Casa</Text>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: theme.colors.text }]}>Codice Invito</Text>
                        <TextInput
                            style={[
                                styles.input,
                                { backgroundColor: theme.colors.background, color: theme.colors.text, borderColor: theme.colors.border },
                            ]}
                            placeholder="Inserisci codice"
                            placeholderTextColor={theme.colors.textSecondary}
                            value={inviteCode}
                            onChangeText={(text) => setInviteCode(text.toUpperCase())}
                            autoCapitalize="characters"
                            maxLength={10}
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.primaryButton, { backgroundColor: theme.colors.primary }]}
                        onPress={handleJoinHousehold}
                    >
                        <Text style={styles.primaryButtonText}>Unisciti</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.secondaryButton, { borderColor: theme.colors.border }]}
                        onPress={() => setJoinModalVisible(false)}
                    >
                        <Text style={[styles.secondaryButtonText, { color: theme.colors.text }]}>Annulla</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
    sectionSubtitle: {
        fontSize: 14,
    },
    card: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 28,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    profileInfo: {
        marginLeft: 16,
        flex: 1,
    },
    profileName: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 4,
    },
    profileEmail: {
        fontSize: 14,
    },
    householdHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    householdName: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 4,
    },
    householdMembers: {
        fontSize: 14,
    },
    actionButtons: {
        flexDirection: 'row',
        marginTop: 16,
        gap: 12,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
    },
    actionButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
    settingText: {
        flex: 1,
        fontSize: 16,
        marginLeft: 16,
    },
    modal: {
        justifyContent: 'flex-end',
        margin: 0,
    },
    modalContent: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
    },
    modalHandle: {
        width: 40,
        height: 4,
        backgroundColor: '#E2E8F0',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 24,
    },
    inputGroup: {
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
    },
    primaryButton: {
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 12,
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    secondaryButton: {
        padding: 16,
        borderRadius: 12,
        borderWidth: 2,
        alignItems: 'center',
    },
    secondaryButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});