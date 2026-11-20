/**
 * InspectionListItem — one row in the inspection history list:
 * Date · Damage · Severity · Priority. Tappable for details.
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Card, Badge } from './ui';
import { useTheme } from '../context/ThemeContext';
import { damageLabel, formatDate } from '../utils/format';

export default function InspectionListItem({ inspection, onPress }) {
    const { theme } = useTheme();

    return (
        <TouchableOpacity activeOpacity={0.85} onPress={onPress} disabled={!onPress}>
            <Card style={styles.card}>
                <View style={styles.row}>
                    <View style={styles.left}>
                        <Text style={[styles.damage, { color: theme.text }]} numberOfLines={1}>
                            {damageLabel(inspection.damage_type)}
                        </Text>
                        <Text style={[styles.date, { color: theme.textSecondary }]}>
                            {formatDate(inspection.inspection_date)}
                        </Text>
                    </View>
                    <View style={styles.badges}>
                        <Badge label={inspection.severity || 'low'} tone={inspection.severity} size="xs" />
                        <Badge
                            label={inspection.priority || 'low'}
                            tone={inspection.priority}
                            size="xs"
                        />
                    </View>
                </View>
            </Card>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: { marginBottom: 10, paddingVertical: 12 },
    row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    left: { flexShrink: 1, flex: 1 },
    damage: { fontSize: 15, fontWeight: '700' },
    date: { marginTop: 3, fontSize: 12 },
    badges: { flexDirection: 'row', gap: 6, marginLeft: 10 },
});