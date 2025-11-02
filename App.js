import React, { useState, useEffect } from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import {
    View, Text, TextInput, TouchableOpacity, FlatList, Modal, StyleSheet, Alert,
} from 'react-native';

const API_URL = 'http://192.168.x.x:3000'; // Cambia con IP backend

export default function App() {
    const [token, setToken] = useState(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [shifts, setShifts] = useState([]);
    const [selectedDate, setSelectedDate] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [username, setUsername] = useState('');
    const [selectedShift, setSelectedShift] = useState(null);
    const [householdId, setHouseholdId] = useState(null);

    // Dopo login, recupera shifts
    useEffect(() => {
        if (token && householdId) {
            fetchShifts();
        }
    }, [token, householdId]);

    async function login() {
        try {
            const res = await fetch(`${API_URL}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            if (res.ok) {
                const data = await res.json();
                setToken(data.token);
                setHouseholdId(data.householdId); // supponendo restituisca anche casa
                Alert.alert('Login riuscito!');
            } else {
                Alert.alert('Errore login');
            }
        } catch (err) {
            Alert.alert('Errore rete');
        }
    }

    async function fetchShifts() {
        try {
            const res = await fetch(`${API_URL}/api/households/${householdId}/shifts`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            setShifts(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error(error);
            setShifts([]);
        }
    }

    function onDayPress(day) {
        setSelectedDate(day.dateString);
    }

    function shiftsForSelectedDate() {
        return shifts.filter(shift => shift.scheduledDate.startsWith(selectedDate));
    }

    async function bookShift(shiftId) {
        if (!username) {
            Alert.alert('Inserisci il tuo nome');
            return;
        }
        try {
            const res = await fetch(`${API_URL}/api/shifts/${shiftId}/reassign`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ userId: username }),
            });

            if (res.ok) {
                Alert.alert('Turno prenotato!');
                setModalVisible(false);
                fetchShifts();
            } else {
                Alert.alert('Errore nella prenotazione');
            }
        } catch (err) {
            Alert.alert('Errore di rete');
        }
    }

    if (!token) {
        // Schermata login
        return (
            <SafeAreaProvider>
                <SafeAreaView style={styles.container}>
                    <Text style={styles.title}>Login</Text>
                    <TextInput
                        placeholder="Email"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        style={styles.input}
                    />
                    <TextInput
                        placeholder="Password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        style={styles.input}
                    />
                    <TouchableOpacity onPress={login} style={styles.button}>
                        <Text style={styles.buttonText}>Accedi</Text>
                    </TouchableOpacity>
                </SafeAreaView>
            </SafeAreaProvider>
        );
    }

    // UI principali con calendario e turni
    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.container}>
                <Text style={styles.title}>Gestione Turni Coinquilini</Text>
                <Text style={styles.subtitle}>Seleziona una data e visualizza i turni</Text>

                <Text>Utente: {username || 'Non definito'}</Text>
                <TextInput
                    placeholder="Inserisci il tuo nome per prenotare"
                    value={username}
                    onChangeText={setUsername}
                    style={styles.input}
                />

                {/* Inserisci qui il calendario o la lista di date */}
                {/* Per semplicità mostro solo la lista delle date */}
                <FlatList
                    data={shiftsForSelectedDate()}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => (
                        <View style={styles.shiftItem}>
                            <Text style={styles.shiftText}>{item.taskType}</Text>
                            <Text>Assegnato a: {item.assignedUser || 'Disponibile'}</Text>
                            <TouchableOpacity
                                onPress={() => {
                                    setSelectedShift(item);
                                    setModalVisible(true);
                                }}
                            >
                                <Text style={styles.bookBtn}>Prenota</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                    ListEmptyComponent={<Text>Nessun turno in questa data.</Text>}
                />

                <Modal visible={modalVisible} transparent animationType="slide">
                    <View style={styles.modalView}>
                        <Text style={styles.modalTitle}>Prenota turno</Text>
                        <Text>Turno: {selectedShift?.taskType}</Text>
                        <TouchableOpacity
                            style={styles.confirmBtn}
                            onPress={() => bookShift(selectedShift.id)}
                        >
                            <Text style={{ color: 'white' }}>Conferma</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setModalVisible(false)}
                            style={{ marginTop: 10 }}
                        >
                            <Text>Chiudi</Text>
                        </TouchableOpacity>
                    </View>
                </Modal>
            </SafeAreaView>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    subtitle: { fontSize: 16, marginBottom: 10, textAlign: 'center' },
    input: {
        backgroundColor: 'white',
        padding: 10,
        marginBottom: 15,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ccc',
    },
    button: {
        backgroundColor: '#007bff',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 20,
    },
    buttonText: { color: 'white', fontWeight: 'bold' },
    shiftItem: {
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
    },
    shiftText: { fontWeight: 'bold', marginBottom: 5 },
    bookBtn: { color: 'blue', marginTop: 5 },
    modalView: {
        margin: 30,
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        top: '25%',
    },
    modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
    confirmBtn: {
        backgroundColor: 'blue',
        paddingVertical: 10,
        paddingHorizontal: 25,
        borderRadius: 8,
    },
});
