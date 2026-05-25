import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, Alert, ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState('email');

  const handleLogin = async () => {
    if (!password) return Alert.alert('Error', 'Password is required');
    if (loginMethod === 'email' && !email) return Alert.alert('Error', 'Email is required');
    if (loginMethod === 'phone' && !phone) return Alert.alert('Error', 'Phone is required');

    setLoading(true);
    try {
      await login(
        loginMethod === 'email' ? email : undefined,
        loginMethod === 'phone' ? phone : undefined,
        password
      );
    } catch (err) {
      Alert.alert('Login Failed', err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.header}>
        <Text style={styles.logo}>Blue Tomato</Text>
        <Text style={styles.subtitle}>Vendor Partner Portal</Text>
      </View>

      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[styles.toggleBtn, loginMethod === 'email' && styles.toggleActive]}
          onPress={() => setLoginMethod('email')}
        >
          <Text style={[styles.toggleText, loginMethod === 'email' && styles.toggleTextActive]}>Email</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, loginMethod === 'phone' && styles.toggleActive]}
          onPress={() => setLoginMethod('phone')}
        >
          <Text style={[styles.toggleText, loginMethod === 'phone' && styles.toggleTextActive]}>Phone</Text>
        </TouchableOpacity>
      </View>

      {loginMethod === 'email' ? (
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      ) : (
        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
      )}

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.loginBtnText}>Login</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('BasicDetails')}>
        <Text style={styles.registerText}>New Vendor? Register Here</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 24, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 40 },
  logo: { fontSize: 32, fontWeight: '800', color: '#FF6B35' },
  subtitle: { fontSize: 14, color: '#666', marginTop: 4 },
  toggleRow: { flexDirection: 'row', marginBottom: 20, borderRadius: 8, overflow: 'hidden', borderWidth: 1, borderColor: '#FF6B35' },
  toggleBtn: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  toggleActive: { backgroundColor: '#FF6B35' },
  toggleText: { fontWeight: '600', color: '#FF6B35' },
  toggleTextActive: { color: '#fff' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 14, fontSize: 16, marginBottom: 16 },
  loginBtn: { backgroundColor: '#FF6B35', borderRadius: 8, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  loginBtnText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  registerText: { textAlign: 'center', marginTop: 20, color: '#FF6B35', fontWeight: '600' },
});
