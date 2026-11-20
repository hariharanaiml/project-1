/**
 * InspectionDetailScreen — full detail of one persisted inspection,
 * loaded from the existing GET /ai/analyses/{id} endpoint.
 */
import React, { useCallback, useState } from 'react';
import { ScrollView, Text, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import ScreenContainer from '../components/ScreenContainer';
import { Card, Badge, EmptyState, ErrorState } from '../components/ui';
import DamageCard from '../components/DamageCard';
import { useTheme } from '../context/ThemeContext';
import { getAnalysisDetail } from '../services/inspectionService';
import {
    damageLabel,
    formatDate,
    formatDateTime,
    formatCurrency,
    formatConfidence,
} from '../utils/format';

export default function InspectionDetailScreen({ route }) {
    const analysisId = route?.params?.analysisId;
    const { theme } = useTheme();
    const [detail, setDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const load = useCallback(async () => {
        if (!analysisId) return;
        setLoading(true);
        setError('');
        try {
            setDetail(await getAnalysisDetail(analysisId));
        } catch (err) {
            setError(err?.message || 'Failed to load inspection details.');
        } finally {
            setLoading(false);
        }
    }, [analysisId]);

    useFocusEffect(
        useCallback(() => {
            load();
        }, [load]),
    );

    if (!analysisId) {
        return (
            <ScreenContainer>
                <EmptyState icon="🔍" title="No inspection selected" />
            </ScreenContainer>
        );
    }

    if (error) {
        return (
            <ScreenContainer>
                <ErrorState message={error} onRetry={load} />
            </ScreenContainer>
        );
    }

    if (loading || !detail) {
        return (
            <ScreenContainer>
                <Text style={[styles.loading, { color: theme.textMuted }]}>Loading details…</Text>
            </ScreenContainer>
        );
    }

    const metadata = detail.analysis_metadata || {};
    const cost = Number(detail.repair_cost || 0);

    return (
        <ScrollView
            style={{ flex: 1, backgroundColor: theme.background }}
            contentContainerStyle={styles.content}
        >
            {/* Header */}
            <Card style={styles.card}>
                <View style={styles.headerRow}>
                    <Text style={[styles.damageTitle, { color: theme.text }]}>
                        {damageLabel(detail.damage_type)}
                    </Text>
                    <Badge label={metadata.priority || detail.severity || 'low'} tone={metadata.priority} />
                </View>
                <Text style={[styles.reportNumber, { color: theme.textSecondary }]}>
                    {detail.report?.report_number || detail.report_number || ''} ·{' '}
                    {formatDateTime(detail.completed_at)}
                </Text>
                {detail.report?.road_name ? (
                    <Text style={[styles.roadName, { color: theme.text }]}>
                        📍 {detail.report.road_name}
                    </Text>
                ) : null}
            </Card>

            {/* Metrics */}
            <Card style={styles.card}>
                <Metric label="Severity" value={String(detail.severity || 'Low').toUpperCase()} color={theme.danger} />
                <Metric label="Confidence" value={formatConfidence(detail.confidence_score)} color={theme.text} />
                <Metric label="Estimated Cost" value={formatCurrency(cost)} color={theme.success} />
                <Metric label="Inspection Date" value={formatDate(detail.completed_at)} color={theme.text} />
                {detail.risk_score != null ? (
                    <Metric label="Risk Score" value={`${Math.round(Number(detail.risk_score))}/100`} color={theme.warning} />
                ) : null}
            </Card>

            {/* Recommendation */}
            {detail.repair_recommendation ? (
                <Card style={styles.card}>
                    <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>RECOMMENDATION</Text>
                    <Text style={[styles.body, { color: theme.text }]}>{detail.repair_recommendation}</Text>
                    {metadata.repair_method ? (
                        <Text style={[styles.method, { color: theme.textSecondary }]}>
                            Method: {metadata.repair_method}
                        </Text>
                    ) : null}
                </Card>
            ) : null}

            {/* Detections */}
            {(detail.detections || []).length > 0 ? (
                <Card style={styles.card}>
                    <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
                        DETECTED DAMAGES ({detail.detections.length})
                    </Text>
                    {detail.detections.map((det, index) => (
                        <DamageCard
                            key={index}
                            detection={{
                                label: det.label,
                                confidence: Math.round(Number(det.confidence || 0) * 100),
                                severity: detail.severity,
                                priority: metadata.priority,
                                estimatedCost: cost,
                                currency: metadata.currency || 'INR',
                                summary: detail.repair_recommendation,
                            }}
                        />
                    ))}
                </Card>
            ) : null}
        </ScrollView>
    );
}

function Metric({ label, value, color }) {
    const { theme } = useTheme();
    return (
        <View style={styles.metricRow}>
            <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>{label}</Text>
            <Text style={[styles.metricValue, { color }]}>{value}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    content: { padding: 16, paddingBottom: 32 },
    card: { marginBottom: 12 },
    headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    damageTitle: { fontSize: 19, fontWeight: '800', flexShrink: 1 },
    reportNumber: { marginTop: 4, fontSize: 12 },
    roadName: { marginTop: 8, fontSize: 14, fontWeight: '700' },
    sectionTitle: { fontSize: 10.5, fontWeight: '800', letterSpacing: 0.6, marginBottom: 8 },
    body: { fontSize: 13.5, lineHeight: 20 },
    method: { marginTop: 8, fontSize: 12 },
    metricRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 7,
    },
    metricLabel: { fontSize: 13, fontWeight: '600' },
    metricValue: { fontSize: 14, fontWeight: '800' },
    loading: { textAlign: 'center', marginTop: 32, fontSize: 13 },
});