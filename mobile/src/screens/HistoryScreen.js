/**
 * HistoryScreen — inspection history list (Date · Damage · Severity ·
 * Priority) from the real backend. Tap an item to view full details.
 */
import React, { useCallback, useState } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import ScreenContainer from '../components/ScreenContainer';
import { EmptyState, ErrorState } from '../components/ui';
import InspectionListItem from '../components/InspectionListItem';
import { useTheme } from '../context/ThemeContext';
import { getInspectionHistory } from '../services/inspectionService';

export default function HistoryScreen({ navigation }) {
    const { theme } = useTheme();
    const [inspections, setInspections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const load = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const items = await getInspectionHistory(50);
            setInspections(items);
        } catch (err) {
            setError(err?.message || 'Failed to load inspection history.');
        } finally {
            setLoading(false);
        }
    }, []);

    // Reload whenever the tab gains focus.
    useFocusEffect(
        useCallback(() => {
            load();
        }, [load]),
    );

    return (
        <ScreenContainer padded={false}>
            <FlatList
                data={inspections}
                keyExtractor={(item) => String(item.analysis_id || item.report_id)}
                contentContainerStyle={styles.list}
                renderItem={({ item }) => (
                    <InspectionListItem
                        inspection={item}
                        onPress={() =>
                            navigation.navigate('InspectionDetail', { analysisId: item.analysis_id })
                        }
                    />
                )}
                ListEmptyComponent={
                    error ? (
                        <ErrorState message={error} onRetry={load} />
                    ) : loading ? null : (
                        <EmptyState
                            icon="🗂️"
                            title="No inspections yet"
                            message="Capture a road image to create your first inspection."
                        />
                    )
                }
                refreshing={loading}
                onRefresh={load}
            />
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    list: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 24 },
});