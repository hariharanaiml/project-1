/**
 * RootNavigator — splash while bootstrapping, then either the
 * authentication stack or the main tab navigator.
 */
import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import AuthStack from './AuthStack';
import MainTabNavigator from './MainTabNavigator';

export default function RootNavigator() {
    const { theme } = useTheme();
    const { user, bootstrapping } = useAuth();

    if (bootstrapping) {
        return (
            <View style={[styles.splash, { backgroundColor: theme.background }]}>
                <Text style={styles.logo}>🛣️</Text>
                <Text style={[styles.title, { color: theme.text }]}>RoadSense AI</Text>
                <ActivityIndicator style={{ marginTop: 18 }} color={theme.primary} />
            </View>
        );
    }

    const baseTheme = theme.mode === 'dark' ? DarkTheme : DefaultTheme;
    const navigationTheme = {
        ...baseTheme,
        dark: theme.mode === 'dark',
        colors: {
            ...baseTheme.colors,
            primary: theme.primary,
            background: theme.background,
            card: theme.surface,
            text: theme.text,
            border: theme.border,
            notification: theme.primary,
        },
    };

    return (
        <NavigationContainer theme={navigationTheme}>
            {user ? <MainTabNavigator /> : <AuthStack />}
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
    splash: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    logo: { fontSize: 56 },
    title: { marginTop: 12, fontSize: 24, fontWeight: '800', letterSpacing: 0.5 },
});