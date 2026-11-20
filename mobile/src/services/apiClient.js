/**
 * Axios API client for the EXISTING RoadSense FastAPI backend.
 *
 * - Attaches the Bearer token from SecureStore when present.
 * - Unwraps the backend `{ success, data, meta }` envelope so callers
 *   receive the inner `data` directly (mirrors the web app's interceptor).
 * - Normalizes errors into Error objects with `.status` and `.message`.
 */
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL, DEFAULT_TIMEOUT_MS, PREDICT_TIMEOUT_MS } from '../constants/api';

export const TOKEN_KEY = 'roadsense_access_token';

const client = axios.create({
    baseURL: API_BASE_URL,
    timeout: DEFAULT_TIMEOUT_MS,
});

client.interceptors.request.use(async (config) => {
    try {
        const token = await SecureStore.getItemAsync(TOKEN_KEY);
        if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
        }
    } catch (_) {
        /* token unavailable — proceed unauthenticated */
    }
    return config;
});

client.interceptors.response.use(
    (response) => {
        // Unwrap `{ success, data, meta }` envelopes.
        const payload = response.data;
        if (payload && typeof payload === 'object' && 'data' in payload && 'success' in payload) {
            response.data = payload.data;
        }
        return response;
    },
    (error) => {
        const status = error?.response?.status;
        let message =
            error?.response?.data?.error?.message ||
            error?.response?.data?.detail ||
            error?.message ||
            'Request failed';
        if (error?.code === 'ECONNABORTED') message = 'The request timed out. Please try again.';
        if (!error?.response) message = 'Cannot reach the RoadSense server. Check your connection.';
        const normalized = new Error(message);
        normalized.status = status;
        normalized.isNetworkError = !error?.response;
        normalized.original = error;
        return Promise.reject(normalized);
    },
);

/** Pre-configured instance for AI predict calls (longer timeout). */
export function withPredictTimeout(config = {}) {
    return { ...config, timeout: PREDICT_TIMEOUT_MS };
}

export default client;