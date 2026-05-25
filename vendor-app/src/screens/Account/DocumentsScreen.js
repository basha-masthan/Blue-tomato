import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator,
  Image, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { profileAPI, uploadAPI } from '../../api/client';

export default function DocumentsScreen() {
  const [docs, setDocs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [panFront, setPanFront] = useState('');
  const [aadhaarFront, setAadhaarFront] = useState('');
  const [aadhaarBack, setAadhaarBack] = useState('');

  useEffect(() => {
    loadDocs();
  }, []);

  const loadDocs = async () => {
    try {
      const res = await profileAPI.getDocuments();
      setDocs(res.data);
      if (res.data.aadhaar?.frontImage) setAadhaarFront(res.data.aadhaar.frontImage);
      if (res.data.aadhaar?.backImage) setAadhaarBack(res.data.aadhaar.backImage);
      if (res.data.pan?.image) setPanFront(res.data.pan.image);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async (setter) => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Please allow access to your photo library');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setter(base64Image);
    }
  };

  const uploadImage = async (base64Image, folder) => {
    try {
      const res = await uploadAPI.uploadBase64(base64Image, folder);
      return res.data.url;
    } catch (error) {
      console.error('Upload failed:', error);
      return null;
    }
  };

  const handleSaveDocuments = async () => {
    setUploading(true);
    try {
      let panUrl = docs?.pan?.image || '';
      let aadhaarFrontUrl = docs?.aadhaar?.frontImage || '';
      let aadhaarBackUrl = docs?.aadhaar?.backImage || '';

      if (panFront && !panFront.startsWith('http')) {
        const url = await uploadImage(panFront, 'documents');
        if (url) panUrl = url;
      }

      if (aadhaarFront && !aadhaarFront.startsWith('http')) {
        const url = await uploadImage(aadhaarFront, 'documents');
        if (url) aadhaarFrontUrl = url;
      }

      if (aadhaarBack && !aadhaarBack.startsWith('http')) {
        const url = await uploadImage(aadhaarBack, 'documents');
        if (url) aadhaarBackUrl = url;
      }

      await profileAPI.updateDocuments({
        pan: { image: panUrl, number: docs?.pan?.number },
        aadhaar: { frontImage: aadhaarFrontUrl, backImage: aadhaarBackUrl, number: docs?.aadhaar?.number },
      });

      Alert.alert('Success', 'Documents uploaded successfully');
      loadDocs();
    } catch { Alert.alert('Error', 'Failed to upload documents'); }
    finally { setUploading(false); }
  };

  if (loading) {
    return <View style={styles.loader}><ActivityIndicator size="large" color="#FF6B35" /></View>;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>My Documents</Text>

      <Text style={styles.sectionTitle}>PAN Card</Text>
      <View style={styles.docCard}>
        <Text style={styles.docLabel}>Upload PAN Card Photo</Text>
        <TouchableOpacity style={styles.imageUploadArea} onPress={() => pickImage(setPanFront)}>
          {panFront ? (
            <Image source={{ uri: panFront }} style={styles.uploadedImage} />
          ) : (
            <View style={styles.uploadPlaceholder}>
              <Ionicons name="camera-outline" size={36} color="#999" />
              <Text style={styles.uploadText}>Tap to upload</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Aadhaar Card</Text>
      <View style={styles.docCard}>
        <Text style={styles.docLabel}>Front Side</Text>
        <TouchableOpacity style={styles.imageUploadArea} onPress={() => pickImage(setAadhaarFront)}>
          {aadhaarFront ? (
            <Image source={{ uri: aadhaarFront }} style={styles.uploadedImage} />
          ) : (
            <View style={styles.uploadPlaceholder}>
              <Ionicons name="camera-outline" size={36} color="#999" />
              <Text style={styles.uploadText}>Tap to upload</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.docCard}>
        <Text style={styles.docLabel}>Back Side</Text>
        <TouchableOpacity style={styles.imageUploadArea} onPress={() => pickImage(setAadhaarBack)}>
          {aadhaarBack ? (
            <Image source={{ uri: aadhaarBack }} style={styles.uploadedImage} />
          ) : (
            <View style={styles.uploadPlaceholder}>
              <Ionicons name="camera-outline" size={36} color="#999" />
              <Text style={styles.uploadText}>Tap to upload</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.saveBtn, uploading && styles.saveBtnDisabled]}
        onPress={handleSaveDocuments}
        disabled={uploading}
      >
        {uploading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>Save Documents</Text>}
      </TouchableOpacity>

      {docs?.kycComplete && (
        <View style={styles.verifiedBadge}>
          <Ionicons name="checkmark-circle" size={20} color="#34C759" />
          <Text style={styles.verifiedText}>KYC Verified</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 24 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '800', color: '#333', marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#333', marginTop: 16, marginBottom: 8 },
  docCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, elevation: 2 },
  docLabel: { fontSize: 14, fontWeight: '600', color: '#555', marginBottom: 12 },
  imageUploadArea: { borderRadius: 8, overflow: 'hidden' },
  uploadPlaceholder: { height: 150, backgroundColor: '#f9f9f9', borderWidth: 2, borderStyle: 'dashed', borderColor: '#ddd', borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  uploadText: { color: '#999', marginTop: 8, fontSize: 13 },
  uploadedImage: { width: '100%', height: 150, borderRadius: 8 },
  saveBtn: { backgroundColor: '#FF6B35', borderRadius: 8, paddingVertical: 16, alignItems: 'center', marginTop: 16 },
  saveBtnDisabled: { opacity: 0.6 },
  saveText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 16 },
  verifiedText: { color: '#34C759', fontWeight: '600', marginLeft: 6 },
});