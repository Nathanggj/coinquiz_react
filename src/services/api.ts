import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Modifica questo URL con l'indirizzo IP del tuo backend
const API_URL = 'http://192.168.1.24:3000/api';

export const api = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor per aggiungere automaticamente il token e logging
api.interceptors.request.use(
    async (config) => {
        console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`);

        // Recupera il token da AsyncStorage prima di ogni richiesta
        try {
            const token = await AsyncStorage.getItem('@token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
                console.log('🔑 Token aggiunto all\'header');
            } else {
                console.log('⚠️ Nessun token trovato');
            }
        } catch (error) {
            console.error('❌ Errore nel recupero del token:', error);
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url}`);
        return response;
    },
    (error) => {
        console.log(`❌ ${error.config?.method?.toUpperCase()} ${error.config?.url}`);
        if (error.response) {
            console.log('Error status:', error.response.status);
            console.log('Error data:', error.response.data);
        }
        return Promise.reject(error);
    }
);

export default api;
