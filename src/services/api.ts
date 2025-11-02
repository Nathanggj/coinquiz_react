import axios from 'axios';

// Modifica questo URL con l'indirizzo IP del tuo backend
const API_URL = 'http://192.168.1.24:3000/api';

export const api = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor per logging (solo in development)
api.interceptors.request.use(
    (config) => {
        console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`);
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
        return Promise.reject(error);
    }
);

export default api;