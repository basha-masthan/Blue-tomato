import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [vendor, setVendor] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('vendor_token');
      if (storedToken) {
        setToken(storedToken);
        const res = await authAPI.getMe();
        setVendor(res.data.vendor);
      }
    } catch {
      await AsyncStorage.removeItem('vendor_token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, phone, password) => {
    const res = await authAPI.login({ email, phone, password });
    const { token: newToken, vendor: vendorData } = res.data;
    await AsyncStorage.setItem('vendor_token', newToken);
    setToken(newToken);
    setVendor(vendorData);
    return vendorData;
  };

  const register = async (data) => {
    const res = await authAPI.register(data);
    const { token: newToken, vendor: vendorData } = res.data;
    await AsyncStorage.setItem('vendor_token', newToken);
    setToken(newToken);
    setVendor(vendorData);
    return vendorData;
  };

  const logout = async () => {
    await AsyncStorage.removeItem('vendor_token');
    setToken(null);
    setVendor(null);
  };

  const refreshVendor = async () => {
    const res = await authAPI.getMe();
    setVendor(res.data.vendor);
    return res.data.vendor;
  };

  return (
    <AuthContext.Provider value={{
      vendor, token, loading,
      login, register, logout, refreshVendor,
      isAuthenticated: !!token,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
