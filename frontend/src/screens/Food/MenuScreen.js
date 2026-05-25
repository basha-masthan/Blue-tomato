import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image, TextInput, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { vendorAPI } from '../../api/client';
import { useCart } from '../../context/CartContext';

export default function MenuScreen({ route, navigation }) {
  const { restaurantId, restaurantName } = route.params || {};
  const { cart, addItem, removeItem, cartTotal, cartCount } = useCart();
  
  const [vegOnly, setVegOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [restaurant, setRestaurant] = useState(null);
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (restaurantId) {
      fetchMenu();
    } else {
      setLoading(false);
    }
  }, [restaurantId]);

  const fetchMenu = async () => {
    try {
      setLoading(true);
      const res = await vendorAPI.getVendorDetails(restaurantId);
      setRestaurant(res.data.vendor);
      
      // Format backend services as dishes
      const formattedDishes = (res.data.services || []).map((svc) => ({
        id: svc._id,
        menuItemId: svc._id, // used by cart
        name: svc.name,
        price: svc.price,
        rating: '4.5',
        reviews: 100,
        desc: svc.description || '',
        isVeg: svc.isVeg || false,
        isBestseller: svc.isBestseller || false,
        category: svc.category || 'Main',
        thumb: svc.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
      }));
      
      setDishes(formattedDishes);
    } catch (err) {
      console.error('Error fetching menu:', err);
    } finally {
      setLoading(false);
    }
  };

  const getQty = (id) => {
    const item = cart.find(i => i.menuItemId === id);
    return item ? item.quantity : 0;
  };

  const filteredDishes = dishes.filter(dish => {
    const matchesVeg = !vegOnly || dish.isVeg;
    const matchesSearch = dish.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          dish.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesVeg && matchesSearch;
  });

  const displayRestaurant = restaurant || {
    name: restaurantName || 'Restaurant',
    cuisines: 'Various',
    currentAddress: { city: 'Local' },
    rating: '4.5',
    time: '30 mins',
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Dynamic Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButtonCircle} 
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Ionicons name="chevron-back" size={20} color="#555" />
        </TouchableOpacity>
        
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.headerIconBtn}>
            <Ionicons name="share-social-outline" size={20} color="#1E293B" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIconBtn}>
            <Ionicons name="heart-outline" size={20} color="#1E293B" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        {/* Restaurant Info Zomato Card */}
        <View style={styles.restaurantContainer}>
          <Text style={styles.restaurantName}>{displayRestaurant.name}</Text>
          <Text style={styles.cuisines}>{displayRestaurant.cuisines}</Text>
          <Text style={styles.address}>{displayRestaurant.currentAddress?.city || 'Local'}</Text>
          
          {/* Multi-Rating Box */}
          <View style={styles.ratingBox}>
            <View style={styles.ratingCol}>
              <View style={styles.ratingBadge}>
                <Text style={styles.ratingBadgeText}>{displayRestaurant.rating} ★</Text>
              </View>
              <View style={styles.ratingInfo}>
                <Text style={styles.ratingLabel}>Delivery</Text>
                <Text style={styles.ratingSub}>1k+ ratings</Text>
              </View>
            </View>
            
            <View style={styles.ratingDivider} />

            <View style={styles.ratingCol}>
              <View style={[styles.ratingBadge, styles.diningBadge]}>
                <Text style={styles.ratingBadgeText}>{displayRestaurant.rating} ★</Text>
              </View>
              <View style={styles.ratingInfo}>
                <Text style={styles.ratingLabel}>Dining</Text>
                <Text style={styles.ratingSub}>320 reviews</Text>
              </View>
            </View>
          </View>

          {/* Logistics Box */}
          <View style={styles.logisticsContainer}>
            <View style={styles.logisticItem}>
              <Ionicons name="time" size={16} color="#059669" />
              <Text style={styles.logisticText}>{displayRestaurant.time}</Text>
            </View>
            <View style={styles.logisticItem}>
              <Ionicons name="wallet" size={16} color="#475569" />
              <Text style={styles.logisticText}>₹350 for two</Text>
            </View>
          </View>

          {/* Offer Banner */}
          <View style={styles.offerBanner}>
            <Ionicons name="gift" size={16} color="#DC2626" />
            <Text style={styles.offerText}>10% OFF on all items</Text>
          </View>
        </View>

        {/* Filters and search bar */}
        <View style={styles.filterSection}>
          <View style={styles.menuSearchContainer}>
            <Ionicons name="search" size={16} color="#94A3B8" />
            <TextInput
              style={styles.menuSearchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={`Search in ${displayRestaurant.name}...`}
              placeholderTextColor="#94A3B8"
            />
          </View>

          <View style={styles.filtersRow}>
            {/* Swiggy Pure Veg Switch */}
            <View style={styles.vegToggleWrapper}>
              <View style={styles.vegIconBorder}>
                <View style={styles.vegDot} />
              </View>
              <Text style={styles.vegToggleText}>Veg Only</Text>
              <TouchableOpacity 
                style={[styles.customToggle, vegOnly && styles.customToggleActive]} 
                onPress={() => setVegOnly(!vegOnly)}
                activeOpacity={0.8}
              >
                <View style={[styles.customToggleCircle, vegOnly && styles.customToggleCircleActive]} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Recommended Title */}
        <Text style={styles.menuSectionTitle}>Recommended Bestsellers ({filteredDishes.length})</Text>

        {/* Dynamic Dish List */}
        {loading ? (
          <ActivityIndicator size="large" color="#1E3A8A" style={{ marginTop: 40 }} />
        ) : (
          <View style={styles.dishesList}>
            {filteredDishes.map((dish) => {
              const qty = getQty(dish.id);
              return (
                <View key={dish.id} style={styles.dishCard}>
                  
                  {/* Left Side Details */}
                  <View style={styles.dishDetailsLeft}>
                    {/* Veg/Non veg dot box */}
                    <View style={[styles.vegBadge, dish.isVeg ? styles.vegBorder : styles.nonVegBorder]}>
                      <View style={[styles.vegDotSmall, dish.isVeg ? styles.vegBg : styles.nonVegBg]} />
                    </View>

                    {dish.isBestseller && (
                      <View style={styles.bestsellerTag}>
                        <Text style={styles.bestsellerTagText}>★ BESTSELLER</Text>
                      </View>
                    )}

                    <Text style={styles.dishName} numberOfLines={1}>{dish.name}</Text>
                    <Text style={styles.dishPrice}>₹{dish.price}</Text>

                    <View style={styles.dishReviews}>
                      <Ionicons name="star" size={12} color="#F59E0B" />
                      <Text style={styles.dishReviewsText}>
                        {dish.rating} <Text style={styles.dishReviewsCount}>({dish.reviews} reviews)</Text>
                      </Text>
                    </View>

                    <Text style={styles.dishDesc} numberOfLines={2}>{dish.desc}</Text>
                  </View>

                  {/* Right Side Visuals & Add Trigger */}
                  <View style={styles.dishVisualsRight}>
                    <View style={styles.dishImageWrapper}>
                      {/* Graphical thumbnail image fetched directly from the Public API */}
                      <Image source={{ uri: dish.thumb }} style={styles.dishThumbnail} />
                      
                      {/* Signature Zomato ADD Overlay Button */}
                      <View style={styles.addBtnContainer}>
                        {qty === 0 ? (
                          <TouchableOpacity 
                            style={styles.addButtonRaw}
                            activeOpacity={0.8}
                            onPress={() => addItem(dish, restaurantId)}
                          >
                            <Text style={styles.addButtonRawText}>ADD</Text>
                            <Ionicons name="add" size={12} color="#DC2626" style={styles.addPlus} />
                          </TouchableOpacity>
                        ) : (
                          <View style={styles.addQtySelector}>
                            <TouchableOpacity 
                              style={styles.addQtyBtn} 
                              onPress={() => removeItem(dish.id)}
                            >
                              <Ionicons name="remove" size={16} color="#DC2626" />
                            </TouchableOpacity>
                            
                            <Text style={styles.addQtyValue}>{qty}</Text>
                            
                            <TouchableOpacity 
                              style={styles.addQtyBtn} 
                              onPress={() => addItem(dish, restaurantId)}
                            >
                              <Ionicons name="add" size={16} color="#DC2626" />
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>

                </View>
              );
            })}

            {filteredDishes.length === 0 && (
              <View style={styles.emptyContainer}>
                <Ionicons name="alert-circle-outline" size={44} color="#CBD5E1" />
                <Text style={styles.emptyText}>No dishes found in restaurant menu.</Text>
              </View>
            )}
          </View>
        )}

      </ScrollView>

      {/* Floating Bottom Bar matching Swiggy/Zomato exactly */}
      {cartCount > 0 && (
        <View style={styles.floatingCartBar}>
          <TouchableOpacity 
            style={styles.cartBarBtn}
            activeOpacity={0.9}
            onPress={() => navigation.navigate('FoodCart')}
          >
            <View style={styles.cartBarLeft}>
              <Text style={styles.cartBarCount}>{cartCount} ITEM{cartCount > 1 ? 'S' : ''}</Text>
              <Text style={styles.cartBarPrice}>₹{cartTotal} plus taxes</Text>
            </View>
            <View style={styles.cartBarRight}>
              <Text style={styles.viewCartText}>View Cart</Text>
              <Ionicons name="basket-outline" size={18} color="#FFF" />
            </View>
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
    height: 60,
  },
  backButtonCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
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
    paddingBottom: 110, // offset for floating cart
  },
  restaurantContainer: {
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
  },
  restaurantName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  cuisines: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 2,
  },
  address: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
    marginBottom: 16,
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
    paddingVertical: 14,
    marginBottom: 14,
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
    paddingVertical: 14,
    marginBottom: 14,
  },
  ratingCol: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingBadge: {
    backgroundColor: '#22C55E',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  diningBadge: {
    backgroundColor: '#475569',
  },
  ratingBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '800',
  },
  ratingInfo: {
    gap: 2,
  },
  ratingLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
  },
  ratingSub: {
    fontSize: 9,
    color: '#64748B',
    fontWeight: '600',
  },
  ratingDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 10,
  },
  logisticsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  logisticItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  logisticText: {
    fontSize: 12,
    fontWeight: '650',
    color: '#334155',
  },
  offerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  offerText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
  },
  filterSection: {
    paddingHorizontal: 16,
    marginTop: 20,
    gap: 12,
  },
  menuSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  menuSearchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '600',
    height: '100%',
  },
  filtersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vegToggleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  vegIconBorder: {
    width: 14,
    height: 14,
    borderWidth: 1.5,
    borderColor: '#22C55E',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 2,
  },
  vegDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22C55E',
  },
  vegToggleText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  customToggle: {
    width: 36,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#CBD5E1',
    padding: 2,
    justifyContent: 'center',
  },
  customToggleActive: {
    backgroundColor: '#22C55E',
  },
  customToggleCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FFF',
  },
  customToggleCircleActive: {
    alignSelf: 'flex-end',
  },
  menuSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#475569',
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dishesList: {
    paddingHorizontal: 16,
    gap: 16,
  },
  dishCard: {
    backgroundColor: '#FFF',
    borderRadius: 22,
    padding: 16,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 2,
  },
  dishDetailsLeft: {
    flex: 1.3,
    gap: 4,
    marginRight: 12,
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
  bestsellerTag: {
    backgroundColor: '#FEF3C7',
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
  },
  bestsellerTagText: {
    color: '#D97706',
    fontSize: 8,
    fontWeight: '800',
  },
  dishName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 2,
  },
  dishPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  dishReviews: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  dishReviewsText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D97706',
  },
  dishReviewsCount: {
    color: '#64748B',
    fontWeight: '500',
  },
  dishDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
    fontWeight: '500',
    marginTop: 4,
  },
  dishVisualsRight: {
    flex: 0.7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dishImageWrapper: {
    position: 'relative',
    width: 96,
    height: 96,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dishThumbnail: {
    width: 86,
    height: 86,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  addBtnContainer: {
    position: 'absolute',
    bottom: -8,
    alignSelf: 'center',
    width: 80,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonRaw: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  addButtonRawText: {
    color: '#DC2626',
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 0.5,
  },
  addPlus: {
    position: 'absolute',
    right: 8,
    top: 8,
  },
  addQtySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    height: '100%',
    paddingHorizontal: 8,
  },
  addQtyBtn: {
    padding: 4,
  },
  addQtyValue: {
    fontSize: 14,
    fontWeight: '850',
    color: '#DC2626',
  },
  floatingCartBar: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: '#22C55E',
    borderRadius: 18,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  cartBarBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  cartBarLeft: {
    gap: 2,
  },
  cartBarCount: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '800',
  },
  cartBarPrice: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  cartBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  viewCartText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
});
