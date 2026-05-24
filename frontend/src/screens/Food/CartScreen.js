import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, TextInput, Alert, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function CartScreen({ navigation }) {
  const [quantities, setQuantities] = useState({ item1: 1, item2: 1 });
  const [instructions, setInstructions] = useState('');
  const [noContact, setNoContact] = useState(false);
  const [noCall, setNoCall] = useState(true);

  const cartItems = [
    { id: 'item1', name: 'Special Chicken Biryani', price: 299, isVeg: false },
    { id: 'item2', name: 'Paneer Makhani Butter', price: 249, isVeg: true },
  ];

  const handleIncrement = (id) => {
    setQuantities(prev => ({ ...prev, [id]: prev[id] + 1 }));
  };

  const handleDecrement = (id) => {
    setQuantities(prev => ({ 
      ...prev, 
      [id]: prev[id] > 0 ? prev[id] - 1 : 0 
    }));
  };

  const itemTotal = cartItems.reduce((sum, item) => sum + (item.price * quantities[item.id]), 0);
  const deliveryPartnerFee = 30; // represented as crossed out / FREE
  const taxesAndCharges = parseFloat((itemTotal * 0.05).toFixed(2)); // 5% GST
  const platformFee = itemTotal > 0 ? 5.00 : 0.00;
  const couponDiscount = itemTotal > 0 ? 50.00 : 0.00; // WELCOME50
  const grandTotal = itemTotal > 0 ? parseFloat((itemTotal + taxesAndCharges + platformFee - couponDiscount).toFixed(2)) : 0.00;

  const handlePlaceOrder = () => {
    if (grandTotal === 0) {
      Alert.alert('Empty Cart', 'Please add some items to your cart first.');
      return;
    }

    Alert.alert(
      'Order Placed Successfully!',
      'Your delicious food from Hotel Paradise is being prepared and will arrive in 25 mins.',
      [
        { 
          text: 'TRACK ORDER', 
          onPress: () => {
            // Pop back to top Dashboard
            navigation.popToTop();
          } 
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Zomato-style Header with delivery ETA and location details */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButtonCircle} 
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Ionicons name="chevron-back" size={20} color="#555" />
        </TouchableOpacity>
        
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Hotel Paradise</Text>
          <Text style={styles.headerSub}>Delivery in 20-25 mins • Srinagar</Text>
        </View>

        <TouchableOpacity style={styles.menuIconBtn}>
          <Ionicons name="ellipsis-vertical" size={20} color="#1E293B" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        {/* Swiggy-style Cart items list */}
        <View style={styles.cartItemsContainer}>
          {cartItems.map((item) => {
            const qty = quantities[item.id];
            if (qty === 0) return null;

            return (
              <View key={item.id} style={styles.itemRow}>
                {/* Veg/Non-veg box badge */}
                <View style={[styles.vegBadge, item.isVeg ? styles.vegBorder : styles.nonVegBorder]}>
                  <View style={[styles.vegDotSmall, item.isVeg ? styles.vegBg : styles.nonVegBg]} />
                </View>

                {/* Details */}
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemPrice}>₹{item.price * qty}</Text>
                </View>

                {/* Counter Selector */}
                <View style={styles.qtySelector}>
                  <TouchableOpacity 
                    style={styles.qtySelectorBtn} 
                    onPress={() => handleDecrement(item.id)}
                  >
                    <Ionicons name="remove" size={14} color="#DC2626" />
                  </TouchableOpacity>
                  <Text style={styles.qtyValue}>{qty}</Text>
                  <TouchableOpacity 
                    style={styles.qtySelectorBtn} 
                    onPress={() => handleIncrement(item.id)}
                  >
                    <Ionicons name="add" size={14} color="#DC2626" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}

          {itemTotal === 0 && (
            <View style={styles.emptyCartView}>
              <Ionicons name="basket-outline" size={54} color="#CBD5E1" />
              <Text style={styles.emptyCartText}>Your cart is empty.</Text>
            </View>
          )}

          {/* Cooking Instructions input */}
          {itemTotal > 0 && (
            <View style={styles.instructionsContainer}>
              <Ionicons name="restaurant-outline" size={16} color="#64748B" />
              <TextInput
                style={styles.instructionsInput}
                value={instructions}
                onChangeText={setInstructions}
                placeholder="Write cooking instructions (e.g. Make it spicy)"
                placeholderTextColor="#94A3B8"
              />
            </View>
          )}
        </View>

        {/* Coupons Banner */}
        {itemTotal > 0 && (
          <TouchableOpacity style={styles.couponCard} activeOpacity={0.85}>
            <Ionicons name="ticket-outline" size={22} color="#DC2626" />
            <View style={styles.couponDetails}>
              <Text style={styles.couponTitle}>WELCOME50 applied!</Text>
              <Text style={styles.couponDesc}>Coupon saved ₹50.00 on your order</Text>
            </View>
            <Text style={styles.couponLink}>Saved</Text>
          </TouchableOpacity>
        )}

        {/* Zomato Safety / No-Contact Delivery Cards */}
        {itemTotal > 0 && (
          <View style={styles.safetyContainer}>
            <Text style={styles.sectionTitle}>Delivery Preferences</Text>
            <View style={styles.safetyCard}>
              {/* Option 1 */}
              <View style={styles.safetyOption}>
                <Ionicons name="notifications-off-outline" size={20} color="#1E3A8A" />
                <View style={styles.safetyText}>
                  <Text style={styles.safetyOptionTitle}>Avoid calling before delivery</Text>
                  <Text style={styles.safetyOptionDesc}>Rider will knock or drop at gate</Text>
                </View>
                <Switch
                  value={noCall}
                  onValueChange={setNoCall}
                  trackColor={{ false: '#CBD5E1', true: '#BFDBFE' }}
                  thumbColor={noCall ? '#1E3A8A' : '#F1F5F9'}
                />
              </View>
              
              <View style={styles.safetyDivider} />

              {/* Option 2 */}
              <View style={styles.safetyOption}>
                <Ionicons name="home-outline" size={20} color="#1E3A8A" />
                <View style={styles.safetyText}>
                  <Text style={styles.safetyOptionTitle}>No-contact delivery</Text>
                  <Text style={styles.safetyOptionDesc}>Rider will leave package at your door</Text>
                </View>
                <Switch
                  value={noContact}
                  onValueChange={setNoContact}
                  trackColor={{ false: '#CBD5E1', true: '#BFDBFE' }}
                  thumbColor={noContact ? '#1E3A8A' : '#F1F5F9'}
                />
              </View>
            </View>
          </View>
        )}

        {/* Zomato-style Bill Detailed Invoice */}
        {itemTotal > 0 && (
          <View style={styles.billContainer}>
            <Text style={styles.sectionTitle}>Bill Detailed Invoice</Text>
            
            <View style={styles.billDetailsCard}>
              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Item Total</Text>
                <Text style={styles.billVal}>₹{itemTotal}</Text>
              </View>

              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Delivery Partner Fee</Text>
                <Text style={styles.billVal}>
                  <Text style={styles.crossedPrice}>₹{deliveryPartnerFee}</Text> <Text style={styles.freeText}>FREE</Text>
                </Text>
              </View>

              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Govt Taxes & Restaurant GST (5%)</Text>
                <Text style={styles.billVal}>₹{taxesAndCharges}</Text>
              </View>

              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Platform Fee</Text>
                <Text style={styles.billVal}>₹{platformFee.toFixed(2)}</Text>
              </View>

              <View style={[styles.billRow, styles.greenBg]}>
                <Text style={[styles.billLabel, styles.greenText]}>WELCOME50 Coupon Applied</Text>
                <Text style={[styles.billVal, styles.greenText]}>- ₹{couponDiscount.toFixed(2)}</Text>
              </View>

              <View style={styles.billDivider} />

              <View style={styles.billTotalRow}>
                <Text style={styles.billTotalLabel}>Grand Total</Text>
                <Text style={styles.billTotalVal}>₹{grandTotal}</Text>
              </View>
            </View>
          </View>
        )}

      </ScrollView>

      {/* Place Order Panel matching Swiggy/Zomato exactly */}
      {itemTotal > 0 && (
        <View style={styles.checkoutPanel}>
          <View style={styles.checkoutLeft}>
            <Text style={styles.checkoutTotalLabel}>Grand Total</Text>
            <Text style={styles.checkoutTotalVal}>₹{grandTotal}</Text>
            <Text style={styles.viewDetailedText}>View detailed bill ❯</Text>
          </View>
          <TouchableOpacity 
            style={styles.placeOrderBtn}
            activeOpacity={0.85}
            onPress={handlePlaceOrder}
          >
            <Text style={styles.placeOrderBtnText}>Place Order</Text>
            <Ionicons name="arrow-forward" size={16} color="#FFF" />
          </TouchableOpacity>
        </View>
      )}

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
  headerTitleContainer: {
    flex: 1,
    marginLeft: 16,
    gap: 2,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSub: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  menuIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 110, // offset for checkout panel
  },
  cartItemsContainer: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3,
    gap: 16,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
    paddingBottom: 12,
  },
  vegBadge: {
    width: 14,
    height: 14,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 2,
  },
  vegBorder: { borderColor: '#22C55E' },
  nonVegBorder: { borderColor: '#EF4444' },
  vegDotSmall: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  vegBg: { backgroundColor: '#22C55E' },
  nonVegBg: { backgroundColor: '#EF4444' },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
    gap: 2,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: '#334155',
  },
  qtySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 76,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
  },
  qtySelectorBtn: {
    padding: 4,
  },
  qtyValue: {
    fontSize: 12,
    fontWeight: '850',
    color: '#DC2626',
  },
  emptyCartView: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 10,
  },
  emptyCartText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
  },
  instructionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 48,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  instructionsInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 13,
    color: '#1E293B',
    fontWeight: '500',
    height: '100%',
  },
  couponCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 22,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  couponDetails: {
    flex: 1,
    marginLeft: 12,
    gap: 2,
  },
  couponTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#DC2626',
  },
  couponDesc: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  couponLink: {
    fontSize: 13,
    fontWeight: '800',
    color: '#22C55E',
  },
  safetyContainer: {
    marginHorizontal: 16,
    marginTop: 20,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginLeft: 4,
  },
  safetyCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  safetyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  safetyText: {
    flex: 1,
    marginLeft: 12,
    marginRight: 10,
    gap: 2,
  },
  safetyOptionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  safetyOptionDesc: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '500',
  },
  safetyDivider: {
    height: 1,
    backgroundColor: '#F8FAFC',
    marginVertical: 14,
  },
  billContainer: {
    marginHorizontal: 16,
    marginTop: 20,
    gap: 10,
  },
  billDetailsCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
    gap: 12,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  billLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  billVal: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '700',
  },
  crossedPrice: {
    textDecorationLine: 'line-through',
    color: '#94A3B8',
    marginRight: 4,
  },
  freeText: {
    color: '#22C55E',
    fontWeight: '800',
  },
  greenBg: {
    backgroundColor: '#ECFDF5',
    padding: 8,
    borderRadius: 10,
    marginHorizontal: -4,
  },
  greenText: {
    color: '#10B981',
    fontWeight: '700',
  },
  billDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 4,
  },
  billTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  billTotalLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  billTotalVal: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
  },
  checkoutPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 10,
  },
  checkoutLeft: {
    gap: 2,
  },
  checkoutTotalLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
  },
  checkoutTotalVal: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
  },
  viewDetailedText: {
    fontSize: 9,
    color: '#D97706',
    fontWeight: '800',
  },
  placeOrderBtn: {
    backgroundColor: '#DC2626', // Rich red Zomato/Swiggy order button
    borderRadius: 18,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 28,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  placeOrderBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
