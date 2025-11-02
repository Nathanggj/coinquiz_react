import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { ThemeProvider } from './src/contexts/ThemeContext';
import AuthNavigator from './src/navigation/AuthNavigator';
import MainNavigator from './src/navigation/MainNavigator';

const Stack = createNativeStackNavigator();

function AppNavigator() {
    const { token, loading } = useAuth();

    if (loading) {
        return null;
    }

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {!token ? (
                <Stack.Screen name="Auth" component={AuthNavigator} />
            ) : (
                <Stack.Screen name="Main" component={MainNavigator} />
            )}
        </Stack.Navigator>
    );
}

export default function App() {
    return (
        <SafeAreaProvider>
            <ThemeProvider>
                <AuthProvider>
                    <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
                    <NavigationContainer>
                        <AppNavigator />
                    </NavigationContainer>
                </AuthProvider>
            </ThemeProvider>
        </SafeAreaProvider>
    );
}