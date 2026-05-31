import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, SafeAreaView, ScrollView, 
  TextInput, TouchableOpacity, ActivityIndicator, Dimensions 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import client from '../../api/client';
import { API_CONFIG } from '../../config';

const { width } = Dimensions.get('window');

export default function HomeServicesHomeScreen({ route, navigation }) {
  const { categoryId } = route.params || {};
  const [subcategories, setSubcategories] = useState([]);
  const [categoryName, setCategoryName] = useState('Home');
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    fetchData();
  }, [categoryId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const baseURL = API_CONFIG.BASE_URL.replace('/api/user', '/api');
      
      // Fetch subcategories
      let url = `${baseURL}/public/subcategories`;
      if (categoryId) url += `?categoryId=${categoryId}`;
      
      const [subRes, catRes] = await Promise.all([
        client.get(url),
        client.get(`${baseURL}/public/categories`)
      ]);
      
      setSubcategories(subRes.data?.subcategories || subRes.data || []);
      
      // Find category name
      const categories = catRes.data?.categories || catRes.data || [];
      const currentCat = categories.find(c => c._id === categoryId);
      if (currentCat && currentCat.name) {
        setCategoryName(currentCat.name);
      }
    } catch (error) {
      console.log('Error fetching data:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    navigation.navigate('HomeServicesSearch');
  };

  const handleAddToCart = () => {
    setCartCount(prev => prev + 1);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header bar */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButtonCircle} 
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Ionicons name="chevron-back" size={20} color="#1E293B" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Home Services</Text>

        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.headerIconBtn} activeOpacity={0.7}>
            <Ionicons name="notifications-outline" size={22} color="#1E293B" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIconBtn} activeOpacity={0.7}>
            <Ionicons name="cart-outline" size={22} color="#1E293B" />
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        {/* Subheader Deliver/Search Address */}
        <View style={styles.subheader}>
          <View style={styles.searchingNear}>
            <Ionicons name="compass" size={16} color="#2563EB" />
            <Text style={styles.subheaderText}>
              SEARCHING NEAR <Text style={styles.boldText}>Halal Lab office</Text>
            </Text>
          </View>
          <TouchableOpacity>
            <Text style={styles.editText}>Edit ❯</Text>
          </TouchableOpacity>
        </View>

        {/* Search Input bar */}
        <View style={styles.searchSection}>
          <TouchableOpacity 
            style={styles.searchContainer}
            activeOpacity={0.9}
            onPress={handleSearch}
          >
            <Ionicons name="search-outline" size={20} color="#9CA3AF" style={styles.searchIcon} />
            <Text style={styles.searchPlaceholder}>Search for plumbing, electrician...</Text>
          </TouchableOpacity>
        </View>

        {/* Dynamic Category Name Header */}
        <Text style={styles.pageTitle}>{categoryName}</Text>

        {/* Beautiful Urban Company Style Banner */}
        <View style={styles.bannerContainer}>
          <View style={styles.bannerContent}>
            <Text style={styles.bannerSubtitle}>EXPERTS IN {categoryName.toUpperCase()}</Text>
            <Text style={styles.bannerTitle}>{categoryName.toUpperCase()}{'\n'}SERVICE</Text>
            <View style={styles.emergencyBadge}>
              <Text style={styles.emergencyText}>24/7 EMERGENCY</Text>
            </View>
          </View>
          <View style={styles.bannerIconContainer}>
            <Ionicons name="build" size={50} color="#FFF" style={{ opacity: 0.9 }} />
            <Ionicons name="sparkles" size={20} color="#FFF" style={styles.sparkleIcon} />
          </View>
          {/* Decorative Circle */}
          <View style={styles.decorativeCircle} />
        </View>

        {/* Subcategories Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>OUR SERVICES</Text>
          
          {loading ? (
            <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 40 }} />
          ) : subcategories.length === 0 ? (
            <Text style={styles.emptyText}>No services found for this category.</Text>
          ) : (
            <View style={styles.servicesList}>
              {subcategories.map((item, index) => (
                <View key={item._id || index} style={styles.serviceCard}>
                  <View style={styles.serviceCardHeader}>
                    <Text style={styles.serviceCardTitle}>{item.name}</Text>
                    <Text style={styles.serviceCardPrice}>
                      ₹{item.basePrice || '299'}
                    </Text>
                  </View>
                  
                  <Text style={styles.serviceCardDesc} numberOfLines={2}>
                    {item.description || `Professional ${item.name} service, 24/7 Available.`}
                  </Text>
                  
                  <View style={styles.serviceCardFooter}>
                    <View style={styles.ratingContainer}>
                      <Ionicons name="star" size={14} color="#F59E0B" />
                      <Text style={styles.ratingScore}>4.7</Text>
                      <Text style={styles.ratingCount}>(1234 reviews)</Text>
                    </View>
                    
                    <TouchableOpacity 
                      style={styles.addButton}
                      onPress={handleAddToCart}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="add" size={20} color="#FFF" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* View Cart Sticky Button */}
      {cartCount > 0 && (
        <View style={styles.stickyCartContainer}>
          <TouchableOpacity 
            style={styles.viewCartButton} 
            activeOpacity={0.9}
            onPress={() => navigation.navigate('ServiceOrderSummary')}
          >
            <View style={styles.cartIconWrapper}>
              <Ionicons name="cart" size={20} color="#1E293B" />
            </View>
            <Text style={styles.viewCartText}>View Cart</Text>
            <Ionicons name="chevron-forward" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC', // light gray background
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#FFF',
    height: 60,
  },
  backButtonCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerIcons: { 
    flexDirection: 'row', 
    gap: 12 
  },
  headerIconBtn: {
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -5,
    right: -8,
    backgroundColor: '#EF4444',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  cartBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingBottom: 100, // Space for sticky cart button
  },
  subheader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  searchingNear: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  subheaderText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  boldText: {
    color: '#0F172A',
    fontWeight: '800',
  },
  editText: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '700',
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#FFF',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchPlaceholder: {
    color: '#9CA3AF',
    fontSize: 15,
    flex: 1,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 12,
  },
  bannerContainer: {
    marginHorizontal: 20,
    backgroundColor: '#3B82F6', // Beautiful blue
    borderRadius: 20,
    padding: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  bannerContent: {
    flex: 1,
    zIndex: 2,
  },
  bannerSubtitle: {
    color: '#DBEAFE',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 6,
  },
  bannerTitle: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '900',
    lineHeight: 32,
    marginBottom: 16,
  },
  emergencyBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  emergencyText: {
    color: '#2563EB',
    fontSize: 10,
    fontWeight: '800',
  },
  bannerIconContainer: {
    zIndex: 2,
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: 80,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 40,
  },
  sparkleIcon: {
    position: 'absolute',
    top: 5,
    right: 5,
  },
  decorativeCircle: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.06)',
    top: -50,
    right: -50,
    zIndex: 1,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#64748B',
    paddingHorizontal: 20,
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  servicesList: {
    paddingHorizontal: 20,
    gap: 16,
  },
  serviceCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  serviceCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  serviceCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
    paddingRight: 12,
  },
  serviceCardPrice: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
  },
  serviceCardDesc: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 16,
  },
  serviceCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingScore: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F59E0B',
  },
  ratingCount: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1E3A8A', // Dark blue plus button
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1E3A8A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  emptyText: {
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 40,
    fontSize: 15,
  },
  stickyCartContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    zIndex: 10,
  },
  viewCartButton: {
    backgroundColor: '#0F172A', // Dark slate almost black
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  cartIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewCartText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
    flex: 1,
    textAlign: 'center',
    paddingRight: 16,
  }
});
