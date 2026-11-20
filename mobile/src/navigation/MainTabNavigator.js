/**
 * MainTabNavigator — bottom-tab navigation:
 * Home · Capture · History · Map · Profile
 * plus a native stack for the analysis/result/detail flows.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

import HomeScreen from '../screens/HomeScreen';
import CaptureScreen from '../screens/CaptureScreen';
import AnalysisScreen from '../screens/AnalysisScreen';
import ResultScreen from '../screens/ResultScreen';
import HistoryScreen from '../screens/HistoryScreen';
import InspectionDetailScreen from '../screens/InspectionDetailScreen';
import MapScreen from '../screens/MapScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

/** Stack hosting capture → analysis → result flow. */
function CaptureStack() {
    return (
        <Stack.Navigator>
            <Stack.Screen name="CaptureHome" component={CaptureScreen} options={{ title: 'New Inspection' }} />
            <Stack.Screen name="Analysis" component={AnalysisScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Result" component={ResultScreen} options={{ title: 'AI Result' }} />
        </Stack.Navigator>
    );
}

/** Stack for history + detail. */
function HistoryStack() {
    return (
        <Stack.Navigator>
            <Stack.Screen name="HistoryHome" component={HistoryScreen} options={{ title: 'Inspection History' }} />
            <Stack.Screen name="InspectionDetail" component={InspectionDetailScreen} options={{ title: 'Inspection Details' }} />
        </Stack.Navigator>
    );
}

const TAB_ICONS = {
    Home: 'home',
    Capture: 'camera',
    History: 'time',
    Map: 'map',
    Profile: 'person',
};

export default function MainTabNavigator() {
    const { theme } = useTheme();

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: true,
                tabBarActiveTintColor: theme.primary,
                tabBarInactiveTintColor: theme.textMuted,
                tabBarStyle: {
                    backgroundColor: theme.tabBar,
                    borderTopColor: theme.tabBarBorder,
                },
                headerStyle: { backgroundColor: theme.surface },
                headerTitleStyle: { color: theme.text, fontWeight: '800' },
                headerShadowVisible: false,
                tabBarIcon: ({ color, size, focused }) => (
                    <Ionicons
                        name={focused ? TAB_ICONS[route.name] : `${TAB_ICONS[route.name]}-outline`}
                        size={size}
                        color={color}
                    />
                ),
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Capture" component={CaptureStack} options={{ headerShown: false }} />
            <Tab.Screen name="History" component={HistoryStack} options={{ headerShown: false }} />
            <Tab.Screen name="Map" component={MapScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
}