/**
 * CaptureScreen — capture/pick a road image, preview before upload,
 * optionally attach GPS, then Analyze.
 *
 * Flow: Open camera → Capture → Preview → (GPS) → Analyze
 * Offline: if the network is unavailable the inspection is queued locally
 * and synced automatically when connectivity returns.
 */
import React, { useState, useRef } from 'react';
import { View, Text, Image, StyleSheet, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import ScreenContainer from '../components/ScreenContainer';
import { Card, Button, Badge } from '../components/ui';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../hooks/useLocation';
import { uploadRoadImage, createReport, predictImage } from '../services/inspectionService';
import { enqueueInspection } from '../services/offlineQueue';
import NetInfo from '@react-native-community/netinfo';
import { notifyHighPriorityDamage, notifyInspectionSaved } from '../utils/notifications';

export default function CaptureScreen({ navigation }) {
    const { theme } = useTheme();
    const { isOffline } = useAuth();
    const [cameraPermission, requestCameraPermission] = useCameraPermissions();
    const { locating, locationError, getCurrentPosition } = useLocation();

    const cameraRef = useRef(null);
    const [photo, setPhoto] = useState(null); // { uri }
    const [gps, setGps] = useState(null); // { latitude, longitude }
    const [analyzing, setAnalyzing] = useState(false);
    const [error, setError] = useState('');

    /** Capture a photo (no auto-upload — preview first). */
    const handleCapture = async () => {
        if (!cameraRef.current) return;
        try {
            const shot = await cameraRef.current.takePictureAsync({
                quality: 0.85,
                base64: false,
                exif: false,
            });
            setPhoto({ uri: shot.uri });
            setError('');
        } catch (_) {
            setError('Could not capture the photo. Please try again.');
        }
    };

    /** Pick an existing image from the gallery. */
    const handlePickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: 'images',
            quality: 0.85,
            allowsEditing: false,
        });
        if (!result.canceled && result.assets?.length > 0) {
            setPhoto({ uri: result.assets[0].uri });
            setError('');
        }
    };

    /** Attach current GPS position (optional; denial is non-blocking). */
    const handleAttachGps = async () => {
        const position = await getCurrentPosition();
        if (position) setGps(position);
    };

    /** Retake / choose another image. */
    const handleRetake = () => {
        setPhoto(null);
        setGps(null);
        setError('');
    };

    /**
     * Analyze: image (+GPS) → FastAPI → YOLOv8 → persisted inspection.
     * Falls back to the offline queue when the network is unavailable.
     */
    const handleAnalyze = async () => {
        if (!photo) return;
        setAnalyzing(true);
        setError('');

        try {
            const netState = await NetInfo.fetch();
            const online = Boolean(netState.isConnected && netState.isInternetReachable !== false);

            if (!online || isOffline) {
                // ── Offline path: queue for later sync ──
                await enqueueInspection({
                    imageUri: photo.uri,
                    latitude: gps?.latitude ?? null,
                    longitude: gps?.longitude ?? null,
                    roadName: 'Mobile Inspection',
                    description: 'Road damage inspection captured from the RoadSense mobile app.',
                });
                navigation.navigate('Analysis', {
                    offlineQueued: true,
                    imageUri: photo.uri,
                });
                return;
            }

            // ── Online path: upload → report → predict (backend persists) ──
            const meta = await uploadRoadImage(photo.uri);
            const report = await createReport({
                roadName: 'Mobile Inspection',
                description: 'Road damage inspection captured from the RoadSense mobile app.',
                latitude: gps?.latitude ?? null,
                longitude: gps?.longitude ?? null,
                imagePath: meta?.path || null,
            });
            const result = await predictImage(photo.uri, report.id);

            if (!result.success) {
                throw new Error('AI analysis failed on the server. Please try again.');
            }

            // Notifications: high-priority alert + successful save.
            await notifyHighPriorityDamage(result);
            await notifyInspectionSaved();

            navigation.replace('Result', { result, imageUri: photo.uri });
        } catch (err) {
            setError(err?.message || 'Analysis failed. Please check your connection and try again.');
        } finally {
            setAnalyzing(false);
        }
    };

    // ── Camera permission gate ──
    if (!cameraPermission) {
        return (
            <ScreenContainer>
                <Card><Text style={{ color: theme.text }}>Loading camera…</Text></Card>
            </ScreenContainer>
        );
    }
    if (!cameraPermission.granted) {
        return (
            <ScreenContainer>
                <Card style={styles.center}>
                    <Text style={styles.permissionIcon}>📷</Text>
                    <Text style={[styles.permissionTitle, { color: theme.text }]}>Camera access needed</Text>
                    <Text style={[styles.permissionBody, { color: theme.textSecondary }]}>
                        RoadSense needs camera access to capture road damage photos.
                    </Text>
                    <Button title="Grant Camera Access" onPress={requestCameraPermission} />
                    <Button title="Pick From Gallery Instead" variant="outline" onPress={handlePickImage} style={styles.gap} />
                </Card>
            </ScreenContainer>
        );
    }

    return (
        <ScreenContainer scroll={false} padded={false}>
            {!photo ? (
                /* ── Live camera view ── */
                <View style={styles.flex}>
                    <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="back" />
                    <View style={[styles.cameraControls, { backgroundColor: `${theme.background}CC` }]}>
                        <Button title="🖼️ Gallery" variant="outline" onPress={handlePickImage} style={styles.flexBtn} />
                        <Button title="Capture" onPress={handleCapture} style={styles.flexBtn} />
                    </View>
                </View>
            ) : (
                /* ── Preview before upload (never auto-uploads) ── */
                <View style={styles.previewWrap}>
                    <Image source={{ uri: photo.uri }} style={styles.preview} resizeMode="cover" />

                    {/* GPS chip */}
                    <View style={styles.gpsRow}>
                        {gps ? (
                            <Badge
                                label={`📍 ${gps.latitude.toFixed(4)}, ${gps.longitude.toFixed(4)}`}
                                tone="low"
                            />
                        ) : (
                            <Button
                                title={locating ? 'Getting location…' : '📍 Attach GPS Location'}
                                variant="outline"
                                onPress={handleAttachGps}
                                loading={locating}
                            />
                        )}
                    </View>
                    {locationError ? (
                        <Text style={[styles.locationNote, { color: theme.warning }]}>{locationError}</Text>
                    ) : null}

                    <View style={styles.previewActions}>
                        <Button title="Retake" variant="outline" onPress={handleRetake} style={styles.flexBtn} />
                        <Button
                            title="Analyze"
                            onPress={handleAnalyze}
                            loading={analyzing}
                            disabled={analyzing}
                            style={styles.flexBtn}
                        />
                    </View>

                    {error ? (
                        <Text style={[styles.errorText, { color: theme.danger }]}>{error}</Text>
                    ) : null}
                </View>
            )}
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1 },
    center: { alignItems: 'center', marginTop: 40 },
    permissionIcon: { fontSize: 44 },
    permissionTitle: { marginTop: 10, fontSize: 17, fontWeight: '800' },
    permissionBody: { marginVertical: 12, textAlign: 'center', lineHeight: 20 },
    gap: { marginTop: 10 },
    cameraControls: {
        position: 'absolute',
        bottom: 24,
        left: 16,
        right: 16,
        flexDirection: 'row',
        gap: 12,
        borderRadius: 16,
        padding: 12,
    },
    flexBtn: { flex: 1 },
    previewWrap: { flex: 1, padding: 16 },
    preview: { flex: 1, borderRadius: 16, overflow: 'hidden', backgroundColor: '#000' },
    gpsRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 14 },
    locationNote: { textAlign: 'center', marginTop: 8, fontSize: 12, fontWeight: '600' },
    previewActions: { flexDirection: 'row', gap: 12, marginTop: 14 },
    errorText: { textAlign: 'center', marginTop: 10, fontSize: 13, fontWeight: '600' },
});