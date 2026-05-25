import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeStackNavigator from './HomeStackNavigator';
import AccountNavigator from './AccountNavigator';
import OrdersScreen from '../screens/Orders/OrdersScreen';

const PlaceholderScreen = ({ name }) => (
  <View style={styles.container}>
    <Ionicons
      name={name === 'Search' ? 'search-outline' : 'receipt-outline'}
      size={60}
      color="#CBD5E1"
    />
    <Text style={styles.text}>{name}</Text>
    <Text style={styles.subtitle}>Coming soon in the next phase!</Text>
  </View>
);

const SearchScreen = () => <PlaceholderScreen name="Search" />;

const Tab = createBottomTabNavigator();

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#DC2626',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarShowLabel: true,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarStyle: styles.tabBar,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Search') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'Orders') {
            iconName = focused ? 'receipt' : 'receipt-outline';
          } else if (route.name === 'Account') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return (
            <View style={[styles.iconWrapper, focused && styles.iconWrapperActive]}>
              <Ionicons name={iconName} size={size - 2} color={color} />
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeStackNavigator} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Orders" component={OrdersScreen} />
      <Tab.Screen name="Account" component={AccountNavigator} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    gap: 8,
  },
  text: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
  },
  subtitle: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '500',
  },
  tabBar: {
    height: 72,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingBottom: 10,
    paddingTop: 8,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 12,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  iconWrapper: {
    width: 40,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  iconWrapperActive: {
    backgroundColor: '#FEF2F2',
  },
});
