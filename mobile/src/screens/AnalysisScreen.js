/**
 * AnalysisScreen — AI processing state.
 * Shows staged progress while YOLOv8 runs on the backend, or an
 * "offline queued" confirmation when the inspection was saved locally.
 */
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import { Card } from '../components/ui';
import { useTheme } from '../context/ThemeContext';
import { ANALYSIS_STAGES } from '../constants';

export default function AnalysisScreen({ route }) {
    const { theme } = useTheme();
    const offlineQueued = Boolean(route?.params?.offlineQueued);
    const [stageIndex, setStageIndex] = useState(0);

    // Cycle through stage labels to communicate progress.
    useEffect(() => {
        if (offlineQueued) return undefined;
        const timer = setInterval(() => {
            setStageIndex((prev) => Math.min(prev + 1, ANALYSIS_STAGES.length - 1));
        }, 2200);
        return () => clearInterval(timer);
    }, [offlineQueued]);

    return (
        <View style={[styles.root, { backgroundColor: theme.background }]}>
            <Card style={styles.card}>
                {offlineQueued ? (
                    <>
                        <Text style={styles.icon}>📥</Text>
                        <Text style={[styles.title, { color: theme.text }]}>Inspection saved offline.</Text>
                        <Text style={[styles.body, { color: theme.textSecondary }]}>
                            No internet connection right now. Your inspection is stored safely on
                            this device and will upload automatically once you're back online.
                        </Text>
                    </>
                ) : (
                    <>
                        <Text style={styles.icon}>🧠</Text>
                        <Text style={[styles.title, { color: theme.text }]}>Analyzing road image…</Text>
                        <Text style={[styles.stage, { color: theme.primary }]}>
                            {ANALYSIS_STAGES[stageIndex]}
                        </Text>
                        <View style={styles.dots}>
                            {[0, 1, 2].map((dot) => (
                                <View
                                    key={dot}
                                    style={[
                                        styles.dot,
                                        {
                                            backgroundColor:
                                                dot <= stageIndex % 3 ? theme.primary : theme.border,
                                        },
                                    ]}
                                />
                            ))}
                        </View>
                        <Text style={[styles.note, { color: theme.textMuted }]}>
                            YOLOv8 inference runs on the RoadSense server — this usually takes a
                            few seconds.
                        </Text>
                    </>
                )}
            </Card>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, justifyContent: 'center', padding: 20 },
    card: { alignItems: 'center', paddingVertical: 36 },
    icon: { fontSize: 52 },
    title: { marginTop: 14, fontSize: 19, fontWeight: '800', textAlign: 'center' },
    body: { marginTop: 10, fontSize: 13.5, lineHeight: 21, textAlign: 'center' },
    stage: { marginTop: 12, fontSize: 14, fontWeight: '700' },
    dots: { flexDirection: 'row', gap: 8, marginTop: 16 },
    dot: { width: 10, height: 10, borderRadius: 5 },
    note: { marginTop: 18, fontSize: 11.5, textAlign: 'center', lineHeight: 17 },
});