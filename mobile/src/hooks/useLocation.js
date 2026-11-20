/**
 * useLocation — Expo Location wrapper.
 * Permission is requested ONLY when getCurrentPosition() is called.
 * Location stays optional: denial returns a friendly error, never blocks.
 */
import { useCallback, useState } from 'react';
import * as Location from 'expo-location';

export function useLocation() {
    const [locating, setLocating] = useState(false);
    const [error, setError] = useState(null);

    const getCurrentPosition = useCallback(async () => {
        setLocating(true);
        setError(null);
        try {
            // Request permission only when needed (on demand).
            const permission = await Location.requestForegroundPermissionsAsync();
            if (!permission.granted) {
                throw new Error('Location access denied. You can still analyze the image.');
            }
            const position = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
            });
            return {
                latitude: Number(position.coords.latitude.toFixed(6)),
                longitude: Number(position.coords.longitude.toFixed(6)),
            };
        } catch (err) {
            const message =
                err?.message === 'Location access denied. You can still analyze the image.'
                    ? err.message
                    : 'Could not get your current location.';
            setError(message);
            return null;
        } finally {
            setLocating(false);
        }
    }, []);

    return { locating, locationError: error, getCurrentPosition };
}