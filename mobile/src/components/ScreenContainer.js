/** ScreenContainer — themed page wrapper with optional scroll. */
import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';

export default function ScreenContainer({ children, scroll = true, padded = true, style }) {
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();

    const contentStyle = [
        styles.content,
        padded && styles.padded,
        style,
    ];

    return (
        <View style={[styles.root, { backgroundColor: theme.background, paddingTop: insets.top }]}>
            {scroll ? (
                <ScrollView
                    contentContainerStyle={contentStyle}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {children}
                </ScrollView>
            ) : (
                <View style={[styles.flex, contentStyle]}>{children}</View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1 },
    flex: { flex: 1 },
    content: { paddingBottom: 32 },
    padded: { paddingHorizontal: 16, paddingTop: 12 },
});