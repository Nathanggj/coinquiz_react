import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../services/api';

interface User {
    id: string;
    email: string;
    name: string;
    avatarUrl?: string;
}

interface AuthContextData {
    token: string | null;
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, name: string) => Promise<void>;
    logout: () => Promise<void>;
    updateProfile: (name: string, avatarUrl?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStoredData();
    }, []);

    async function loadStoredData() {
        try {
            const storedToken = await AsyncStorage.getItem('@token');
            const storedUser = await AsyncStorage.getItem('@user');

            if (storedToken && storedUser) {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
                api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
            }
        } catch (error) {
            console.error('Error loading stored data:', error);
        } finally {
            setLoading(false);
        }
    }

    // In AuthContext.tsx - funzione login
    async function login(email: string, password: string) {
        try {
            const response = await api.post('/auth/login', { email, password });
            const { token: newToken, user: userData } = response.data;

            setToken(newToken);
            setUser(userData);

            // IMPORTANTE: Salva in AsyncStorage
            await AsyncStorage.setItem('@token', newToken);
            await AsyncStorage.setItem('@user', JSON.stringify(userData));

            // CRITICO: Imposta l'header per tutte le future richieste
            api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

            console.log('✅ Login successful, token set'); // Per debug
        } catch (error: any) {
            console.error('❌ Login error:', error);
            throw new Error(error.response?.data?.error || 'Errore durante il login');
        }
    }

    async function register(email: string, password: string, name: string) {
        try {
            const response = await api.post('/auth/register', { email, password, name });
            const { token: newToken, user: userData } = response.data;

            setToken(newToken);
            setUser(userData);

            await AsyncStorage.setItem('@token', newToken);
            await AsyncStorage.setItem('@user', JSON.stringify(userData));

            api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        } catch (error: any) {
            throw new Error(error.response?.data?.error || 'Errore durante la registrazione');
        }
    }

    async function logout() {
        setToken(null);
        setUser(null);

        await AsyncStorage.removeItem('@token');
        await AsyncStorage.removeItem('@user');

        delete api.defaults.headers.common['Authorization'];
    }

    async function updateProfile(name: string, avatarUrl?: string) {
        try {
            const response = await api.put('/auth/profile', { name, avatarUrl });
            const updatedUser = response.data;

            setUser(updatedUser);
            await AsyncStorage.setItem('@user', JSON.stringify(updatedUser));
        } catch (error: any) {
            throw new Error(error.response?.data?.error || 'Errore durante l\'aggiornamento del profilo');
        }
    }

    return (
        <AuthContext.Provider
            value={{
                token,
                user,
                loading,
                login,
                register,
                logout,
                updateProfile,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}