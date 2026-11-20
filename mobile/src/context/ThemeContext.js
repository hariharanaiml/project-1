/**
 * ThemeContext — dark / light / system theme with AsyncStorage persistence.
 */
import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightTheme, darkTheme } from '../theme';
import { STORAGE_KEYS } from '../constants';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
    const systemScheme = useColorScheme();
    const [preference, setPreference] = useState('system'); // 'light' | 'dark' | 'system'
    const [ready, setReady] = useState(false);

    useEffect(() => {
        let mounted = true;
        AsyncStorage.getItem(STORAGE_KEYS.themePreference)
            .then((stored) => {
                if (mounted && stored) setPreference(stored);
            })
            .catch(() => { })
            .finally(() => {
                if (mounted) setReady(true);
            });
        return () => {
            mounted = false;
        };
    }, []);

    const setThemePreference = useCallback(async (value) => {
        setPreference(value);
        try {
            await AsyncStorage.setItem(STORAGE_KEYS.themePreference, value);
        } catch (_) {
            /* non-fatal */
        }
    }, []);

    const theme = useMemo(() => {
        const scheme = preference === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : preference;
        return scheme === 'dark' ? darkTheme : lightTheme;
    }, [preference, systemScheme]);

    const toggleTheme = useCallback(() => {
        const next = theme.mode === 'dark' ? 'light' : 'dark';
        setThemePreference(next);
    }, [theme.mode, setThemePreference]);

    const value = useMemo(
        () => ({ theme, preference, ready, setThemePreference, toggleTheme }),
        [theme, preference, ready, setThemePreference, toggleTheme],
    );

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
    return ctx;
}