import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import HomeScreen from '../screens/HomeScreen';
import ShiftsScreen from '../screens/ShiftsScreen';
import StatsScreen from '../screens/StatsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import TasksListScreen from '../screens/TasksListScreen';
import CreateTaskTypeScreen from '../screens/CreateTaskTypeScreen';
import SetupRotationScreen from '../screens/SetupRotationScreen';

export type MainTabParamList = {
    Home: undefined;
    Shifts: undefined;
    Stats: undefined;
    Settings: undefined;
    TasksList: { householdId: string };
    CreateTaskType: { householdId: string };
    SetupRotation: {
        householdId: string;
        taskTypeId: string;
        taskTypeName: string;
    };
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainNavigator() {
    const theme = useTheme();

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: keyof typeof Ionicons.glyphMap = 'home';

                    if (route.name === 'Home') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'Shifts') {
                        iconName = focused ? 'calendar' : 'calendar-outline';
                    } else if (route.name === 'Stats') {
                        iconName = focused ? 'stats-chart' : 'stats-chart-outline';
                    } else if (route.name === 'Settings') {
                        iconName = focused ? 'settings' : 'settings-outline';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: theme.colors.textSecondary,
                tabBarStyle: {
                    backgroundColor: theme.colors.surface,
                    borderTopWidth: 1,
                    borderTopColor: theme.colors.border,
                    paddingBottom: 8,
                    paddingTop: 8,
                    height: 60,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '600',
                },
            })}
        >
            {/* Main Tabs - Visibili nella tab bar */}
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{ title: 'Home' }}
            />
            <Tab.Screen
                name="Shifts"
                component={ShiftsScreen}
                options={{ title: 'Turni' }}
            />
            <Tab.Screen
                name="Stats"
                component={StatsScreen}
                options={{ title: 'Statistiche' }}
            />
            <Tab.Screen
                name="Settings"
                component={SettingsScreen}
                options={{ title: 'Impostazioni' }}
            />

            {/* Hidden Screens - Non visibili nella tab bar */}
            <Tab.Screen
                name="TasksList"
                component={TasksListScreen}
                options={{
                    tabBarButton: () => null, // Nasconde dalla tab bar
                    tabBarStyle: { display: 'none' }, // Nasconde la tab bar quando questa schermata è attiva
                }}
            />
            <Tab.Screen
                name="CreateTaskType"
                component={CreateTaskTypeScreen}
                options={{
                    tabBarButton: () => null,
                    tabBarStyle: { display: 'none' },
                }}
            />
            <Tab.Screen
                name="SetupRotation"
                component={SetupRotationScreen}
                options={{
                    tabBarButton: () => null,
                    tabBarStyle: { display: 'none' },
                }}
            />
        </Tab.Navigator>
    );
}