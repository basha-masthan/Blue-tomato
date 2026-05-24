import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';

const paymentMethods = [
  { id: '1', name: 'Credit card', icon: '💳' },
  { id: '2', name: 'UPI', icon: '📱' },
  { id: '3', name: 'Cash On Delivery', icon: '💵' },
];

export default function CheckoutScreen({ navigation }) {
  const [selectedPayment, setSelectedPayment] = useState('1');
  const total = 247.0;

  const handlePay = () => {
    // Navigate to Order Confirmation
    // For now we just go back or to a success screen
    navigation.navigate('Home'); // Placeholder
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment</Text>
          <View style={styles.paymentContainer}>
            {paymentMethods.map((method) => (
              <TouchableOpacity 
                key={method.id} 
                style={styles.paymentOption}
                onPress={() => setSelectedPayment(method.id)}
              >
                <View style={styles.paymentOptionLeft}>
                  <Text style={styles.paymentIcon}>{method.icon}</Text>
                  <Text style={styles.paymentName}>{method.name}</Text>
                </View>
                <View style={[styles.radioCircle, selectedPayment === method.id && styles.radioCircleSelected]}>
                  {selectedPayment === method.id && <View style={styles.radioInner} />}
                </View>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.paymentOption}>
              <View style={styles.paymentOptionLeft}>
                <Text style={styles.paymentIcon}>⋯</Text>
                <Text style={styles.paymentName}>All other methods</Text>
              </View>
              <Text style={{ color: '#666' }}>></Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.deliverToLabel}>📍 DELIVER TO</Text>
          <View style={styles.addressCard}>
            <View style={styles.addressIconContainer}>
              <Text style={styles.addressIcon}>🏠</Text>
            </View>
            <View style={styles.addressInfo}>
              <Text style={styles.addressType}>Home</Text>
              <Text style={styles.addressText}>ABC Town, XYZ City, State 123 India</Text>
            </View>
          </View>
        </View>

        <View style={styles.totalSection}>
          <Text style={styles.totalLabel}>Total :</Text>
          <Text style={styles.totalValue}>₹ {total.toFixed(2)}</Text>
        </View>

      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.payButton} onPress={handlePay}>
          <Text style={styles.payButtonText}>Pay</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: '#FFF',
  },
  backButton: { padding: 8 },
  backIcon: { fontSize: 24, color: '#1A2B4C' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A2B4C' },
  scrollContent: { paddingBottom: 100 },
  section: { paddingHorizontal: 20, marginTop: 24 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1A2B4C', marginBottom: 16 },
  paymentContainer: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  paymentOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  paymentOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentIcon: { fontSize: 20, marginRight: 16 },
  paymentName: { fontSize: 15, color: '#333' },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleSelected: {
    borderColor: '#1A2B4C',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#1A2B4C',
  },
  deliverToLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  addressCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  addressIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F5F7FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  addressIcon: { fontSize: 20 },
  addressInfo: { flex: 1 },
  addressType: { fontSize: 16, fontWeight: 'bold', color: '#1A2B4C', marginBottom: 4 },
  addressText: { fontSize: 14, color: '#666', lineHeight: 20 },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 40,
  },
  totalLabel: { fontSize: 18, fontWeight: 'bold', color: '#1A2B4C' },
  totalValue: { fontSize: 18, fontWeight: 'bold', color: '#4CAF50' },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    padding: 20,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  payButton: {
    backgroundColor: '#E53935',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  payButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});
