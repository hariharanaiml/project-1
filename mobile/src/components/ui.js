/**
 * Core UI primitives — Card, Button, Badge, StatCard, EmptyState, ErrorState.
 * Themed via useTheme(); Material-Design-inspired styling.
 */
import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { PRIORITY_COLORS, SEVERITY_COLORS } from '../constants';

/** Card */
export function Card({ children, style }) {
    const { theme } = useTheme();
    return (
        <View
            style={[
                styles.card,
                { backgroundColor: theme.surface, borderColor: theme.border, shadowColor: theme.shadow },
                style,
            ]}
        >
            {children}
        </View>
    );
}

/** Button (primary / outline / danger) with loading state. */
export function Button({ title, onPress, variant = 'primary', loading = false, disabled = false, style }) {
    const { theme } = useTheme();
    const isDisabled = disabled || loading;

    const bg =
        variant === 'primary' ? theme.primary :
            variant === 'danger' ? theme.danger : 'transparent';
    const fg = variant === 'outline' ? theme.primary : theme.primaryContrast;
    const border = variant === 'outline' ? { borderWidth: 1.5, borderColor: theme.primary } : null;

    return (
        <TouchableOpacity
            activeOpacity={0.85}
            onPress={onPress}
            disabled={isDisabled}
            style={[styles.button, { backgroundColor: bg }, border, isDisabled && { opacity: 0.55 }, style]}
        >
            {loading ? (
                <ActivityIndicator color={fg} />
            ) : (
                <Text style={[styles.buttonText, { color: fg }]}>{title}</Text>
            )}
        </TouchableOpacity>
    );
}

/** Badge pill for severity / priority values. */
export function Badge({ label, tone = 'neutral', size = 'sm' }) {
    const palette = {
        urgent: PRIORITY_COLORS.urgent,
        critical: PRIORITY_COLORS.critical,
        high: PRIORITY_COLORS.high,
        medium: PRIORITY_COLORS.medium,
        low: PRIORITY_COLORS.low,
        neutral: '#98a2b3',
    };
    const color = palette[tone] || palette.neutral;
    return (
        <View style={[styles.badge, { backgroundColor: `${color}22`, borderColor: color }, size === 'xs' && styles.badgeXs]}>
            <Text style={[styles.badgeText, { color }, size === 'xs' && styles.badgeTextXs]}>
                {String(label).toUpperCase()}
            </Text>
        </View>
    );
}

/** StatCard for the dashboard grid. */
export function StatCard({ label, value, accent }) {
    const { theme } = useTheme();
    return (
        <View style={[styles.statCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.statValue, { color: accent || theme.primary }]} numberOfLines={1}>
                {value}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]} numberOfLines={2}>
                {label}
            </Text>
        </View>
    );
}

/** EmptyState — friendly placeholder when there is no data. */
export function EmptyState({ icon, title, message }) {
    const { theme } = useTheme();
    return (
        <View style={styles.emptyState}>
            {icon ? <Text style={styles.emptyIcon}>{icon}</Text> : null}
            <Text style={[styles.emptyTitle, { color: theme.text }]}>{title}</Text>
            {message ? (
                <Text style={[styles.emptyMessage, { color: theme.textSecondary }]}>{message}</Text>
            ) : null}
        </View>
    );
}

/** ErrorState — API failure with retry action. */
export function ErrorState({ message, onRetry }) {
    const { theme } = useTheme();
    return (
        <View style={[styles.errorState, { borderColor: theme.danger }]}>
            <Text style={[styles.errorTitle, { color: theme.danger }]}>Something went wrong</Text>
            <Text style={[styles.errorMessage, { color: theme.textSecondary }]}>{message}</Text>
            {onRetry ? (
                <Button title="Retry" variant="outline" onPress={onRetry} style={styles.retryButton} />
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 14,
        borderWidth: StyleSheet.hairlineWidth,
        padding: 16,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 2,
    },
    button: {
        borderRadius: 12,
        paddingVertical: 13,
        paddingHorizontal: 18,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 48,
    },
    buttonText: { fontSize: 15, fontWeight: '700', letterSpacing: 0.2 },
    badge: {
        alignSelf: 'flex-start',
        borderRadius: 999,
        borderWidth: 1,
        paddingHorizontal: 8,
        paddingVertical: 3,
    },
    badgeXs: { paddingHorizontal: 6, paddingVertical: 2 },
    badgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
    badgeTextXs: { fontSize: 9 },
    statCard: {
        flex: 1,
        minWidth: '45%',
        borderRadius: 14,
        borderWidth: StyleSheet.hairlineWidth,
        padding: 14,
    },
    statValue: { fontSize: 22, fontWeight: '800' },
    statLabel: { marginTop: 4, fontSize: 12, fontWeight: '600' },
    emptyState: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 24 },
    emptyIcon: { fontSize: 36, marginBottom: 10 },
    emptyTitle: { fontSize: 16, fontWeight: '700', textAlign: 'center' },
    emptyMessage: { marginTop: 6, fontSize: 13, textAlign: 'center', lineHeight: 19 },
    errorState: {
        alignItems: 'center',
        paddingVertical: 28,
        paddingHorizontal: 20,
        borderRadius: 14,
        borderWidth: 1,
    },
    errorTitle: { fontSize: 15, fontWeight: '800' },
    errorMessage: { marginTop: 6, fontSize: 13, textAlign: 'center', lineHeight: 19 },
    retryButton: { marginTop: 14, minWidth: 140 },
});