import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { RootStackParamList, MainTabParamList } from './src/types';

// Import screens (to be created)
import OnboardingScreen from './src/screens/OnboardingScreen';
import HomeScreen from './src/screens/HomeScreen';
import BookingsScreen from './src/screens/BookingsScreen';
import MemoriesScreen from './src/screens/MemoriesScreen';
import BudgetScreen from './src/screens/BudgetScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import TripDetailsScreen from './src/screens/TripDetailsScreen';
import NewTripScreen from './src/screens/NewTripScreen';
import NewBookingScreen from './src/screens/NewBookingScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Bottom Tab Navigator
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#e5e7eb',
          borderTopWidth: 1,
          height: 70,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#137fec',
        tabBarInactiveTintColor: '#9ba8b8',
        tabBarLabelStyle: {
          fontSize: 9,
          fontWeight: '600',
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof MaterialIcons.glyphMap = 'home';

          switch (route.name) {
            case 'Home':
              iconName = 'flight';
              break;
            case 'Bookings':
              iconName = 'confirmation-number';
              break;
            case 'Memories':
              iconName = 'photo-library';
              break;
            case 'Budget':
              iconName = 'payments';
              break;
            case 'Profile':
              iconName = 'person';
              break;
          }

          return <MaterialIcons name={iconName} size={24} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: 'Viagens' }}
      />
      <Tab.Screen
        name="Bookings"
        component={BookingsScreen}
        options={{ tabBarLabel: 'Reservas' }}
      />
      <Tab.Screen
        name="Memories"
        component={MemoriesScreen}
        options={{ tabBarLabel: 'Memórias' }}
      />
      <Tab.Screen
        name="Budget"
        component={BudgetScreen}
        options={{ tabBarLabel: 'Orçamento' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Perfil' }}
      />
    </Tab.Navigator>
  );
}

// Main App with Stack Navigator
export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator
        initialRouteName="Onboarding"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="TripDetails" component={TripDetailsScreen} />
        <Stack.Screen name="NewTrip" component={NewTripScreen} />
        <Stack.Screen name="NewBooking" component={NewBookingScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
