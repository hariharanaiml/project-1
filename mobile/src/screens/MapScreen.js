import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { useFocusEffect } from '@react-navigation/native';
import apiClient from '../services/apiClient';
import { useTheme } from '../context/ThemeContext';
import { EmptyState, ErrorState } from '../components/ui';
import { formatCurrency, formatDate } from '../utils/format';
import { API_BASE_URL } from '../constants/api';

export default function MapScreen({ navigation }) {
    const { theme } = useTheme();
    const [inspections, setInspections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [mapReady, setMapReady] = useState(false);
    const [mapTimeout, setMapTimeout] = useState(false);

    const fetchMapData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await apiClient.get('/dashboard/map-inspections');
            setInspections(res.data?.items || []);
        } catch (err) {
            setError(err.message || 'Failed to load map data.');
        } finally {
            setLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            setMapReady(false);
            setMapTimeout(false);
            fetchMapData();
        }, [fetchMapData])
    );

    useEffect(() => {
        if (!loading && inspections.length > 0) {
            const timer = setTimeout(() => {
                if (!mapReady) {
                    setMapTimeout(true);
                }
            }, 6000);
            return () => clearTimeout(timer);
        }
    }, [loading, inspections, mapReady]);

    const getMarkerColor = (priority) => {
        switch (priority?.toLowerCase()) {
            case 'urgent': return theme.danger;
            case 'high': return theme.danger;
            case 'medium': return theme.warning;
            case 'low': return theme.info;
            default: return theme.primary;
        }
    };

    const initialRegion = useMemo(() => {
        if (inspections.length === 0) {
            // Default center if no data
            return {
                latitude: 20.5937,
                longitude: 78.9629,
                latitudeDelta: 10,
                longitudeDelta: 10,
            };
        }
        // Center on the first inspection
        return {
            latitude: inspections[0].latitude,
            longitude: inspections[0].longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
        };
    }, [inspections]);

    if (loading && inspections.length === 0) {
        return (
            <View style={[styles.center, { backgroundColor: theme.background }]}>
                <ActivityIndicator size="large" color={theme.primary} />
                <Text style={{ color: theme.textMuted, marginTop: 10 }}>Loading map...</Text>
            </View>
        );
    }

    if (error && inspections.length === 0) {
        return (
            <View style={[styles.center, { backgroundColor: theme.background }]}>
                <ErrorState message={error} onRetry={fetchMapData} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {inspections.length === 0 && !loading ? (
                <View style={[styles.overlayCenter, { backgroundColor: theme.background }]}>
                    <EmptyState
                        icon="📍"
                        title="No location-based inspections available."
                        message="Inspections with GPS coordinates will appear here."
                    />
                </View>
            ) : (
                <View style={styles.flex}>
                    <MapView
                        style={styles.map}
                        initialRegion={initialRegion}
                        showsUserLocation
                        onMapReady={() => {
                            setMapReady(true);
                            setMapTimeout(false);
                        }}
                    >
                        {inspections.map((item) => (
                            <Marker
                                key={item.id}
                                coordinate={{
                                    latitude: item.latitude,
                                    longitude: item.longitude,
                                }}
                                pinColor={getMarkerColor(item.priority)}
                            >
                                <Callout
                                    tooltip
                                    onPress={() => {
                                        navigation.navigate('History', {
                                            screen: 'InspectionDetail',
                                            params: { analysisId: item.id },
                                        });
                                    }}
                                >
                                    <View style={[styles.callout, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                                        <Text style={[styles.calloutTitle, { color: theme.text }]}>
                                            {item.damage_type || 'Unknown Damage'}
                                        </Text>
                                        <Text style={[styles.calloutSubtitle, { color: theme.textSecondary }]}>
                                            Severity: {item.severity}
                                        </Text>
                                        <Text style={[styles.calloutSubtitle, { color: theme.textSecondary }]}>
                                            Cost: {item.estimated_repair_cost ? formatCurrency(item.estimated_repair_cost) : 'N/A'}
                                        </Text>
                                        <Text style={[styles.calloutDate, { color: theme.textMuted }]}>
                                            {item.analyzed_at ? formatDate(item.analyzed_at) : ''}
                                        </Text>
                                        <Text style={[styles.calloutLink, { color: theme.primary }]}>
                                            View Details &gt;
                                        </Text>
                                    </View>
                                </Callout>
                            </Marker>
                        ))}
                    </MapView>
                    {mapTimeout && (
                        <View style={[styles.errorBanner, { backgroundColor: theme.danger }]}>
                            <Text style={styles.errorBannerText}>
                                Map taking long to load. Ensure Google Maps API Key is configured in app.json and enabled on GCP.
                            </Text>
                        </View>
                    )}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    flex: { flex: 1 },
    map: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    overlayCenter: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    callout: {
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        minWidth: 160,
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
    },
    calloutTitle: { fontWeight: 'bold', fontSize: 14, marginBottom: 4 },
    calloutSubtitle: { fontSize: 12, marginBottom: 2 },
    calloutDate: { fontSize: 10, marginTop: 4, marginBottom: 8 },
    calloutLink: { fontSize: 12, fontWeight: '600' },
    errorBanner: {
        position: 'absolute',
        top: 16,
        left: 16,
        right: 16,
        padding: 12,
        borderRadius: 8,
        elevation: 5,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
    },
    errorBannerText: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});
