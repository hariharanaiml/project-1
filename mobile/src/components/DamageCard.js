/**
 * DamageCard — one detected damage rendered as a card:
 * damage type, confidence, severity, priority, estimated cost,
 * recommendation. Multiple detections render as separate cards.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card, Badge } from './ui';
import { useTheme } from '../context/ThemeContext';
import { damageLabel, formatConfidence, formatCurrency, formatCostRange } from '../utils/format';

export default function DamageCard({ detection }) {
    const { theme } = useTheme();
    const costRange = formatCostRange(detection.costRange, detection.currency);
    const cost = costRange || formatCurrency(detection.estimatedCost, detection.currency);

    return (
        <Card style={styles.card}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={[styles.damageTitle, { color: theme.text }]}>
                    {damageLabel(detection.label || detection.primaryDamageType)}
                </Text>
                <Badge label={detection.priority || 'low'} tone={detection.priority} />
            </View>

            {/* Metrics grid */}
            <View style={styles.metrics}>
                <Metric label="Confidence" value={formatConfidence(detection.confidence)} color={theme.text} />
                <Metric
                    label="Severity"
                    value={String(detection.severity || 'Low').toUpperCase()}
                    color={theme.danger}
                />
                <Metric label="Estimated Cost" value={cost} color={theme.success} />
            </View>

            {/* Recommendation */}
            {detection.summary ? (
                <View style={[styles.recommendation, { backgroundColor: theme.surfaceAlt }]}>
                    <Text style={[styles.recommendationTitle, { color: theme.textSecondary }]}>
                        RECOMMENDATION
                    </Text>
                    <Text style={[styles.recommendationBody, { color: theme.text }]}>
                        {detection.summary}
                    </Text>
                </View>
            ) : null}
        </Card>
    );
}

function Metric({ label, value, color }) {
    const { theme } = useTheme();
    return (
        <View style={styles.metric}>
            <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>{label}</Text>
            <Text style={[styles.metricValue, { color }]} numberOfLines={2}>{value}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    card: { marginBottom: 12 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    damageTitle: { fontSize: 17, fontWeight: '800', flexShrink: 1 },
    metrics: { flexDirection: 'row', gap: 10 },
    metric: { flex: 1 },
    metricLabel: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.4 },
    metricValue: { marginTop: 3, fontSize: 14, fontWeight: '800' },
    recommendation: {
        marginTop: 12,
        borderRadius: 10,
        padding: 12,
    },
    recommendationTitle: { fontSize: 10, fontWeight: '800', letterSpacing: 0.6, marginBottom: 4 },
    recommendationBody: { fontSize: 13, lineHeight: 19 },
});