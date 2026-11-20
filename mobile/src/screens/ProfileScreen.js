import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
    const { user, logout } = useAuth();
    const { theme } = useTheme();

    const handleLogout = () => {
        Alert.alert(
            "Logout",
            "Are you sure you want to log out?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Logout",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await logout();
                        } catch (e) {
                            Alert.alert("Error", "Failed to log out. Please try again.");
                        }
                    }
                }
            ]
        );
    };

    return (
        <ScreenContainer>
            <View style={styles.header}>
                <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
                    <Text style={styles.avatarText}>
                        {user?.full_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || '?'}
                    </Text>
                </View>
                <Text style={[styles.name, { color: theme.text }]}>
                    {user?.full_name || 'User'}
                </Text>
                <Text style={[styles.email, { color: theme.textSecondary }]}>
                    {user?.email || 'No email provided'}
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Settings & Info</Text>

                <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <View style={styles.row}>
                        <Ionicons name="person-outline" size={20} color={theme.textMuted} style={styles.icon} />
                        <Text style={[styles.rowText, { color: theme.text }]}>Role</Text>
                        <Text style={[styles.rowValue, { color: theme.textSecondary }]}>
                            {user?.role || 'Inspector'}
                        </Text>
                    </View>
                    <View style={[styles.divider, { backgroundColor: theme.border }]} />
                    <View style={styles.row}>
                        <Ionicons name="shield-checkmark-outline" size={20} color={theme.textMuted} style={styles.icon} />
                        <Text style={[styles.rowText, { color: theme.text }]}>Account Status</Text>
                        <Text style={[styles.rowValue, { color: theme.textSecondary }]}>
                            {user?.is_active ? 'Active' : 'Inactive'}
                        </Text>
                    </View>
                </View>
            </View>

            <TouchableOpacity 
                style={[styles.logoutButton, { backgroundColor: theme.danger }]}
                onPress={handleLogout}
            >
                <Ionicons name="log-out-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.logoutText}>Log Out</Text>
            </TouchableOpacity>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    header: {
        alignItems: 'center',
        paddingVertical: 32,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    avatarText: {
        fontSize: 32,
        color: '#fff',
        fontWeight: 'bold',
    },
    name: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    email: {
        fontSize: 14,
    },
    section: {
        marginTop: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    card: {
        borderWidth: 1,
        borderRadius: 12,
        overflow: 'hidden',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    icon: {
        marginRight: 12,
    },
    rowText: {
        flex: 1,
        fontSize: 15,
    },
    rowValue: {
        fontSize: 15,
    },
    divider: {
        height: 1,
        marginLeft: 48,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        marginTop: 40,
    },
    logoutText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
