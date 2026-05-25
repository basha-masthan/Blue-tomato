import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function SignupScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleSignup = async () => {
    if (!name || !email || !password || !phone) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      await register({ name, email, phone, password });
      // App.js handles navigation once authenticated
    } catch (error) {
      Alert.alert('Signup Failed', error.response?.data?.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content}>
          
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Create Account</Text>
          </View>

          <View style={styles.formContainer}>
            <TextInput
              style={styles.input}
              placeholder="Name"
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity style={styles.signupButton} onPress={handleSignup} disabled={loading}>
            <Text style={styles.signupButtonText}>{loading ? 'Creating Account...' : 'Sign up'}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.signIn}>
            <Text style={styles.signInText}>Already have an account? <Text style={styles.signInTextBold}>Sign in</Text></Text>
          </TouchableOpacity>

          <View style={styles.socialContainer}>
            <Text style={styles.orText}>Or continue with</Text>
            <View style={styles.socialIcons}>
              <TouchableOpacity style={styles.socialButton}>
                <Text style={styles.socialButtonText}>G</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton}>
                <Text style={styles.socialButtonText}>F</Text>
              </TouchableOpacity>
            </View>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    paddingVertical: 40,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A2B4C',
  },
  formContainer: {
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    color: '#333',
  },
  signupButton: {
    backgroundColor: '#1A2B4C',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  signupButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  signIn: {
    alignItems: 'center',
    marginBottom: 40,
  },
  signInText: {
    color: '#666',
    fontSize: 14,
  },
  signInTextBold: {
    fontWeight: 'bold',
    color: '#1A2B4C',
  },
  socialContainer: {
    alignItems: 'center',
  },
  orText: {
    color: '#666',
    marginBottom: 20,
  },
  socialIcons: {
    flexDirection: 'row',
    gap: 16,
  },
  socialButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F5F7FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
});
