import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../contexts/ThemeContext';
import api from '../services/api';

type Props = NativeStackScreenProps<any, 'CreateTaskType'>;

const FREQUENCIES = [
    { value: 'DAILY', label: 'Giornaliero' },
    { value: 'WEEKLY', label: 'Settimanale' },
    { value: 'BIWEEKLY', label: 'Bisettimanale' },
    { value: 'MONTHLY', label: 'Mensile' },
    { value: 'CUSTOM', label: 'Personalizzato' },
];

const ICONS = [
    'trash', 'restaurant', 'water', 'leaf', 'bed', 'cart',
    'flash', 'shirt', 'home', 'car', 'paw', 'brush'
];

const COLORS = [
    '#EF4444', '#F59E0B', '#10B981', '#3B82F6',
    '#6366F1', '#8B5CF6', '#EC4899', '#14B8A6'
];

export default function CreateTaskTypeScreen({ navigation, route }: Props) {
    const { householdId } = route.params;
    const theme = useTheme();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [frequency, setFrequency] = useState('WEEKLY');
    const [frequencyDays, setFrequencyDays] = useState('');
    const [estimatedDuration, setEstimatedDuration] = useState('');
    const [selectedIcon, setSelectedIcon] = useState('trash');
    const [selectedColor, setSelectedColor] = useState('#6366F1');
    const [loading, setLoading] = useState(false);

    async function handleCreate() {
        if (!name.trim()) {
            Alert.alert('Errore', 'Inserisci un nome per il compito');
            return;
        }

        if (frequency === 'CUSTOM' && !frequencyDays) {
            Alert.alert('Errore', 'Inserisci il numero di giorni per la frequenza personalizzata');
            return;
        }

        setLoading(true);
        try {
            await api.post(`/households/${householdId}/task-types`, {
                name: name.trim(),
                description: description.trim(),
                frequency,
                frequencyDays: frequency === 'CUSTOM' ? parseInt(frequencyDays) : null,
                estimatedDuration: estimatedDuration ? parseInt(estimatedDuration) : null,
                icon: selectedIcon,
                color: selectedColor,
            });

            Alert.alert('Successo', 'Tipo di compito creato!', [
                {
                    text: 'OK',
                    onPress: () => navigation.goBack(),
                },
            ]);
        } catch (error: any) {
            console.error('Error creating task type:', error);
            Alert.alert('Errore', error.response?.data?.error || 'Impossibile creare il compito');
        } finally {
            setLoading(false);
        }
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
                    Nuovo Tipo Compito
                </Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Nome */}
                <View style={styles.section}>
                    <Text style={[styles.label, { color: theme.colors.text }]}>Nome *</Text>
                    <TextInput
                        style={[
                            styles.input,
                            {
                                backgroundColor: theme.colors.surface,
                                color: theme.colors.text,
                                borderColor: theme.colors.border,
                            },
                        ]}
                        placeholder="Es. Portare fuori la spazzatura"
                        placeholderTextColor={theme.colors.textSecondary}
                        value={name}
                        onChangeText={setName}
                    />
                </View>

                {/* Descrizione */}
                <View style={styles.section}>
                    <Text style={[styles.label, { color: theme.colors.text }]}>Descrizione</Text>
                    <TextInput
                        style={[
                            styles.input,
                            styles.textArea,
                            {
                                backgroundColor: theme.colors.surface,
                                color: theme.colors.text,
                                borderColor: theme.colors.border,
                            },
                        ]}
                        placeholder="Dettagli aggiuntivi..."
                        placeholderTextColor={theme.colors.textSecondary}
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        numberOfLines={3}
                    />
                </View>

                {/* Frequenza */}
                <View style={styles.section}>
                    <Text style={[styles.label, { color: theme.colors.text }]}>Frequenza *</Text>
                    <View style={styles.frequencyGrid}>
                        {FREQUENCIES.map((freq) => (
                            <TouchableOpacity
                                key={freq.value}
                                style={[
                                    styles.frequencyButton,
                                    {
                                        backgroundColor: theme.colors.surface,
                                        borderColor:
                                            frequency === freq.value
                                                ? theme.colors.primary
                                                : theme.colors.border,
                                    },
                                    frequency === freq.value && {
                                        backgroundColor: theme.colors.primary + '20',
                                        borderWidth: 2,
                                    },
                                ]}
                                onPress={() => setFrequency(freq.value)}
                            >
                                <Text
                                    style={[
                                        styles.frequencyText,
                                        {
                                            color:
                                                frequency === freq.value
                                                    ? theme.colors.primary
                                                    : theme.colors.text,
                                        },
                                    ]}
                                >
                                    {freq.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Giorni personalizzati */}
                {frequency === 'CUSTOM' && (
                    <View style={styles.section}>
                        <Text style={[styles.label, { color: theme.colors.text }]}>
                            Ogni quanti giorni? *
                        </Text>
                        <TextInput
                            style={[
                                styles.input,
                                {
                                    backgroundColor: theme.colors.surface,
                                    color: theme.colors.text,
                                    borderColor: theme.colors.border,
                                },
                            ]}
                            placeholder="Es. 3"
                            placeholderTextColor={theme.colors.textSecondary}
                            value={frequencyDays}
                            onChangeText={setFrequencyDays}
                            keyboardType="number-pad"
                        />
                    </View>
                )}

                {/* Durata stimata */}
                <View style={styles.section}>
                    <Text style={[styles.label, { color: theme.colors.text }]}>
                        Durata stimata (minuti)
                    </Text>
                    <TextInput
                        style={[
                            styles.input,
                            {
                                backgroundColor: theme.colors.surface,
                                color: theme.colors.text,
                                borderColor: theme.colors.border,
                            },
                        ]}
                        placeholder="Es. 15"
                        placeholderTextColor={theme.colors.textSecondary}
                        value={estimatedDuration}
                        onChangeText={setEstimatedDuration}
                        keyboardType="number-pad"
                    />
                </View>

                {/* Icona */}
                <View style={styles.section}>
                    <Text style={[styles.label, { color: theme.colors.text }]}>Icona</Text>
                    <View style={styles.iconGrid}>
                        {ICONS.map((icon) => (
                            <TouchableOpacity
                                key={icon}
                                style={[
                                    styles.iconButton,
                                    {
                                        backgroundColor: theme.colors.surface,
                                        borderColor:
                                            selectedIcon === icon ? selectedColor : theme.colors.border,
                                    },
                                    selectedIcon === icon && { borderWidth: 2 },
                                ]}
                                onPress={() => setSelectedIcon(icon)}
                            >
                                <Ionicons
                                    name={icon as any}
                                    size={24}
                                    color={selectedIcon === icon ? selectedColor : theme.colors.textSecondary}
                                />
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Colore */}
                <View style={styles.section}>
                    <Text style={[styles.label, { color: theme.colors.text }]}>Colore</Text>
                    <View style={styles.colorGrid}>
                        {COLORS.map((color) => (
                            <TouchableOpacity
                                key={color}
                                style={[
                                    styles.colorButton,
                                    { backgroundColor: color },
                                    selectedColor === color && styles.selectedColor,
                                ]}
                                onPress={() => setSelectedColor(color)}
                            >
                                {selectedColor === color && (
                                    <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Preview */}
                <View style={styles.section}>
                    <Text style={[styles.label, { color: theme.colors.text }]}>Anteprima</Text>
                    <View
                        style={[
                            styles.preview,
                            { backgroundColor: theme.colors.surface },
                            theme.shadows.sm,
                        ]}
                    >
                        <View style={[styles.previewIcon, { backgroundColor: selectedColor + '20' }]}>
                            <Ionicons name={selectedIcon as any} size={28} color={selectedColor} />
                        </View>
                        <View style={styles.previewInfo}>
                            <Text style={[styles.previewName, { color: theme.colors.text }]}>
                                {name || 'Nome compito'}
                            </Text>
                            <Text style={[styles.previewFrequency, { color: theme.colors.textSecondary }]}>
                                {FREQUENCIES.find((f) => f.value === frequency)?.label}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Bottone Crea */}
                <TouchableOpacity
                    style={[
                        styles.createButton,
                        { backgroundColor: theme.colors.primary },
                        theme.shadows.md,
                    ]}
                    onPress={handleCreate}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <Text style={styles.createButtonText}>Crea Tipo Compito</Text>
                    )}
                </TouchableOpacity>

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
    },
    section: {
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
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    frequencyGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    frequencyButton: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 1,
    },
    frequencyText: {
        fontSize: 14,
        fontWeight: '500',
    },
    iconGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    iconButton: {
        width: 56,
        height: 56,
        borderRadius: 12,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    colorGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    colorButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectedColor: {
        borderWidth: 3,
        borderColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    preview: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
    },
    previewIcon: {
        width: 56,
        height: 56,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    previewInfo: {
        flex: 1,
        marginLeft: 12,
    },
    previewName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    previewFrequency: {
        fontSize: 14,
    },
    createButton: {
        height: 56,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
    },
    createButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});