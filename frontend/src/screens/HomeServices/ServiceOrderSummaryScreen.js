import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ServiceOrderSummaryScreen({ navigation }) {
  const handleBook = () => {
    Alert.alert(
      'Booking Confirmed!',
      'Your plumber has been scheduled successfully. You can track your booking in the Orders tab.',
      [
        { 
          text: 'OK', 
          onPress: () => {
            // Reset back to Dashboard
            navigation.popToTop();
          } 
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header bar matching other service stacks */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButtonCircle} 
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Ionicons name="chevron-back" size={20} color="#555" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Order Summary</Text>

        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.headerIconBtn} activeOpacity={0.7}>
            <Ionicons name="notifications-outline" size={22} color="#1E293B" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIconBtn} activeOpacity={0.7}>
            <Ionicons name="cart-outline" size={22} color="#1E293B" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        {/* Selected Service Card Row */}
        <View style={styles.selectedServiceCard}>
          <View style={styles.serviceRow}>
            {/* Cartoon plumbers icon on left */}
            <View style={styles.serviceIconBg}>
              <Ionicons name="build" size={28} color="#2563EB" />
            </View>
            <View style={styles.serviceDetails}>
              <Text style={styles.serviceName}>Bathroom Repair</Text>
              <Text style={styles.serviceDesc} numberOfLines={1}>
                All bathroom repair, 24/7 Available, Extra Charges.
              </Text>
            </View>
            <Text style={styles.servicePrice}>₹599</Text>
          </View>

          {/* Purple Schedule Button */}
          <TouchableOpacity style={styles.scheduleBtn} activeOpacity={0.8}>
            <Ionicons name="calendar-outline" size={16} color="#FFF" />
            <Text style={styles.scheduleText}>Schedule Service</Text>
          </TouchableOpacity>
        </View>

        {/* Invoice Price breakdown card */}
        <View style={styles.invoiceCard}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Order Total :</Text>
            <Text style={styles.priceValue}>₹ 599.00</Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>GST :</Text>
            <Text style={styles.priceValue}>₹ 29.00</Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Convenience Charges :</Text>
            <Text style={styles.priceValue}>₹ 5.00</Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Delivery Charges :</Text>
            <Text style={styles.priceValue}>₹ 47.00</Text>
          </View>

          {/* Highlighted green Discount */}
          <View style={styles.priceRow}>
            <Text style={[styles.priceLabel, styles.greenText]}>Discount : <Text style={styles.discountBadge}>10% off</Text></Text>
            <Text style={[styles.priceValue, styles.greenText]}>- ₹ 150.00</Text>
          </View>

          <View style={styles.divider} />

          {/* Highlighted final Total */}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total :</Text>
            <Text style={styles.totalValue}>₹ 247.00</Text>
          </View>
        </View>

        {/* Address Card */}
        <View style={styles.addressCard}>
          <View style={styles.addressHeader}>
            <Ionicons name="location" size={18} color="#2563EB" />
            <Text style={styles.addressLabel}>Deliver to</Text>
            <TouchableOpacity style={styles.editBtn} activeOpacity={0.7}>
              <Text style={styles.editText}>Edit ❯</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.addressDetails}>
            <Text style={styles.addressTitle}>Home</Text>
            <Text style={styles.addressBody}>ABC Town, xyZ City, State 123, India.</Text>
          </View>
        </View>

        {/* Book Button */}
        <TouchableOpacity 
          style={styles.bookBtn} 
          onPress={handleBook}
          activeOpacity={0.85}
        >
          <Text style={styles.bookBtnText}>Book</Text>
        </TouchableOpacity>

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
    backgroundColor: '#FFF',
    height: 80,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backButtonCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  headerIcons: { 
    flexDirection: 'row', 
    gap: 12 
  },
  headerIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  selectedServiceCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
    gap: 16,
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceIconBg: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  serviceDetails: {
    flex: 1,
    gap: 2,
    marginRight: 8,
  },
  serviceName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  serviceDesc: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  servicePrice: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  scheduleBtn: {
    backgroundColor: '#6366F1', // Beautiful purple scheduling button
    borderRadius: 14,
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  scheduleText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '750',
  },
  invoiceCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    marginHorizontal: 20,
    marginTop: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
    gap: 12,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  priceValue: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '700',
  },
  greenText: {
    color: '#10B981',
    fontWeight: '700',
  },
  discountBadge: {
    fontSize: 10,
    fontWeight: '800',
    backgroundColor: '#D1FAE5',
    color: '#10B981',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 4,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#10B981', // green final price total
  },
  addressCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
    gap: 10,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  addressLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
  },
  editBtn: {
    padding: 4,
  },
  editText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
  addressDetails: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    gap: 2,
  },
  addressTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  addressBody: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
    fontWeight: '500',
  },
  bookBtn: {
    backgroundColor: '#1E293B', // Beautiful deep dark blue booking button
    height: 56,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 28,
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  bookBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
