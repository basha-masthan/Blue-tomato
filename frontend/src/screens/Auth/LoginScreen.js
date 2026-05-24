import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, Alert
} from 'react-native';

const DUMMY_USERS = [
  { name: 'Azad Khan',  email: 'azad@demo.com', password: 'demo123' },
  { name: 'Sara Ahmed', email: 'sara@demo.com', password: 'demo123' },
  { name: 'Raju Bhai',  email: 'raju@demo.com', password: 'demo123' },
];

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showDummy, setShowDummy] = useState(false);

  const handleLogin = () => {
    const match = DUMMY_USERS.find(u => u.email === email && u.password === password);
    if (match) {
      navigation.replace('Main');
    } else {
      Alert.alert('Login Failed', 'Invalid email or password. Use the demo credentials below.');
    }
  };

  const fillCredentials = (user) => {
    setEmail(user.email);
    setPassword(user.password);
    setShowDummy(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

          {/* Header */}
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Login here</Text>
            <Text style={styles.subtitle}>Welcome back! Let's make{"\n"}your day easier 👋</Text>
          </View>

          {/* Demo Credentials Banner */}
          <TouchableOpacity style={styles.demoBanner} onPress={() => setShowDummy(!showDummy)}>
            <Text style={styles.demoBannerText}>🔑 Tap to use Demo Credentials</Text>
            <Text style={styles.demoBannerArrow}>{showDummy ? '▲' : '▼'}</Text>
          </TouchableOpacity>

          {showDummy && (
            <View style={styles.dummyList}>
              {DUMMY_USERS.map((user, i) => (
                <TouchableOpacity key={i} style={styles.dummyCard} onPress={() => fillCredentials(user)}>
                  <View style={styles.dummyAvatar}>
                    <Text style={styles.dummyAvatarText}>{user.name[0]}</Text>
                  </View>
                  <View>
                    <Text style={styles.dummyName}>{user.name}</Text>
                    <Text style={styles.dummyEmail}>{user.email}</Text>
                    <Text style={styles.dummyPass}>Password: {user.password}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Form */}
          <View style={styles.formContainer}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#999"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholderTextColor="#999"
            />
            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot your password?</Text>
            </TouchableOpacity>
          </View>

          {/* Login Button */}
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Sign In</Text>
          </TouchableOpacity>

          {/* Create Account */}
          <TouchableOpacity onPress={() => navigation.navigate('Signup')} style={styles.createAccount}>
            <Text style={styles.createAccountText}>
              Don't have an account? <Text style={styles.createAccountBold}>Create new account</Text>
            </Text>
          </TouchableOpacity>

          {/* Social Login */}
          <View style={styles.socialContainer}>
            <View style={styles.dividerRow}>
              <View style={styles.divider} />
              <Text style={styles.orText}>Or continue with</Text>
              <View style={styles.divider} />
            </View>
            <View style={styles.socialIcons}>
              <TouchableOpacity style={styles.socialButton}>
                <Text style={styles.socialButtonText}>G</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton}>
                <Text style={styles.socialButtonText}>f</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* OTP Link */}
          <TouchableOpacity onPress={() => navigation.navigate('Otp')} style={styles.otpLink}>
            <Text style={styles.otpLinkText}>Login with Phone / OTP instead</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  headerContainer: { alignItems: 'center', marginBottom: 28 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1A2B4C', marginBottom: 10 },
  subtitle: { fontSize: 14, color: '#666', textAlign: 'center', lineHeight: 20 },

  // Demo Credentials
  demoBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  demoBannerText: { fontSize: 14, color: '#3730A3', fontWeight: '600' },
  demoBannerArrow: { fontSize: 12, color: '#3730A3' },
  dummyList: {
    backgroundColor: '#F8FAFF',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  dummyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E7FF',
  },
  dummyAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1A2B4C',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  dummyAvatarText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  dummyName: { fontSize: 14, fontWeight: 'bold', color: '#1A2B4C' },
  dummyEmail: { fontSize: 12, color: '#666' },
  dummyPass: { fontSize: 12, color: '#888' },

  // Form
  formContainer: { marginBottom: 20 },
  input: {
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    color: '#333',
  },
  forgotPassword: { alignSelf: 'flex-end' },
  forgotPasswordText: { color: '#666', fontSize: 14 },

  // Login Button
  loginButton: {
    backgroundColor: '#1A2B4C',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  loginButtonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },

  // Create Account
  createAccount: { alignItems: 'center', marginBottom: 28 },
  createAccountText: { color: '#666', fontSize: 14 },
  createAccountBold: { fontWeight: 'bold', color: '#1A2B4C' },

  // Social
  socialContainer: { alignItems: 'center', marginBottom: 20 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, width: '100%' },
  divider: { flex: 1, height: 1, backgroundColor: '#E2E8F0' },
  orText: { color: '#666', marginHorizontal: 12, fontSize: 14 },
  socialIcons: { flexDirection: 'row', gap: 16 },
  socialButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F5F7FA',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  socialButtonText: { fontSize: 22, fontWeight: 'bold', color: '#333' },

  // OTP
  otpLink: { alignItems: 'center' },
  otpLinkText: { color: '#1A2B4C', fontSize: 14, textDecorationLine: 'underline' },
});
