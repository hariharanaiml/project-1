/**
 * HomeScreen — dashboard with real statistics from the backend:
 * total inspections, high-priority issues, potholes, cracks,
 * estimated repair cost, and recent inspections.
 */
import React, { useCallback } from 'react';
import { View, Text, StyleSheet, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import ScreenContainer from '../components/ScreenContainer';
import { Card, StatCard, EmptyState, ErrorState } from '../components/ui';
import InspectionListItem from '../components/InspectionListItem';
import { useTheme } from '../context/ThemeContext';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { formatCurrency } from '../utils/format';

export default function HomeScreen({ navigation }) {
    const { theme } = useTheme();
    const { stats, recent, loading, error, refetch } = useDashboardStats(5);

    // Reload every time the tab gains focus so new inspections appear.
    useFocusEffect(
        useCallback(() => {
            refetch();
        }, [refetch]),
    );

    const hasData = stats && Number(stats.total_inspections || 0) > 0;

    return (
        <ScreenContainer>
            <Text style={[styles.heading, { color: theme.text }]}>RoadSense Dashboard</Text>
            <Text style={[styles.subheading, { color: theme.textSecondary }]}>
                Real-time road inspection analytics
            </Text>

            {error ? <ErrorState message={error} onRetry={refetch} /> : null}

            {!error && !hasData && !loading ? (
                <EmptyState
                    icon="📊"
                    title="No inspection data available."
                    message="Capture your first road damage inspection to see analytics here."
                />
            ) : null}

            {hasData ? (
                <>
                    {/* Stats grid */}
                    <View style={styles.grid}>
                        <StatCard label="Total Inspections" value={String(stats.total_inspections ?? 0)} />
                        <StatCard
                            label="High-Priority Issues"
                            value={String(stats.high_priority ?? 0)}
                            accent={theme.danger}
                        />
                        <StatCard
                            label="Potholes Detected"
                            value={String(stats.total_potholes ?? 0)}
                            accent={theme.warning}
                        />
                        <StatCard
                            label="Cracks Detected"
                            value={String(stats.total_cracks ?? 0)}
                            accent={theme.info}
                        />
                    </View>

                    <Card style={styles.costCard}>
                        <Text style={[styles.costLabel, { color: theme.textSecondary }]}>
                            ESTIMATED TOTAL REPAIR COST
                        </Text>
                        <Text style={[styles.costValue, { color: theme.primary }]}>
                            {formatCurrency(stats.estimated_total_repair_cost)}
                        </Text>
                    </Card>

                    {/* Recent inspections */}
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent Inspections</Text>
                    {recent.length === 0 ? (
                        <EmptyState icon="🗂️" title="No recent inspections" />
                    ) : (
                        recent.map((inspection) => (
                            <InspectionListItem
                                key={inspection.analysis_id || inspection.report_id}
                                inspection={inspection}
                                onPress={() =>
                                    navigation.navigate('History', {
                                        screen: 'InspectionDetail',
                                        params: { analysisId: inspection.analysis_id },
                                    })
                                }
                            />
                        ))
                    )}
                </>
            ) : null}

            {loading && !stats ? (
                <Text style={[styles.loadingText, { color: theme.textMuted }]}>Loading dashboard…</Text>
            ) : null}

            <RefreshTrigger onRefresh={refetch} loading={loading} />
        </ScreenContainer>
    );
}

/** Pull-to-refresh support via parent ScrollView is not available in
 *  ScreenContainer; expose a manual refresh row instead. */
function RefreshTrigger({ onRefresh, loading }) {
    return null;
}

const styles = StyleSheet.create({
    heading: { fontSize: 22, fontWeight: '800' },
    subheading: { marginTop: 4, fontSize: 13, marginBottom: 16 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    costCard: { marginTop: 12, alignItems: 'center' },
    costLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.6 },
    costValue: { marginTop: 4, fontSize: 24, fontWeight: '900' },
    sectionTitle: { marginTop: 20, marginBottom: 10, fontSize: 16, fontWeight: '800' },
    loadingText: { textAlign: 'center', marginTop: 24, fontSize: 13 },
});