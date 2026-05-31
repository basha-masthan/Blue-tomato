import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, FlatList,
  RefreshControl, Alert, Image, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { serviceAPI } from '../../api/client';

export default function ServiceListingScreen() {
  const [items, setItems] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    try {
      // Fetch dynamic subcategories mapped from the backend
      const res = await serviceAPI.getAll();
      setItems(res.data.services || []);
    } catch {
      Alert.alert('Error', 'Failed to fetch services.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchItems();
    setRefreshing(false);
  };

  const handleToggle = async (id) => {
    // Optimistic update
    setItems(currentItems => 
      currentItems.map(item => 
        item._id === id ? { ...item, isAvailable: !item.isAvailable } : item
      )
    );
    try {
      const res = await serviceAPI.toggle(id);
      // Ensure backend state
      setItems(currentItems => 
        currentItems.map(item => 
          item._id === id ? { ...item, isAvailable: res.data.isAvailable } : item
        )
      );
    } catch { 
      Alert.alert('Error', 'Failed to toggle availability');
      // Revert on error
      fetchItems();
    }
  };

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
            {item.price ? (
              <Text style={styles.servicePrice}>₹{item.price.toLocaleString()}</Text>
            ) : (
              <Text style={styles.priceLabel}>Price on request</Text>
            )}
          </View>
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
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Services</Text>
        <Text style={styles.subtitle}>Select the services you offer</Text>
      </View>

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
              <Ionicons name="construct-outline" size={60} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>No services available</Text>
              <Text style={styles.emptySubtitle}>
                The admin hasn't added any services to your category yet.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  title: { fontSize: 28, fontWeight: '800', color: '#1F2937' },
  subtitle: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContent: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 20 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#6B7280', marginTop: 16 },
  emptySubtitle: { fontSize: 14, color: '#9CA3AF', marginTop: 8, textAlign: 'center' },
  serviceList: { padding: 16 },
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
  servicePrice: { fontSize: 14, fontWeight: '800', color: '#3B82F6' },
  priceLabel: { fontSize: 12, color: '#9CA3AF', fontStyle: 'italic' },
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
});