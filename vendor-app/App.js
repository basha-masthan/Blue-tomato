import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/context/AuthContext';
import { SocketProvider } from './src/context/SocketContext';
import VendorNavigator from './src/navigation/VendorNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <SocketProvider>
          <NavigationContainer>
            <VendorNavigator />
            <StatusBar style="dark" />
          </NavigationContainer>
        </SocketProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
