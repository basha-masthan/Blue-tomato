import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, TextInput, StyleSheet, FlatList,
  RefreshControl, Alert, Modal, ScrollView, Image, ActivityIndicator,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { serviceAPI, uploadAPI } from '../../api/client';

const SERVICE_CATEGORIES = [
  { key: 'All', label: 'All', icon: 'grid' },
  { key: 'Plumbing', label: 'Plumbing', icon: 'water' },
  { key: 'Electrical', label: 'Electrical', icon: 'flash' },
  { key: 'Cleaning', label: 'Cleaning', icon: 'sparkles' },
  { key: 'Carpentry', label: 'Carpentry', icon: 'hammer' },
  { key: 'Painting', label: 'Painting', icon: 'color-palette' },
  { key: 'Appliance Repair', label: 'Appliance', icon: 'build' },
];

export default function ServiceListingScreen() {
  const [items, setItems] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [editMode, setEditMode] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newService, setNewService] = useState({
    name: '',
    category: '',
    description: '',
    priceFrom: '',
    priceTo: '',
    image: '',
  });

  const fetchItems = useCallback(async () => {
    try {
      const category = selectedCategory === 'All' ? undefined : selectedCategory;
      const res = await serviceAPI.getAll(category);
      setItems(res.data.services);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchItems();
    setRefreshing(false);
  };

  const handleToggle = async (id) => {
    try {
      await serviceAPI.toggle(id);
      fetchItems();
    } catch { Alert.alert('Error', 'Failed to toggle'); }
  };

  const handleDelete = async (id) => {
    Alert.alert(
      'Delete Service',
      'Are you sure you want to delete this service?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await serviceAPI.delete(id);
              fetchItems();
            } catch { Alert.alert('Error', 'Failed to delete'); }
          },
        },
      ]
    );
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Please allow access to your photo library');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setNewService(prev => ({ ...prev, image: base64Image }));
    }
  };

  const uploadImage = async (base64Image) => {
    try {
      const res = await uploadAPI.uploadBase64(base64Image, 'services');
      return res.data.url;
    } catch (error) {
      console.error('Upload failed:', error);
      return null;
    }
  };

  const handleAdd = async () => {
    if (!newService.name) return Alert.alert('Error', 'Service name is required');

    setUploading(true);
    try {
      let imageUrl = '';
      if (newService.image) {
        const uploadedUrl = await uploadImage(newService.image);
        if (uploadedUrl) imageUrl = uploadedUrl;
      }

      await serviceAPI.create({
        name: newService.name,
        category: newService.category,
        description: newService.description,
        priceFrom: newService.priceFrom ? parseFloat(newService.priceFrom) : undefined,
        priceTo: newService.priceTo ? parseFloat(newService.priceTo) : undefined,
        image: imageUrl,
        type: 'service',
      });

      setShowAddModal(false);
      setNewService({ name: '', category: '', description: '', priceFrom: '', priceTo: '', image: '' });
      fetchItems();
      Alert.alert('Success', 'Service added successfully');
    } catch { Alert.alert('Error', 'Failed to add service'); }
    finally { setUploading(false); }
  };

  const renderCategoryChip = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryChip,
        selectedCategory === item.key && styles.categoryChipActive,
      ]}
      onPress={() => setSelectedCategory(item.key)}
      activeOpacity={0.7}
    >
      <Ionicons
        name={item.icon}
        size={16}
        color={selectedCategory === item.key ? '#fff' : '#6B7280'}
      />
      <Text
        style={[
          styles.categoryText,
          selectedCategory === item.key && styles.categoryTextActive,
        ]}
      >
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  const renderServiceItem = ({ item }) => (
    <View style={[styles.serviceItem, !item.isAvailable && styles.serviceItemUnavailable]}>
      <View style={styles.serviceImageContainer}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.serviceImage} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="construct-outline" size={28} color="#D1D5DB" />
          </View>
        )}
        {!item.isAvailable && (
          <View style={styles.unavailableBadge}>
            <Text style={styles.unavailableText}>Unavailable</Text>
          </View>
        )}
      </View>

      <View style={styles.serviceContent}>
        <View style={styles.serviceHeader}>
          <Text style={styles.serviceName}>{item.name}</Text>
          {item.category && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{item.category}</Text>
            </View>
          )}
        </View>
        {item.description && (
          <Text style={styles.serviceDescription} numberOfLines={2}>{item.description}</Text>
        )}
        <View style={styles.serviceFooter}>
          <View>
            {item.priceFrom && item.priceTo ? (
              <Text style={styles.priceRange}>
                ₹{item.priceFrom?.toLocaleString()} - ₹{item.priceTo?.toLocaleString()}
              </Text>
            ) : item.price ? (
              <Text style={styles.servicePrice}>₹{item.price.toLocaleString()}</Text>
            ) : (
              <Text style={styles.priceLabel}>Price on request</Text>
            )}
          </View>
          {editMode ? (
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => handleDelete(item._id)}
            >
              <Ionicons name="trash-outline" size={20} color="#EF4444" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                styles.toggleBtn,
                item.isAvailable ? styles.toggleOn : styles.toggleOff,
              ]}
              onPress={() => handleToggle(item._id)}
            >
              <View
                style={[
                  styles.toggleKnob,
                  item.isAvailable ? styles.knobRight : styles.knobLeft,
                ]}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Services</Text>
        <TouchableOpacity
          style={[styles.editButton, editMode && styles.editButtonActive]}
          onPress={() => setEditMode(!editMode)}
        >
          <Text style={[styles.editText, editMode && styles.editTextActive]}>
            {editMode ? 'Done' : 'Edit'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Category Filter */}
      <FlatList
        data={SERVICE_CATEGORIES}
        renderItem={renderCategoryChip}
        keyExtractor={(item) => item.key}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryList}
      />

      {/* Service Items */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      ) : (
        <FlatList
          data={items}
          renderItem={renderServiceItem}
          keyExtractor={(item) => item._id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={items.length === 0 ? styles.emptyContainer : styles.serviceList}
          ListEmptyComponent={
            <View style={styles.emptyContent}>
              <Ionicons name="build-outline" size={60} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>No services yet</Text>
              <Text style={styles.emptySubtitle}>
                Add your first service to get started
              </Text>
            </View>
          }
        />
      )}

      {/* Add Button */}
      {!editMode && (
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setShowAddModal(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={28} color="#fff" />
          <Text style={styles.addBtnText}>Add Service</Text>
        </TouchableOpacity>
      )}

      {/* Add Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAddModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.modalOverlay}>
            <ScrollView
              style={styles.modal}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add New Service</Text>
                <TouchableOpacity
                  onPress={() => setShowAddModal(false)}
                  style={styles.closeBtn}
                >
                  <Ionicons name="close" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>

              {/* Image Picker */}
              <TouchableOpacity
                style={styles.imagePickerContainer}
                onPress={pickImage}
                activeOpacity={0.8}
              >
                {newService.image ? (
                  <Image source={{ uri: newService.image }} style={styles.pickedImage} />
                ) : (
                  <View style={styles.imagePickerPlaceholder}>
                    <Ionicons name="camera" size={40} color="#9CA3AF" />
                    <Text style={styles.imagePickerText}>Add Photo</Text>
                    <Text style={styles.imagePickerSubtext}>Tap to upload</Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Form Fields */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Service Name *</Text>
                <TextInput
                  style={styles.input}
                  value={newService.name}
                  onChangeText={(v) => setNewService(p => ({ ...p, name: v }))}
                  placeholder="e.g. Pipe Repair"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Category</Text>
                <View style={styles.categorySelector}>
                  {SERVICE_CATEGORIES.slice(1).map((cat) => (
                    <TouchableOpacity
                      key={cat.key}
                      style={[
                        styles.categoryOption,
                        newService.category === cat.key && styles.categoryOptionActive,
                      ]}
                      onPress={() => setNewService(p => ({ ...p, category: cat.key }))}
                    >
                      <Ionicons
                        name={cat.icon}
                        size={14}
                        color={newService.category === cat.key ? '#fff' : '#6B7280'}
                      />
                      <Text
                        style={[
                          styles.categoryOptionText,
                          newService.category === cat.key && styles.categoryOptionTextActive,
                        ]}
                      >
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Price Range</Text>
                <View style={styles.priceRow}>
                  <View style={styles.priceInputWrapper}>
                    <Text style={styles.priceLabel}>From</Text>
                    <View style={styles.priceInputContainer}>
                      <Text style={styles.currencySymbol}>₹</Text>
                      <TextInput
                        style={styles.priceInput}
                        value={newService.priceFrom}
                        onChangeText={(v) => setNewService(p => ({ ...p, priceFrom: v }))}
                        placeholder="0"
                        placeholderTextColor="#9CA3AF"
                        keyboardType="decimal-pad"
                      />
                    </View>
                  </View>
                  <View style={styles.priceInputWrapper}>
                    <Text style={styles.priceLabel}>To</Text>
                    <View style={styles.priceInputContainer}>
                      <Text style={styles.currencySymbol}>₹</Text>
                      <TextInput
                        style={styles.priceInput}
                        value={newService.priceTo}
                        onChangeText={(v) => setNewService(p => ({ ...p, priceTo: v }))}
                        placeholder="0"
                        placeholderTextColor="#9CA3AF"
                        keyboardType="decimal-pad"
                      />
                    </View>
                  </View>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={newService.description}
                  onChangeText={(v) => setNewService(p => ({ ...p, description: v }))}
                  placeholder="Describe your service..."
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setShowAddModal(false)}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.submitBtn, uploading && styles.btnDisabled]}
                  onPress={handleAdd}
                  disabled={uploading}
                >
                  {uploading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.submitText}>Add Service</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#fff',
  },
  title: { fontSize: 28, fontWeight: '800', color: '#1F2937' },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  editButtonActive: { backgroundColor: '#3B82F6' },
  editText: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  editTextActive: { color: '#fff' },

  // Category Filter
  categoryList: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#fff',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 6,
  },
  categoryChipActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  categoryText: { fontSize: 13, fontWeight: '600', color: '#6B7280' },
  categoryTextActive: { color: '#fff' },

  // Loading
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Empty State
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContent: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#6B7280', marginTop: 16 },
  emptySubtitle: { fontSize: 14, color: '#9CA3AF', marginTop: 4 },

  // Service List
  serviceList: { padding: 16 },

  // Service Item Card
  serviceItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 2,
  },
  serviceItemUnavailable: { opacity: 0.7 },
  serviceImageContainer: { width: 100, height: 100, position: 'relative' },
  serviceImage: { width: 100, height: 100 },
  imagePlaceholder: {
    width: 100,
    height: 100,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  unavailableBadge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 4,
    alignItems: 'center',
  },
  unavailableText: { color: '#fff', fontSize: 9, fontWeight: '700' },
  serviceContent: { flex: 1, padding: 12 },
  serviceHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  serviceName: { fontSize: 15, fontWeight: '700', color: '#1F2937', flex: 1 },
  categoryBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoryBadgeText: { fontSize: 10, color: '#3B82F6', fontWeight: '600' },
  serviceDescription: { fontSize: 12, color: '#6B7280', marginTop: 4 },
  serviceFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  priceRange: { fontSize: 14, fontWeight: '800', color: '#3B82F6' },
  servicePrice: { fontSize: 14, fontWeight: '800', color: '#3B82F6' },
  priceLabel: { fontSize: 12, color: '#9CA3AF', fontStyle: 'italic' },

  // Toggle Switch
  toggleBtn: {
    width: 44,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    padding: 2,
  },
  toggleOn: { backgroundColor: '#10B981' },
  toggleOff: { backgroundColor: '#E5E7EB' },
  toggleKnob: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#fff',
    elevation: 2,
  },
  knobRight: { alignSelf: 'flex-end' },
  knobLeft: { alignSelf: 'flex-start' },

  deleteBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Add Button
  addBtn: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 28,
    elevation: 4,
    gap: 8,
  },
  addBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  // Modal
  modalContainer: { flex: 1 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modal: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 22, fontWeight: '800', color: '#1F2937' },
  closeBtn: { padding: 4 },

  // Image Picker
  imagePickerContainer: { alignSelf: 'center', marginBottom: 20 },
  imagePickerPlaceholder: {
    width: 140,
    height: 140,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  imagePickerText: { color: '#6B7280', marginTop: 8, fontSize: 14, fontWeight: '600' },
  imagePickerSubtext: { color: '#9CA3AF', fontSize: 12, marginTop: 2 },
  pickedImage: { width: 140, height: 140, borderRadius: 16 },

  // Form
  formGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    backgroundColor: '#F9FAFB',
    color: '#1F2937',
  },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  categorySelector: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    gap: 6,
  },
  categoryOptionActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  categoryOptionText: { fontSize: 12, color: '#6B7280', fontWeight: '500' },
  categoryOptionTextActive: { color: '#fff' },
  priceRow: { flexDirection: 'row', gap: 12 },
  priceInputWrapper: { flex: 1 },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    paddingLeft: 14,
    marginTop: 4,
  },
  currencySymbol: { fontSize: 16, fontWeight: '600', color: '#6B7280' },
  priceInput: {
    flex: 1,
    padding: 14,
    fontSize: 15,
    color: '#1F2937',
  },

  // Actions
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 24, marginBottom: 16 },
  cancelBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  cancelText: { color: '#6B7280', fontWeight: '600', fontSize: 15 },
  submitBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
  },
  btnDisabled: { opacity: 0.6 },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});