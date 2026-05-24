import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import RestaurantListScreen from '../screens/Food/RestaurantListScreen';
import MenuScreen from '../screens/Food/MenuScreen';
import CartScreen from '../screens/Food/CartScreen';
import CheckoutScreen from '../screens/Food/CheckoutScreen';

const Stack = createStackNavigator();

export default function FoodNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="RestaurantList" component={RestaurantListScreen} />
      <Stack.Screen name="Menu" component={MenuScreen} />
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
    </Stack.Navigator>
  );
}
