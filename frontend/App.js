import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AuthNavigator from './src/navigation/AuthNavigator';
import MainTabNavigator from './src/navigation/MainTabNavigator';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { CartProvider } from './src/context/CartContext';
import { SocketProvider } from './src/context/SocketContext';
import { ActivityIndicator, View } from 'react-native';

const RootStack = createStackNavigator();

function AppContent() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <RootStack.Screen name="Auth" component={AuthNavigator} />
      ) : (
        <RootStack.Screen name="Main" component={MainTabNavigator} />
      )}
    </RootStack.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <SocketProvider>
          <CartProvider>
            <NavigationContainer>
              <AppContent />
            </NavigationContainer>
          </CartProvider>
        </SocketProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
