/** LoginScreen — email/password sign-in against the existing FastAPI auth. */
import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenContainer from '../components/ScreenContainer';
import { Button } from '../components/ui';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { login } from '../services/authService';
import { API_BASE_URL } from '../constants/api';

export default function LoginScreen() {
    const { theme, toggleTheme } = useTheme();
    const { signIn } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async () => {
        const trimmedEmail = email.trim();
        if (!trimmedEmail || !password) {
            setError('Please enter your email and password.');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const { user } = await login(trimmedEmail, password);
            signIn(user);
        } catch (err) {
            setError(err?.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScreenContainer scroll={false} padded={false}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.flex}
            >
                <View style={styles.topBar}>
                    <TouchableOpacity
                        onPress={toggleTheme}
                        style={[styles.iconButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
                        activeOpacity={0.7}
                        accessibilityLabel="Toggle Theme / Settings"
                    >
                        <Ionicons
                            name={theme.mode === 'dark' ? 'sunny-outline' : 'moon-outline'}
                            size={20}
                            color={theme.text}
                        />
                    </TouchableOpacity>
                </View>

                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.header}>
                        <View style={[styles.logoContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                            <Text style={styles.logo}>🛣️</Text>
                        </View>
                        <Text style={[styles.title, { color: theme.text }]}>RoadSense AI</Text>
                        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                            Smart road damage inspection & reporting
                        </Text>
                    </View>

                    <View style={styles.form}>
                        <Text style={[styles.label, { color: theme.text }]}>Email Address</Text>
                        <TextInput
                            style={[
                                styles.input,
                                {
                                    backgroundColor: theme.inputBg,
                                    borderColor: theme.inputBorder || theme.border,
                                    color: theme.text,
                                },
                            ]}
                            placeholder="you@example.com"
                            placeholderTextColor={theme.placeholder || theme.textMuted}
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            autoCorrect={false}
                            keyboardType="email-address"
                            autoComplete="email"
                            cursorColor={theme.primary}
                            selectionColor={theme.primary}
                        />

                        <Text style={[styles.label, { color: theme.text }]}>Password</Text>
                        <TextInput
                            style={[
                                styles.input,
                                {
                                    backgroundColor: theme.inputBg,
                                    borderColor: theme.inputBorder || theme.border,
                                    color: theme.text,
                                },
                            ]}
                            placeholder="••••••••"
                            placeholderTextColor={theme.placeholder || theme.textMuted}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            autoCapitalize="none"
                            autoCorrect={false}
                            cursorColor={theme.primary}
                            selectionColor={theme.primary}
                        />

                        {error ? (
                            <View style={[styles.errorContainer, { backgroundColor: `${theme.danger}15`, borderColor: theme.danger }]}>
                                <Ionicons name="alert-circle-outline" size={18} color={theme.danger} style={styles.errorIcon} />
                                <Text style={[styles.error, { color: theme.danger }]}>{error}</Text>
                            </View>
                        ) : null}

                        <Button
                            title="Sign In"
                            onPress={handleLogin}
                            loading={loading}
                            style={styles.submit}
                        />

                        <View style={styles.serverInfo}>
                            <Ionicons name="server-outline" size={13} color={theme.textMuted} style={{ marginRight: 5 }} />
                            <Text style={[styles.serverText, { color: theme.textMuted }]} numberOfLines={1}>
                                {API_BASE_URL}
                            </Text>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1 },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 4,
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingBottom: 40,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    logoContainer: {
        width: 80,
        height: 80,
        borderRadius: 24,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    logo: { fontSize: 44 },
    title: { fontSize: 28, fontWeight: '800', letterSpacing: 0.4 },
    subtitle: {
        marginTop: 6,
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
        paddingHorizontal: 12,
    },
    form: { width: '100%' },
    label: {
        fontSize: 13.5,
        fontWeight: '700',
        marginBottom: 8,
        letterSpacing: 0.2,
    },
    input: {
        borderWidth: 1.5,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 15,
        marginBottom: 18,
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginBottom: 16,
    },
    errorIcon: { marginRight: 8 },
    error: {
        fontSize: 13,
        fontWeight: '600',
        flex: 1,
    },
    submit: {
        marginTop: 8,
        borderRadius: 12,
    },
    serverInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
    },
    serverText: {
        fontSize: 11,
        letterSpacing: 0.2,
    },
});