/**
 * ResultScreen — AI inspection result:
 * uploaded image with bounding-box overlay + one card per detection
 * (damage type, confidence, severity, priority, cost, recommendation).
 */
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import { Card, Badge, Button, EmptyState } from '../components/ui';
import DamageCard from '../components/DamageCard';
import BoundingBoxOverlay from '../components/BoundingBoxOverlay';
import { useTheme } from '../context/ThemeContext';
import {
    damageLabel,
    formatConfidence,
    formatCurrency,
    formatCostRange,
} from '../utils/format';

export default function ResultScreen({ route, navigation }) {
    const { theme } = useTheme();
    const result = route?.params?.result;
    const imageUri = route?.params?.imageUri;

    if (!result) {
        return (
            <ScreenContainer>
                <EmptyState icon="🤖" title="No analysis result" message="Run an inspection first." />
            </ScreenContainer>
        );
    }

    const overall = {
        label: result.primaryDamageType,
        primaryDamageType: result.primaryDamageType,
        severity: result.severity,
        priority: result.priority,
        confidence: result.confidence,
        estimatedCost: result.estimatedCost,
        costRange: result.costRange,
        currency: result.currency,
        summary: result.summary,
    };

    // One card per detection when multiple damages exist; otherwise the summary.
    const cards =
        result.detections.length > 1
            ? result.detections.map((det) => ({
                ...overall,
                label: det.label,
                confidence: det.confidence,
            }))
            : [overall];

    return (
        <ScreenContainer>
            {/* Image with bounding-box overlay */}
            <View style={styles.imageWrap}>
                <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
                <BoundingBoxOverlay boxes={result.boundingBoxes} />
                <View style={styles.overlayBadges}>
                    <Badge label={`${result.detectionCount} found`} tone={result.damageDetected ? 'high' : 'low'} size="xs" />
                    <Badge label={`conf ${formatConfidence(result.confidence)}`} tone="neutral" size="xs" />
                </View>
            </View>

            {/* Summary strip */}
            <Card style={styles.summary}>
                <Text style={[styles.summaryTitle, { color: theme.text }]}>
                    {result.damageDetected
                        ? `${damageLabel(result.primaryDamageType)} detected`
                        : 'No damage detected'}
                </Text>
                <Text style={[styles.summaryMeta, { color: theme.textSecondary }]}>
                    Severity {String(result.severity).toUpperCase()} · Priority{' '}
                    {String(result.priority).toUpperCase()} · Est.{' '}
                    {formatCostRange(result.costRange, result.currency) ||
                        formatCurrency(result.estimatedCost, result.currency)}
                </Text>
                {result.processingTimeMs ? (
                    <Text style={[styles.modelNote, { color: theme.textMuted }]}>
                        {result.mock ? 'Mock pipeline' : `Model ${result.modelVersion}`} ·{' '}
                        {(result.processingTimeMs / 1000).toFixed(1)}s
                    </Text>
                ) : null}
            </Card>

            {/* Per-detection cards */}
            {cards.map((detection, index) => (
                <DamageCard key={index} detection={detection} />
            ))}

            {!result.damageDetected && (
                <Card style={styles.noDamage}>
                    <Text style={[styles.noDamageText, { color: theme.textSecondary }]}>
                        The model did not find road damage in this image. You can capture another
                        photo for a new inspection.
                    </Text>
                </Card>
            )}

            <Button
                title="New Inspection"
                variant="outline"
                onPress={() => navigation.navigate('CaptureHome')}
                style={styles.newInspection}
            />
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    imageWrap: {
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: '#000',
        aspectRatio: 3 / 4,
        marginBottom: 12,
    },
    image: StyleSheet.absoluteFillObject,
    overlayBadges: {
        position: 'absolute',
        top: 10,
        left: 10,
        flexDirection: 'row',
        gap: 6,
    },
    summary: { marginBottom: 12 },
    summaryTitle: { fontSize: 17, fontWeight: '800' },
    summaryMeta: { marginTop: 5, fontSize: 12.5, fontWeight: '600', lineHeight: 18 },
    modelNote: { marginTop: 6, fontSize: 11 },
    noDamage: { alignItems: 'center' },
    noDamageText: { fontSize: 13, textAlign: 'center', lineHeight: 19 },
    newInspection: { marginTop: 6 },
});