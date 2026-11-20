/**
 * API configuration.
 *
 * The mobile app reuses the EXISTING FastAPI backend — no duplicated logic.
 * Override the base URL with the EXPO_PUBLIC_API_URL environment variable:
 *   EXPO_PUBLIC_API_URL=http://192.168.1.20:8000/api/v1 npx expo start
 *
 * Defaults:
 *  - Android emulator reaches host machine via http://10.0.2.2:8000
 *  - Physical devices must use the PC's LAN IP (see README).
 */
import { Platform } from 'react-native';
import Constants from 'expo-constants';

const DEFAULT_ANDROID_EMULATOR = 'http://10.0.2.2:8000/api/v1';
const DEFAULT_LAN = 'http://localhost:8000/api/v1';

function resolveBaseUrl() {
    // 1. Explicit env override always wins.
    if (process.env.EXPO_PUBLIC_API_URL) {
        return String(process.env.EXPO_PUBLIC_API_URL).replace(/\/$/, '');
    }
    // 2. app.json extra.apiBaseUrl (set per-build if desired).
    const extraUrl = Constants.expoConfig?.extra?.apiBaseUrl;
    if (extraUrl) return String(extraUrl).replace(/\/$/, '');

    // 3. Extract packager host IP in Expo Go (works on physical devices over Wi-Fi)
    const hostUri = Constants.expoConfig?.hostUri || Constants.manifest2?.extra?.expoClient?.hostUri || Constants.manifest?.debuggerHost;
    if (hostUri) {
        const host = hostUri.split(':')[0];
        if (host && host !== 'localhost' && host !== '127.0.0.1') {
            return `http://${host}:8000/api/v1`;
        }
    }

    // 4. Android emulator fallback
    if (Platform.OS === 'android') {
        return DEFAULT_ANDROID_EMULATOR;
    }
    return DEFAULT_LAN;
}

export const API_BASE_URL = resolveBaseUrl();

/** Request timeout for AI inference (YOLO on CPU can be slow). */
export const PREDICT_TIMEOUT_MS = 120000;
export const DEFAULT_TIMEOUT_MS = 30000;