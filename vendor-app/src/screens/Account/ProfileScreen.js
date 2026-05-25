import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { profileAPI } from '../../api/client';

export default function ProfileScreen() {
  const { vendor, refreshVendor } = useAuth();
  const [form, setForm] = useState({
    name: vendor?.name || '',
    email: vendor?.email || '',
    phone: vendor?.phone || '',
  });

  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    try {
      await profileAPI.update({ name: form.name });
      await refreshVendor();
      Alert.alert('Success', 'Profile updated');
    } catch {
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Edit Profile</Text>

      <Text style={styles.label}>Name</Text>
      <TextInput style={styles.input} value={form.name} onChangeText={(v) => update('name', v)} />

      <Text style={styles.label}>Email</Text>
      <TextInput style={[styles.input, styles.inputDisabled]} value={form.email} editable={false} />

      <Text style={styles.label}>Mobile No</Text>
      <TextInput style={[styles.input, styles.inputDisabled]} value={form.phone} editable={false} />

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveText}>Save Changes</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 24 },
  title: { fontSize: 22, fontWeight: '800', color: '#333', marginBottom: 24 },
  label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 4, marginTop: 12 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 14, fontSize: 15, backgroundColor: '#fff' },
  inputDisabled: { backgroundColor: '#f9f9f9', color: '#999' },
  saveBtn: { backgroundColor: '#FF6B35', borderRadius: 8, paddingVertical: 16, alignItems: 'center', marginTop: 32 },
  saveText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
