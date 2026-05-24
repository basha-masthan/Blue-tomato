import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';

export default function OtpScreen({ navigation }) {
  const [step, setStep] = useState(1); // 1: Phone, 2: OTP
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);

  const handleGetOtp = () => {
    setStep(2);
  };

  const handleVerify = () => {
    // Navigate to MainApp after successful OTP
    navigation.replace('Main');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.content}>
        
        {step === 1 ? (
          <>
            <View style={styles.headerContainer}>
              <Text style={styles.title}>Login</Text>
              <Text style={styles.subtitle}>Please enter your phone number</Text>
            </View>

            <View style={styles.formContainer}>
              <View style={styles.phoneInputContainer}>
                <Text style={styles.countryCode}>🇮🇳 +91</Text>
                <TextInput
                  style={styles.phoneInput}
                  placeholder="Phone number"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            <TouchableOpacity style={styles.primaryButton} onPress={handleGetOtp}>
              <Text style={styles.primaryButtonText}>Get OTP</Text>
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
          </>
        ) : (
          <>
            <View style={styles.headerContainer}>
              <Text style={styles.title}>OTP</Text>
              <Text style={styles.subtitle}>Enter your OTP</Text>
            </View>

            <View style={styles.otpContainer}>
              {[0, 1, 2, 3].map((index) => (
                <TextInput
                  key={index}
                  style={styles.otpInput}
                  maxLength={1}
                  keyboardType="numeric"
                  value={otp[index]}
                  onChangeText={(val) => {
                    let newOtp = [...otp];
                    newOtp[index] = val;
                    setOtp(newOtp);
                  }}
                />
              ))}
            </View>

            <TouchableOpacity style={styles.primaryButton} onPress={handleVerify}>
              <Text style={styles.primaryButtonText}>Verify</Text>
            </TouchableOpacity>

            <View style={styles.resendContainer}>
              <Text style={styles.resendText}>Didn't receive OTP?</Text>
              <TouchableOpacity>
                <Text style={styles.resendLink}>Resend in 00:50</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

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
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  headerContainer: {
    alignItems: 'flex-start',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A2B4C',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  formContainer: {
    marginBottom: 24,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
  },
  countryCode: {
    fontSize: 16,
    color: '#333',
    marginRight: 10,
  },
  phoneInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  primaryButton: {
    backgroundColor: '#1A2B4C',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 40,
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
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
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 40,
  },
  otpInput: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#1A2B4C',
    textAlign: 'center',
    fontSize: 24,
    color: '#333',
  },
  resendContainer: {
    alignItems: 'center',
  },
  resendText: {
    color: '#666',
    fontSize: 14,
    marginBottom: 4,
  },
  resendLink: {
    color: '#1A2B4C',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
