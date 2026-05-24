import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AccountScreen from '../screens/Account/AccountScreen';
import ProfileScreen from '../screens/Account/ProfileScreen';
import PaymentHistoryScreen from '../screens/Account/PaymentHistoryScreen';
import SettingsScreen from '../screens/Account/SettingsScreen';
import AddressesScreen from '../screens/Account/AddressesScreen';

const Stack = createStackNavigator();

export default function AccountNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AccountHome" component={AccountScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="PaymentHistory" component={PaymentHistoryScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Addresses" component={AddressesScreen} />
    </Stack.Navigator>
  );
}
