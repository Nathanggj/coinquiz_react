import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { AuthStackParamList } from '../navigation/AuthNavigator';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const theme = useTheme();

    async function handleLogin() {
        if (!email || !password) {
            Alert.alert('Errore', 'Inserisci email e password');
            return;
        }

        setLoading(true);
        try {
            await login(email, password);
        } catch (error: any) {
            Alert.alert('Errore', error.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.keyboardView}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary }]}>
                            <Ionicons name="home" size={40} color="#FFFFFF" />
                        </View>
                        <Text style={[styles.title, { color: theme.colors.text }]}>Bentornato!</Text>
                        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                            Accedi per gestire i turni di casa
                        </Text>
                    </View>

                    {/* Form */}
                    <View style={styles.form}>
                        {/* Email Input */}
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.colors.text }]}>Email</Text>
                            <View
                                style={[
                                    styles.inputContainer,
                                    { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
                                    theme.shadows.sm,
                                ]}
                            >
                                <Ionicons name="mail-outline" size={20} color={theme.colors.textSecondary} />
                                <TextInput
                                    style={[styles.input, { color: theme.colors.text }]}
                                    placeholder="tuaemail@esempio.com"
                                    placeholderTextColor={theme.colors.textSecondary}
                                    value={email}
                                    onChangeText={setEmail}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                    autoComplete="email"
                                />
                            </View>
                        </View>

                        {/* Password Input */}
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.colors.text }]}>Password</Text>
                            <View
                                style={[
                                    styles.inputContainer,
                                    { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
                                    theme.shadows.sm,
                                ]}
                            >
                                <Ionicons name="lock-closed-outline" size={20} color={theme.colors.textSecondary} />
                                <TextInput
                                    style={[styles.input, { color: theme.colors.text }]}
                                    placeholder="••••••••"
                                    placeholderTextColor={theme.colors.textSecondary}
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                    autoComplete="password"
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                    <Ionicons
                                        name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                                        size={20}
                                        color={theme.colors.textSecondary}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Login Button */}
                        <TouchableOpacity
                            style={[styles.button, { backgroundColor: theme.colors.primary }, theme.shadows.md]}
                            onPress={handleLogin}
                            disabled={loading}
                            activeOpacity={0.8}
                        >
                            {loading ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <Text style={styles.buttonText}>Accedi</Text>
                            )}
                        </TouchableOpacity>

                        {/* Divider */}
                        <View style={styles.divider}>
                            <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
                            <Text style={[styles.dividerText, { color: theme.colors.textSecondary }]}>oppure</Text>
                            <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
                        </View>

                        {/* Register Link */}
                        <TouchableOpacity
                            style={[
                                styles.secondaryButton,
                                { borderColor: theme.colors.border, backgroundColor: theme.colors.surface },
                            ]}
                            onPress={() => navigation.navigate('Register')}
                            activeOpacity={0.8}
                        >
                            <Text style={[styles.secondaryButtonText, { color: theme.colors.primary }]}>
                                Crea un account
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingTop: 40,
        paddingBottom: 24,
    },
    header: {
        alignItems: 'center',
        marginBottom: 48,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
    },
    form: {
        flex: 1,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 56,
    },
    input: {
        flex: 1,
        fontSize: 16,
        marginLeft: 12,
    },
    button: {
        height: 56,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 32,
    },
    dividerLine: {
        flex: 1,
        height: 1,
    },
    dividerText: {
        marginHorizontal: 16,
        fontSize: 14,
    },
    secondaryButton: {
        height: 56,
        borderRadius: 12,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    secondaryButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});