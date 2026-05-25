import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

const REGISTRATION_TYPES = [
  { key: 'restaurant', label: 'Restaurant', icon: 'restaurant' },
  { key: 'it_firm', label: 'IT Firm', icon: 'laptop' },
  { key: 'plumbing', label: 'Plumbing', icon: 'water' },
  { key: 'electrical', label: 'Electrical', icon: 'flash' },
  { key: 'cleaning', label: 'Cleaning', icon: 'sparkles' },
  { key: 'other', label: 'Other', icon: 'ellipsis-horizontal' },
];

export default function RegistrationTypeScreen({ route }) {
  const { register } = useAuth();
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const { basicDetails } = route.params || {};

  const handleSubmit = async () => {
    if (!selected) return Alert.alert('Error', 'Please select a registration type');
    setLoading(true);
    try {
      const payload = {
        name: basicDetails.name,
        email: basicDetails.email,
        phone: basicDetails.phone,
        password: basicDetails.password,
        dateOfBirth: basicDetails.dateOfBirth || undefined,
        bloodGroup: basicDetails.bloodGroup || undefined,
        emergencyContact: basicDetails.emergencyContact || undefined,
        registrationType: selected,
        aadhaar: {
          number: basicDetails.aadhaarNumber || undefined,
        },
        pan: {
          number: basicDetails.panNumber || undefined,
        },
        currentAddress: {
          apartment: basicDetails.apartment,
          state: basicDetails.state,
          city: basicDetails.city,
          country: basicDetails.country,
          zip: basicDetails.zip,
        },
        sameAsCurrentAddress: basicDetails.sameAsCurrent,
        ...(basicDetails.sameAsCurrent ? {} : {
          permanentAddress: {
            apartment: basicDetails.permanentApartment,
            state: basicDetails.permanentState,
            city: basicDetails.permanentCity,
            country: basicDetails.permanentCountry,
            zip: basicDetails.permanentZip,
          },
        }),
        bankDetails: {
          bankName: basicDetails.bankName,
          accountNumber: basicDetails.accountNumber,
          ifscCode: basicDetails.ifscCode,
        },
      };
      await register(payload);
    } catch (err) {
      Alert.alert('Registration Failed', err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose Your Category</Text>
      <Text style={styles.subtitle}>Select the type of vendor you are</Text>

      <View style={styles.grid}>
        {REGISTRATION_TYPES.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={[styles.card, selected === item.key && styles.cardSelected]}
            onPress={() => setSelected(item.key)}
          >
            <Ionicons
              name={item.icon}
              size={36}
              color={selected === item.key ? '#FF6B35' : '#999'}
            />
            <Text style={[styles.cardLabel, selected === item.key && styles.cardLabelSelected]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.submitBtn, !selected && styles.submitBtnDisabled]}
        onPress={handleSubmit}
        disabled={loading || !selected}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitBtnText}>Register</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 24, justifyContent: 'center' },
  title: { fontSize: 26, fontWeight: '800', color: '#FF6B35', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 32, marginTop: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: {
    width: '48%', padding: 20, borderRadius: 12, borderWidth: 2, borderColor: '#eee',
    alignItems: 'center', marginBottom: 16, backgroundColor: '#fafafa',
  },
  cardSelected: { borderColor: '#FF6B35', backgroundColor: '#FFF5F0' },
  cardLabel: { marginTop: 10, fontSize: 14, fontWeight: '600', color: '#666' },
  cardLabelSelected: { color: '#FF6B35' },
  submitBtn: { backgroundColor: '#FF6B35', borderRadius: 8, paddingVertical: 16, alignItems: 'center', marginTop: 24 },
  submitBtnDisabled: { opacity: 0.5 },
  submitBtnText: { color: '#fff', fontSize: 18, fontWeight: '700' },
});
