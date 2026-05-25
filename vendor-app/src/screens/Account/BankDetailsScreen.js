import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { profileAPI } from '../../api/client';

export default function BankDetailsScreen() {
  const [form, setForm] = useState({
    bankName: '', accountHolderName: '', accountNumber: '',
    branchName: '', ifscCode: '', pinCode: '',
  });
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    loadBankDetails();
  }, []);

  const loadBankDetails = async () => {
    try {
      const res = await profileAPI.getBankDetails();
      if (res.data.bankDetails) {
        setForm(res.data.bankDetails);
      }
    } catch {
      // use defaults
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await profileAPI.updateBankDetails(form);
      Alert.alert('Success', 'Bank details updated');
      setEditMode(false);
    } catch {
      Alert.alert('Error', 'Failed to update');
    }
  };

  if (loading) {
    return <View style={styles.loader}><ActivityIndicator size="large" color="#FF6B35" /></View>;
  }

  const renderField = (label, key) => (
    <>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, !editMode && styles.inputDisabled]}
        value={form[key]}
        onChangeText={(v) => setForm(prev => ({ ...prev, [key]: v }))}
        editable={editMode}
      />
    </>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Bank Details</Text>
      {renderField('Bank Name', 'bankName')}
      {renderField('Account Holder Name', 'accountHolderName')}
      {renderField('Account Number', 'accountNumber')}
      {renderField('Branch Name', 'branchName')}
      {renderField('IFSC / BSC Code', 'ifscCode')}
      {renderField('Pin Code', 'pinCode')}

      {editMode ? (
        <View style={styles.btnRow}>
          <TouchableOpacity style={styles.cancelBtn} onPress={() => { setEditMode(false); loadBankDetails(); }}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveText}>Save</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.editBtn} onPress={() => setEditMode(true)}>
          <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 24 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '800', color: '#333', marginBottom: 24 },
  label: { fontSize: 13, fontWeight: '600', color: '#555', marginTop: 12, marginBottom: 4 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 14, fontSize: 15, backgroundColor: '#fff' },
  inputDisabled: { backgroundColor: '#f9f9f9', color: '#999' },
  editBtn: { backgroundColor: '#FF6B35', borderRadius: 8, paddingVertical: 14, alignItems: 'center', marginTop: 32 },
  editText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  btnRow: { flexDirection: 'row', gap: 12, marginTop: 32 },
  cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', alignItems: 'center' },
  cancelText: { color: '#666', fontWeight: '600' },
  saveBtn: { flex: 1, paddingVertical: 14, borderRadius: 8, backgroundColor: '#FF6B35', alignItems: 'center' },
  saveText: { color: '#fff', fontWeight: '700' },
});
