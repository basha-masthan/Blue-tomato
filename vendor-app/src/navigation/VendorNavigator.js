import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../context/AuthContext';

import LoginScreen from '../screens/Auth/LoginScreen';
import BasicDetailsScreen from '../screens/Onboarding/BasicDetailsScreen';
import RegistrationTypeScreen from '../screens/Onboarding/RegistrationTypeScreen';

import DashboardScreen from '../screens/Dashboard/DashboardScreen';
import PendingOrdersScreen from '../screens/Orders/PendingOrdersScreen';
import ProcessingOrdersScreen from '../screens/Orders/ProcessingOrdersScreen';
import CompletedOrdersScreen from '../screens/Orders/CompletedOrdersScreen';

import AccountScreen from '../screens/Account/AccountScreen';
import ProfileScreen from '../screens/Account/ProfileScreen';
import BankDetailsScreen from '../screens/Account/BankDetailsScreen';
import DocumentsScreen from '../screens/Account/DocumentsScreen';
import OrderHistoryScreen from '../screens/Account/OrderHistoryScreen';
import TransactionsScreen from '../screens/Account/TransactionsScreen';

import MenuScreen from '../screens/Menu/MenuScreen';
import ServiceListingScreen from '../screens/Menu/ServiceListingScreen';
import SettingsScreen from '../screens/Settings/SettingsScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const OrdersStack = createStackNavigator();
const AccountStack = createStackNavigator();
const MenuStack = createStackNavigator();

function OrdersNavigator() {
  return (
    <OrdersStack.Navigator screenOptions={{ headerShown: false }}>
      <OrdersStack.Screen name="PendingOrders" component={PendingOrdersScreen} />
      <OrdersStack.Screen name="ProcessingOrders" component={ProcessingOrdersScreen} />
      <OrdersStack.Screen name="CompletedOrders" component={CompletedOrdersScreen} />
    </OrdersStack.Navigator>
  );
}

function AccountNavigator() {
  return (
    <AccountStack.Navigator screenOptions={{ headerShown: false }}>
      <AccountStack.Screen name="AccountHome" component={AccountScreen} />
      <AccountStack.Screen name="Profile" component={ProfileScreen} />
      <AccountStack.Screen name="BankDetails" component={BankDetailsScreen} />
      <AccountStack.Screen name="Documents" component={DocumentsScreen} />
      <AccountStack.Screen name="OrderHistory" component={OrderHistoryScreen} />
      <AccountStack.Screen name="Transactions" component={TransactionsScreen} />
      <AccountStack.Screen name="Settings" component={SettingsScreen} />
    </AccountStack.Navigator>
  );
}

function MenuNavigator() {
  return (
    <MenuStack.Navigator screenOptions={{ headerShown: false }}>
      <MenuStack.Screen name="MenuHome" component={MenuScreen} />
      <MenuStack.Screen name="ServiceListing" component={ServiceListingScreen} />
    </MenuStack.Navigator>
  );
}

function getTabIcon(routeName, focused) {
  const icons = {
    Home: focused ? 'home' : 'home-outline',
    Orders: focused ? 'list' : 'list-outline',
    Menu: focused ? 'restaurant' : 'restaurant-outline',
    Services: focused ? 'briefcase' : 'briefcase-outline',
    Account: focused ? 'person' : 'person-outline',
  };
  return icons[routeName] || 'ellipse';
}

function MainTabs() {
  const { vendor } = useAuth();
  const isRestaurant = vendor?.registrationType === 'restaurant';

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => (
          <Ionicons name={getTabIcon(route.name, focused)} size={size} color={color} />
        ),
        tabBarActiveTintColor: '#FF6B35',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: { paddingBottom: 5, height: 60 },
      })}
    >
      <Tab.Screen name="Home" component={DashboardScreen} />
      <Tab.Screen name="Orders" component={OrdersNavigator} />
      {isRestaurant ? (
        <Tab.Screen name="Menu" component={MenuNavigator} />
      ) : (
        <Tab.Screen
          name="Services"
          component={ServiceListingScreen}
          options={{ tabBarLabel: 'Services' }}
        />
      )}
      <Tab.Screen name="Account" component={AccountNavigator} />
    </Tab.Navigator>
  );
}

export default function VendorNavigator() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="BasicDetails" component={BasicDetailsScreen} />
        <Stack.Screen name="RegistrationType" component={RegistrationTypeScreen} />
      </Stack.Navigator>
    );
  }

  return <MainTabs />;
}
