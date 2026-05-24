import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import DashboardScreen from '../screens/Dashboard/DashboardScreen';
import RestaurantListScreen from '../screens/Food/RestaurantListScreen';
import FoodSearchScreen from '../screens/Food/FoodSearchScreen';
import HomeServicesHomeScreen from '../screens/HomeServices/HomeServicesHomeScreen';
import HomeServicesSearchScreen from '../screens/HomeServices/HomeServicesSearchScreen';
import PlumbingDetailsScreen from '../screens/HomeServices/PlumbingDetailsScreen';
import ServiceOrderSummaryScreen from '../screens/HomeServices/ServiceOrderSummaryScreen';

// Food Flow detail screens
import MenuScreen from '../screens/Food/MenuScreen';
import CartScreen from '../screens/Food/CartScreen';
import CheckoutScreen from '../screens/Food/CheckoutScreen';

const Stack = createStackNavigator();

export default function HomeStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DashboardHome" component={DashboardScreen} />
      <Stack.Screen name="FoodHome" component={RestaurantListScreen} />
      <Stack.Screen name="FoodSearch" component={FoodSearchScreen} />
      <Stack.Screen name="FoodMenu" component={MenuScreen} />
      <Stack.Screen name="FoodCart" component={CartScreen} />
      <Stack.Screen name="FoodCheckout" component={CheckoutScreen} />
      <Stack.Screen name="HomeServicesHome" component={HomeServicesHomeScreen} />
      <Stack.Screen name="HomeServicesSearch" component={HomeServicesSearchScreen} />
      <Stack.Screen name="PlumbingDetails" component={PlumbingDetailsScreen} />
      <Stack.Screen name="ServiceOrderSummary" component={ServiceOrderSummaryScreen} />
    </Stack.Navigator>
  );
}
