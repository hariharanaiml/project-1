/**
 * Notification utilities for RoadSense AI — Expo Go safe.
 *
 * ROOT CAUSE:
 * expo-notifications@57.x executes `addPushTokenListener(...)` at MODULE LOAD
 * TIME inside `DevicePushTokenAutoRegistration.fx.js`. `addPushTokenListener`
 * calls `warnOfExpoGoPushUsage()` which THROWS on Expo Go Android. A static
 * `import * as Notifications from 'expo-notifications'` therefore crashes Expo
 * Go at startup regardless of any runtime guard placed after the import.
 *
 * FIX:
 * Replace the static import with a lazy `require()` inside each function,
 * gated by isExpoGoAndroid(). The module is never loaded (and its side-effects
 * never triggered) in Expo Go Android.
 *
 * Environment behaviour:
 *   Expo Go Android  → module never loads; local-notification calls are no-ops;
 *                       push registration is skipped; app starts normally.
 *   Dev build / APK  → full expo-notifications loaded; all features available.
 */
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// ---------------------------------------------------------------------------
// Environment detection
// ---------------------------------------------------------------------------

/**
 * Returns true when running inside Expo Go on Android.
 * `executionEnvironment === 'storeClient'` is the Expo SDK 47+ API for Expo Go.
 */
function isExpoGoAndroid() {
    return Platform.OS === 'android' && Constants.executionEnvironment === 'storeClient';
}

/**
 * Lazy-loads expo-notifications only when the environment supports it.
 * Returns null (never throws) in Expo Go Android.
 */
function getNotifications() {
    if (isExpoGoAndroid()) return null;
    try {
        // Dynamic require prevents the module (and its startup side-effects) from
        // loading in Expo Go Android.
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        return require('expo-notifications');
    } catch (err) {
        if (__DEV__) console.warn('[RoadSense] expo-notifications unavailable:', err?.message);
        return null;
    }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Configure foreground notification behaviour.
 * Safe no-op in Expo Go Android — does NOT crash.
 */
export function configureNotifications() {
    if (isExpoGoAndroid()) {
        if (__DEV__) {
            console.log(
                '[RoadSense] Expo Go Android detected — remote notifications disabled. ' +
                    'Use a development build for full push notification support.',
            );
        }
        return;
    }
    try {
        const N = getNotifications();
        if (!N) return;
        N.setNotificationHandler({
            handleNotification: async () => ({
                shouldShowAlert: true,
                shouldPlaySound: true,
                shouldSetBadge: false,
            }),
        });
    } catch (err) {
        if (__DEV__) console.warn('[RoadSense] configureNotifications failed:', err?.message);
    }
}

/** Ask for local notification permission. Safe no-op in Expo Go Android. */
export async function requestNotificationPermission() {
    if (isExpoGoAndroid()) return false;
    try {
        const N = getNotifications();
        if (!N) return false;
        const existing = await N.getPermissionsAsync();
        if (existing.granted || existing.ios?.status === N.IosAuthorizationStatus?.PROVISIONAL) {
            return true;
        }
        const request = await N.requestPermissionsAsync();
        return Boolean(request.granted);
    } catch (_) {
        return false;
    }
}

/**
 * Register for remote push notifications and return the Expo push token.
 * Returns null in Expo Go Android — use a development build.
 */
export async function registerForPushNotificationsAsync() {
    if (isExpoGoAndroid()) {
        if (__DEV__) {
            console.log('[RoadSense] Expo Go Android — remote push registration skipped.');
        }
        return null;
    }
    try {
        const granted = await requestNotificationPermission();
        if (!granted) return null;
        const N = getNotifications();
        if (!N) return null;
        const tokenData = await N.getExpoPushTokenAsync();
        return tokenData?.data ?? null;
    } catch (err) {
        if (__DEV__) {
            console.warn('[RoadSense] registerForPushNotificationsAsync failed:', err?.message);
        }
        return null;
    }
}

/** Schedule an immediate local notification (best-effort, never throws). */
async function scheduleLocal(title, body, { sound = true } = {}) {
    try {
        const N = getNotifications();
        if (!N) return; // silent no-op in Expo Go Android
        await N.scheduleNotificationAsync({
            content: { title, body, sound },
            trigger: null, // fire immediately
        });
    } catch (_) {
        /* best-effort only — never crash the caller */
    }
}

/** Notify when a HIGH/URGENT damage is detected. */
export function notifyHighPriorityDamage(result) {
    const severity = String(result?.severity || '').toLowerCase();
    const priority = String(result?.priority || '').toLowerCase();
    if (
        severity === 'high' ||
        severity === 'critical' ||
        priority === 'urgent' ||
        priority === 'high'
    ) {
        return scheduleLocal(
            '⚠️ High-priority road damage detected',
            `${result.detectionCount || 1} damage(s) found — severity ${severity.toUpperCase()}. Immediate attention recommended.`,
        );
    }
    return Promise.resolve();
}

/** Notify after a successful inspection upload. */
export function notifyInspectionSaved() {
    return scheduleLocal(
        '✅ Inspection uploaded',
        'Your road inspection was analyzed and saved successfully.',
    );
}

/** Notify when offline inspections finish syncing. */
export function notifySyncComplete(synced) {
    if (!synced || synced <= 0) return Promise.resolve();
    return scheduleLocal(
        '🔄 Offline sync completed',
        `${synced} saved inspection${synced > 1 ? 's' : ''} uploaded to RoadSense.`,
    );
}