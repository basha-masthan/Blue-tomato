import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function PlumbingDetailsScreen({ navigation }) {
  const [cartCount, setCartCount] = useState(0);

  const subServices = [
    { id: '1', name: 'Bathroom Repair', desc: 'All bathroom repair, 24/7 Available, Extra Charges.', rating: '4.7', reviews: '1234', price: '599' },
    { id: '2', name: 'Tap Installation', desc: 'Leaking taps, kitchen faucets, bathroom taps assembly.', rating: '4.6', reviews: '230', price: '199' },
    { id: '3', name: 'Basin Repair', desc: 'Wash basin, kitchen sink installation & repair.', rating: '4.8', reviews: '562', price: '349' },
  ];

  const handleAdd = () => {
    setCartCount(prev => prev + 1);
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
        
        <Text style={styles.headerTitle}>Home Services</Text>

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
        {/* Plumbing text label */}
        <Text style={styles.plumbingTitle}>Plumbing</Text>

        {/* Custom Hero Banner matching the plumber illustration exactly */}
        <View style={styles.heroBanner}>
          <View style={styles.heroLeft}>
            <Text style={styles.heroSub}>EXPERTS IN PLUMBING</Text>
            <Text style={styles.heroMain}>PLUMBER{"\n"}SERVICE</Text>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>24/7 EMERGENCY</Text>
            </View>
          </View>
          
          <View style={styles.heroRight}>
            <View style={styles.plumberEmojiCircle}>
              <Ionicons name="construct" size={54} color="#FFF" />
            </View>
            <Ionicons name="sparkles" size={16} color="#FFF" style={styles.sparkle} />
          </View>
        </View>

        {/* Our Services heading */}
        <Text style={styles.sectionHeader}>Our Services</Text>

        {/* Sub-services list */}
        <View style={styles.servicesContainer}>
          {subServices.map((item) => (
            <View key={item.id} style={styles.subCard}>
              <View style={styles.subCardContent}>
                <Text style={styles.subName}>{item.name}</Text>
                <Text style={styles.subDesc}>{item.desc}</Text>
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={14} color="#F59E0B" />
                  <Text style={styles.ratingText}>
                    {item.rating} <Text style={styles.reviewsText}>({item.reviews} reviews)</Text>
                  </Text>
                </View>
              </View>

              <View style={styles.subCardAction}>
                <Text style={styles.subPrice}>₹{item.price}</Text>
                <TouchableOpacity 
                  style={styles.addBtn}
                  activeOpacity={0.8}
                  onPress={handleAdd}
                >
                  <Ionicons name="add" size={16} color="#FFF" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

      </ScrollView>

      {/* Floating cart view footer overlay matching Screen 4 exactly */}
      <View style={styles.floatingFooter}>
        <TouchableOpacity 
          style={styles.viewCartBtn}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('ServiceOrderSummary')}
        >
          <View style={styles.cartIconWrapper}>
            <Ionicons name="cart" size={20} color="#1E3A8A" />
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartCount}</Text>
              </View>
            )}
          </View>
          <Text style={styles.viewCartText}>View Cart</Text>
          <Ionicons name="chevron-forward" size={18} color="#FFF" />
        </TouchableOpacity>
      </View>

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
    paddingBottom: 120, // offset for floating footer
  },
  plumbingTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginHorizontal: 20,
    marginTop: 20,
    letterSpacing: 0.5,
  },
  heroBanner: {
    backgroundColor: '#3B82F6', // Beautiful vibrant blue plumber backdrop
    borderRadius: 24,
    marginHorizontal: 20,
    marginTop: 14,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    overflow: 'hidden',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  heroLeft: {
    flex: 1.2,
    justifyContent: 'space-between',
    gap: 10,
  },
  heroSub: {
    color: '#93C5FD',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  heroMain: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFF',
    lineHeight: 28,
  },
  heroBadge: {
    backgroundColor: '#EFF6FF',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  heroBadgeText: {
    color: '#3B82F6',
    fontSize: 9,
    fontWeight: '800',
  },
  heroRight: {
    flex: 0.8,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  plumberEmojiCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sparkle: {
    position: 'absolute',
    top: 10,
    right: 15,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginHorizontal: 20,
    marginTop: 28,
    marginBottom: 14,
  },
  servicesContainer: {
    paddingHorizontal: 20,
    gap: 16,
  },
  subCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 2,
  },
  subCardContent: {
    flex: 1,
    gap: 4,
    marginRight: 10,
  },
  subName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  subDesc: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 15,
    fontWeight: '500',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D97706',
  },
  reviewsText: {
    color: '#64748B',
    fontWeight: '500',
  },
  subCardAction: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 60,
  },
  subPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  addBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1E3A8A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 8,
  },
  viewCartBtn: {
    backgroundColor: '#1E293B',
    height: 56,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  cartIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFF',
  },
  cartBadgeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '800',
  },
  viewCartText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
    marginRight: 24, // offset the cart icon size
  },
});
