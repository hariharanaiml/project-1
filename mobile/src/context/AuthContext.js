/**
 * AuthContext — session state backed by SecureStore.
 * Restores the token on launch, validates via GET /auth/me,
 * and triggers offline-queue sync whenever connectivity returns.
 */
import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import NetInfo from '@react-native-community/netinfo';
import { TOKEN_KEY } from '../services/apiClient';
import { getProfile } from '../services/authService';
import { syncQueue } from '../services/offlineQueue';
import { notifySyncComplete } from '../utils/notifications';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [bootstrapping, setBootstrapping] = useState(true);
    const [isOffline, setIsOffline] = useState(false);
    const [pendingSyncCount, setPendingSyncCount] = useState(0);

    /** Restore any stored session on app start. */
    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const token = await SecureStore.getItemAsync(TOKEN_KEY);
                if (token) {
                    const profile = await getProfile();
                    if (mounted) setUser(profile);
                }
            } catch (_) {
                // Invalid/expired token — clear it so the user logs in again.
                try { await SecureStore.deleteItemAsync(TOKEN_KEY); } catch (_) { }
            } finally {
                if (mounted) setBootstrapping(false);
            }
        })();
        return () => { mounted = false; };
    }, []);

    /** Watch connectivity; auto-sync the offline queue when back online. */
    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener((state) => {
            const online = Boolean(state.isConnected && state.isInternetReachable !== false);
            setIsOffline(!online);
            if (online) {
                // Fire-and-forget: replay queued inspections through the backend.
                syncQueue()
                    .then(({ synced }) => {
                        setPendingSyncCount(0);
                        if (synced > 0) notifySyncComplete(synced);
                    })
                    .catch(() => { });
            }
        });
        return () => unsubscribe();
    }, []);

    /** Refresh pending count when the app regains focus or after actions. */
    const refreshPendingCount = useCallback(async () => {
        try {
            const { getQueue } = require('../services/offlineQueue');
            const queue = await getQueue();
            setPendingSyncCount(queue.length);
        } catch (_) {
            /* non-fatal */
        }
    }, []);

    useEffect(() => {
        refreshPendingCount();
    }, [refreshPendingCount]);

    const signIn = useCallback((profile) => setUser(profile), []);
    const signOut = useCallback(async () => {
        try {
            await SecureStore.deleteItemAsync(TOKEN_KEY);
        } catch (_) {}
        setUser(null);
    }, []);

    const value = useMemo(
        () => ({
            user,
            bootstrapping,
            isOffline,
            pendingSyncCount,
            refreshPendingCount,
            signIn,
            signOut,
            logout: signOut,
        }),
        [user, bootstrapping, isOffline, pendingSyncCount, refreshPendingCount, signIn, signOut],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
}