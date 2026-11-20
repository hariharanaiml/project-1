/**
 * Auth service — reuses the EXISTING backend auth endpoints:
 *   POST /auth/login · POST /auth/register · GET /auth/me · POST /auth/logout
 */
import client, { TOKEN_KEY } from './apiClient';
import * as SecureStore from 'expo-secure-store';

/** Normalize the backend user object into a stable shape. */
function normalizeUser(user = {}) {
    return {
        id: user.id || null,
        email: user.email || '',
        fullName: user.full_name || user.fullName || '',
        role: user.role || 'user',
        createdAt: user.created_at || user.createdAt || null,
    };
}

/** Log in with email + password. Stores the token in SecureStore. */
export async function login(email, password) {
    const cleanEmail = String(email || '').trim().toLowerCase();
    
    if (__DEV__) {
        console.log('[AuthService] Initiating login request:', {
            url: `${client.defaults.baseURL}/auth/login`,
            method: 'POST',
            contentType: 'application/json',
            requestFields: ['email', 'password'],
            emailNormalized: cleanEmail,
        });
    }

    try {
        const response = await client.post('/auth/login', { email: cleanEmail, password });
        const data = response.data || {};
        
        if (__DEV__) {
            console.log('[AuthService] Login response received:', {
                status: response.status,
                responseKeys: Object.keys(data),
                hasAccessToken: Boolean(data.access_token),
                userKeys: data.user ? Object.keys(data.user) : [],
            });
        }

        if (data.access_token) {
            await SecureStore.setItemAsync(TOKEN_KEY, data.access_token);
        }
        return { token: data.access_token || null, user: normalizeUser(data.user) };
    } catch (err) {
        if (__DEV__) {
            console.log('[AuthService] Login error:', {
                status: err.status,
                message: err.message,
                isNetworkError: err.isNetworkError,
            });
        }
        throw err;
    }
}

/** Register a new account (same token payload as login). */
export async function register(email, password, fullName) {
    const cleanEmail = String(email || '').trim().toLowerCase();
    const response = await client.post('/auth/register', {
        email: cleanEmail,
        password,
        full_name: fullName,
    });
    const data = response.data || {};
    if (data.access_token) {
        await SecureStore.setItemAsync(TOKEN_KEY, data.access_token);
    }
    return { token: data.access_token || null, user: normalizeUser(data.user) };
}

/** Fetch the authenticated profile (GET /auth/me). */
export async function getProfile() {
    const response = await client.get('/auth/me');
    return normalizeUser(response.data);
}

/** Clear the stored session token. */
export async function clearSession() {
    try {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
    } catch (_) {
        /* already cleared */
    }
}