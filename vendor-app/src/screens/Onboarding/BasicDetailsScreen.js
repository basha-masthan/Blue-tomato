import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';

export default function BasicDetailsScreen({ navigation, route }) {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: '',
    dateOfBirth: '', bloodGroup: '', emergencyContact: '',
    aadhaarNumber: '', panNumber: '',
    apartment: '', state: '', city: '', country: 'India', zip: '',
    permanentApartment: '', permanentState: '', permanentCity: '', permanentCountry: 'India', permanentZip: '',
    sameAsCurrent: false,
    bankName: '', accountNumber: '', ifscCode: '',
  });

  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const handleNext = () => {
    const { name, email, phone, password, confirmPassword } = form;
    if (!name || !email || !phone || !password) {
      return Alert.alert('Error', 'Please fill all required fields');
    }
    if (password !== confirmPassword) {
      return Alert.alert('Error', 'Passwords do not match');
    }
    navigation.navigate('RegistrationType', { basicDetails: form });
  };

  const renderField = (label, key, opts = {}) => (
    <View style={styles.fieldContainer}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={form[key]}
        onChangeText={(v) => update(key, v)}
        placeholder={opts.placeholder || ''}
        keyboardType={opts.keyboard || 'default'}
        secureTextEntry={opts.secure}
        autoCapitalize={opts.capitalize || 'none'}
      />
    </View>
  );

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Vendor Registration</Text>
        <Text style={styles.sectionTitle}>Personal Details</Text>
        {renderField('Full Name *', 'name', { capitalize: 'words' })}
        {renderField('Email *', 'email', { keyboard: 'email-address' })}
        {renderField('Phone *', 'phone', { keyboard: 'phone-pad' })}
        {renderField('Password *', 'password', { secure: true })}
        {renderField('Confirm Password *', 'confirmPassword', { secure: true })}
        {renderField('Date of Birth', 'dateOfBirth', { placeholder: 'YYYY-MM-DD' })}
        {renderField('Blood Group', 'bloodGroup', { placeholder: 'e.g. O+', capitalize: 'characters' })}
        {renderField('Emergency Contact', 'emergencyContact', { keyboard: 'phone-pad' })}

        <Text style={styles.sectionTitle}>Aadhaar Card</Text>
        {renderField('Aadhaar Number', 'aadhaarNumber', { keyboard: 'number-pad' })}

        <Text style={styles.sectionTitle}>PAN Card</Text>
        {renderField('PAN Number', 'panNumber', { capitalize: 'characters' })}

        <Text style={styles.sectionTitle}>Current Address</Text>
        {renderField('Apartment / Street', 'apartment', { capitalize: 'words' })}
        {renderField('State', 'state', { capitalize: 'words' })}
        {renderField('City', 'city', { capitalize: 'words' })}
        {renderField('Country', 'country', { capitalize: 'words' })}
        {renderField('ZIP Code', 'zip', { keyboard: 'number-pad' })}

        <TouchableOpacity
          style={styles.checkboxRow}
          onPress={() => update('sameAsCurrent', !form.sameAsCurrent)}
        >
          <View style={[styles.checkbox, form.sameAsCurrent && styles.checkboxActive]} />
          <Text style={styles.checkboxLabel}>Same as Permanent Address</Text>
        </TouchableOpacity>

        {!form.sameAsCurrent && (
          <>
            <Text style={styles.sectionTitle}>Permanent Address</Text>
            {renderField('Apartment / Street', 'permanentApartment', { capitalize: 'words' })}
            {renderField('State', 'permanentState', { capitalize: 'words' })}
            {renderField('City', 'permanentCity', { capitalize: 'words' })}
            {renderField('Country', 'permanentCountry', { capitalize: 'words' })}
            {renderField('ZIP Code', 'permanentZip', { keyboard: 'number-pad' })}
          </>
        )}

        <Text style={styles.sectionTitle}>Bank Details</Text>
        {renderField('Bank Name', 'bankName', { capitalize: 'words' })}
        {renderField('Account Number', 'accountNumber', { keyboard: 'number-pad' })}
        {renderField('IFSC Code', 'ifscCode', { capitalize: 'characters' })}

        <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
          <Text style={styles.nextBtnText}>Next →</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#fff' },
  container: { padding: 24, paddingBottom: 48 },
  title: { fontSize: 26, fontWeight: '800', color: '#FF6B35', marginBottom: 24, textAlign: 'center' },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#333', marginTop: 24, marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 6 },
  fieldContainer: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 4 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 15 },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 12 },
  checkbox: { width: 22, height: 22, borderRadius: 4, borderWidth: 2, borderColor: '#FF6B35', marginRight: 10 },
  checkboxActive: { backgroundColor: '#FF6B35' },
  checkboxLabel: { fontSize: 14, color: '#333' },
  nextBtn: { backgroundColor: '#FF6B35', borderRadius: 8, paddingVertical: 16, alignItems: 'center', marginTop: 32 },
  nextBtnText: { color: '#fff', fontSize: 18, fontWeight: '700' },
});
