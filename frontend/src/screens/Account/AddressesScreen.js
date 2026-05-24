import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function AddressesScreen({ navigation }) {
  const [addresses, setAddresses] = useState([
    { id: '1', label: 'Home', address: 'Apartment 4B, Blue Oak Tower, Sector 62', city: 'Noida, UP - 201301', phone: '+91 98765 43210', icon: 'home-outline', isDefault: true },
    { id: '2', label: 'Office', address: 'Tech Park South, Block A, 5th Floor', city: 'Gurugram, HR - 122018', phone: '+91 98765 00000', icon: 'briefcase-outline', isDefault: false },
    { id: '3', label: 'Parents', address: '12, Greenfield Colony, Street No. 3', city: 'Faridabad, HR - 121003', phone: '+91 88888 88888', icon: 'heart-outline', isDefault: false }
  ]);

  const handleSetDefault = (id) => {
    setAddresses(addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === id
    })));
  };

  const handleDelete = (id, label) => {
    Alert.alert(
      'Delete Address',
      `Are you sure you want to delete "${label}" address?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => {
          setAddresses(addresses.filter(addr => addr.id !== id));
        }}
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header matching Account Screen */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButtonCircle} 
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Ionicons name="chevron-back" size={20} color="#555" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>My Addresses</Text>

        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.headerIconBtn} activeOpacity={0.7}>
            <Ionicons name="notifications-outline" size={22} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIconBtn} activeOpacity={0.7}>
            <Ionicons name="cart-outline" size={22} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* "+ Add New Address" Button */}
        <TouchableOpacity style={styles.addButton} activeOpacity={0.8}>
          <Ionicons name="add-circle" size={22} color="#FFF" />
          <Text style={styles.addButtonText}>Add New Address</Text>
        </TouchableOpacity>

        <Text style={styles.listLabel}>Saved Addresses</Text>

        {/* Address Cards List */}
        <View style={styles.addressList}>
          {addresses.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={[styles.addressCard, item.isDefault && styles.addressCardDefault]}
              activeOpacity={0.9}
              onPress={() => handleSetDefault(item.id)}
            >
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                  <View style={[styles.iconWrapper, item.isDefault && styles.iconWrapperDefault]}>
                    <Ionicons name={item.icon} size={20} color={item.isDefault ? '#1E3A8A' : '#64748B'} />
                  </View>
                  <Text style={styles.addressLabel}>{item.label}</Text>
                  {item.isDefault && (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultBadgeText}>DEFAULT</Text>
                    </View>
                  )}
                </View>

                {/* Checked icon if default */}
                {item.isDefault && (
                  <Ionicons name="checkmark-circle" size={22} color="#1E3A8A" />
                )}
              </View>

              <Text style={styles.addressDetails}>{item.address}</Text>
              <Text style={styles.cityDetails}>{item.city}</Text>
              <Text style={styles.phoneDetails}>Phone: {item.phone}</Text>

              {/* Action Buttons: Edit / Delete */}
              <View style={styles.cardFooter}>
                <TouchableOpacity style={styles.footerBtn} activeOpacity={0.7}>
                  <Ionicons name="create-outline" size={16} color="#64748B" />
                  <Text style={styles.footerBtnText}>Edit</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.footerBtn, styles.footerBtnDelete]} 
                  activeOpacity={0.7}
                  onPress={() => handleDelete(item.id, item.label)}
                >
                  <Ionicons name="trash-outline" size={16} color="#EF4444" />
                  <Text style={styles.footerBtnTextDelete}>Delete</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {addresses.length === 0 && (
          <View style={styles.emptyContainer}>
            <Ionicons name="map-outline" size={60} color="#CBD5E1" />
            <Text style={styles.emptyText}>No saved addresses found.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#93A8BA',
    height: 120,
    paddingTop: 10,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backButtonCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },
  headerIcons: { 
    flexDirection: 'row', 
    gap: 16 
  },
  headerIconBtn: {
    padding: 4,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1E3A8A',
    borderRadius: 18,
    height: 56,
    marginHorizontal: 24,
    marginTop: 20,
    shadowColor: '#1E3A8A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  listLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 24,
    marginBottom: 12,
    marginHorizontal: 24,
  },
  addressList: {
    paddingHorizontal: 24,
    gap: 16,
  },
  addressCard: {
    backgroundColor: '#FFF',
    borderRadius: 22,
    padding: 20,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  addressCardDefault: {
    borderColor: '#1E3A8A',
    backgroundColor: '#FFF',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrapperDefault: {
    backgroundColor: '#EFF6FF',
  },
  addressLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  defaultBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  defaultBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#1E3A8A',
  },
  addressDetails: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
    fontWeight: '500',
  },
  cityDetails: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
    fontWeight: '500',
    marginBottom: 4,
  },
  phoneDetails: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    marginTop: 16,
    paddingTop: 14,
    gap: 16,
  },
  footerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  footerBtnDelete: {
    marginLeft: 'auto',
  },
  footerBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  footerBtnTextDelete: {
    fontSize: 13,
    fontWeight: '600',
    color: '#EF4444',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    color: '#94A3B8',
    fontWeight: '600',
  },
});
