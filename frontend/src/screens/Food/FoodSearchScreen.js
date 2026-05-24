import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TextInput, TouchableOpacity, Switch, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function FoodSearchScreen({ navigation }) {
  const [searchValue, setSearchValue] = useState('Pizza');
  const [loading, setLoading] = useState(true);
  const [meals, setMeals] = useState([]);
  const [vegOnly, setVegOnly] = useState(false);
  
  // Tracks quantities dynamically keyed by idMeal
  const [quantities, setQuantities] = useState({});
  const [wishlist, setWishlist] = useState({});

  useEffect(() => {
    if (!searchValue.trim()) {
      setMeals([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    // Debounced trigger or direct fetch
    const delayDebounceFn = setTimeout(() => {
      fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${searchValue}`)
        .then(res => res.json())
        .then(data => {
          if (data.meals) {
            // Take first 5 results
            setMeals(data.meals.slice(0, 5));
          } else {
            setMeals([]);
          }
          setLoading(false);
        })
        .catch(err => {
          console.error('Error searching meals:', err);
          setLoading(false);
        });
    }, 400); // 400ms debounce rate

    return () => clearTimeout(delayDebounceFn);
  }, [searchValue]);

  const handleIncrement = (id) => {
    setQuantities(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const handleDecrement = (id) => {
    setQuantities(prev => ({ 
      ...prev, 
      [id]: (prev[id] || 0) > 1 ? (prev[id] || 0) - 1 : 0 
    }));
  };

  const toggleWishlist = (id) => {
    setWishlist(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Swiggy Pure Veg Filter logic
  const filteredMeals = meals.filter(meal => {
    if (!vegOnly) return true;
    // Mock veg categorization based on ingredients/name
    const lowerName = meal.strMeal.toLowerCase();
    const isMeat = lowerName.includes('chicken') || lowerName.includes('beef') || lowerName.includes('pork') || lowerName.includes('fish') || lowerName.includes('lamb') || lowerName.includes('meat');
    return !isMeat;
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Header matching other Food screens */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButtonCircle} 
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Ionicons name="chevron-back" size={20} color="#555" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Food</Text>

        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.headerIconBtn}>
            <Ionicons name="notifications-outline" size={22} color="#1E293B" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerIconBtn} 
            onPress={() => navigation.navigate('FoodCart')}
          >
            <Ionicons name="cart-outline" size={22} color="#1E293B" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Elegant Active Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#1E3A8A" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            value={searchValue}
            onChangeText={setSearchValue}
            placeholder="Search for Pizza, Cake, Chicken..."
            placeholderTextColor="#94A3B8"
          />
        </View>
      </View>

      {/* Search results content */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Results title */}
        <Text style={styles.resultsTitle}>Items related to your search</Text>

        {/* Filter Action Row matching mockup exactly */}
        <View style={styles.filterRow}>
          <TouchableOpacity style={styles.viewAllFilter} activeOpacity={0.8}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>

          <View style={styles.vegFilters}>
            {/* Green Veg Dot icon badge */}
            <View style={styles.vegIconBadge}>
              <View style={styles.vegDot} />
            </View>

            {/* Switch slider */}
            <Switch
              value={vegOnly}
              onValueChange={setVegOnly}
              trackColor={{ false: '#CBD5E1', true: '#86EFAC' }}
              thumbColor={vegOnly ? '#22C55E' : '#F1F5F9'}
            />

            {/* Red Non-Veg Triangle icon badge */}
            <View style={styles.nonVegIconBadge}>
              <View style={styles.nonVegTriangle} />
            </View>
          </View>

          {/* Filter options trigger */}
          <TouchableOpacity style={styles.filterSettingsBtn} activeOpacity={0.8}>
            <Ionicons name="options-outline" size={18} color="#1E293B" />
          </TouchableOpacity>
        </View>

        {/* Dynamic Items List */}
        {loading ? (
          <ActivityIndicator size="large" color="#1E3A8A" style={{ marginTop: 40 }} />
        ) : (
          <View style={styles.itemsList}>
            {filteredMeals.map((item) => {
              const qty = quantities[item.idMeal] || 0;
              const isFav = wishlist[item.idMeal] || false;
              // Detect mock veg/non-veg type
              const lowerName = item.strMeal.toLowerCase();
              const isVegItem = !(lowerName.includes('chicken') || lowerName.includes('beef') || lowerName.includes('pork') || lowerName.includes('fish') || lowerName.includes('lamb') || lowerName.includes('meat'));

              return (
                <View key={item.idMeal} style={styles.itemCard}>
                  {/* Left circular food picture overlapping */}
                  <View style={styles.foodImageContainer}>
                    <View style={styles.foodCircleBg}>
                      <Image source={{ uri: item.strMealThumb }} style={styles.foodCircleImg} />
                    </View>
                  </View>

                  {/* Right details content */}
                  <View style={styles.itemDetails}>
                    {/* Brand Ribbon banner on top */}
                    <View style={styles.ribbon}>
                      <Ionicons name="ribbon" size={12} color="#FFF" />
                      <Text style={styles.ribbonText}>Hotel Paradise</Text>
                    </View>

                    {/* Title & Veg/Non-veg Icon */}
                    <View style={styles.itemTitleRow}>
                      <Text style={styles.itemName} numberOfLines={1}>{item.strMeal}</Text>
                      <View style={[styles.vegBadgeMini, isVegItem ? styles.vegBorderMini : styles.nonVegBorderMini]}>
                        <View style={[styles.vegDotMini, isVegItem ? styles.vegBgMini : styles.nonVegBgMini]} />
                      </View>
                    </View>

                    {/* Description */}
                    <Text style={styles.itemDesc} numberOfLines={2}>
                      Delicious and freshly prepared {item.strMeal} seasoned with gourmet spices.
                    </Text>

                    {/* Meta Rating & Price */}
                    <View style={styles.itemMetaRow}>
                      <View style={styles.ratingBadge}>
                        <Ionicons name="star" size={12} color="#F59E0B" />
                        <Text style={styles.ratingText}>4.7</Text>
                      </View>
                      <Text style={styles.itemPrice}>₹96.00</Text>
                    </View>

                    {/* Controls Footer */}
                    <View style={styles.cardControls}>
                      {/* Wishlist Heart */}
                      <TouchableOpacity 
                        onPress={() => toggleWishlist(item.idMeal)} 
                        style={styles.heartBtn}
                        activeOpacity={0.7}
                      >
                        <Ionicons 
                          name={isFav ? "heart" : "heart-outline"} 
                          size={22} 
                          color={isFav ? "#EF4444" : "#94A3B8"} 
                        />
                      </TouchableOpacity>

                      {/* Zomato Swiggy style ADD selector */}
                      {qty === 0 ? (
                        <TouchableOpacity 
                          style={styles.addButtonRaw}
                          activeOpacity={0.8}
                          onPress={() => handleIncrement(item.idMeal)}
                        >
                          <Text style={styles.addButtonRawText}>ADD</Text>
                        </TouchableOpacity>
                      ) : (
                        <View style={styles.qtyContainer}>
                          <TouchableOpacity onPress={() => handleDecrement(item.idMeal)} style={styles.qtyBtn}>
                            <Ionicons name="remove" size={14} color="#DC2626" />
                          </TouchableOpacity>
                          <Text style={styles.qtyValue}>{qty}</Text>
                          <TouchableOpacity onPress={() => handleIncrement(item.idMeal)} style={styles.qtyBtn}>
                            <Ionicons name="add" size={14} color="#DC2626" />
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              );
            })}

            {filteredMeals.length === 0 && (
              <View style={styles.emptyContainer}>
                <Ionicons name="alert-circle-outline" size={54} color="#CBD5E1" />
                <Text style={styles.emptyText}>No dishes found matching your criteria.</Text>
                <Text style={styles.emptySub}>Try searching "Chicken", "Cake", "Pizza", or "Seafood"</Text>
              </View>
            )}
          </View>
        )}

        {/* View Cart button */}
        {filteredMeals.length > 0 && (
          <TouchableOpacity 
            style={styles.viewCartBtn} 
            onPress={() => navigation.navigate('FoodMenu')}
            activeOpacity={0.8}
          >
            <Text style={styles.viewCartText}>Go to Hotel Paradise Menu</Text>
            <Ionicons name="arrow-forward" size={16} color="#FFF" />
          </TouchableOpacity>
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
  searchSection: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 18,
    paddingHorizontal: 16,
    height: 52,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#0F172A',
    fontWeight: '600',
    height: '100%',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  resultsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
    marginHorizontal: 20,
    marginTop: 20,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 14,
    marginBottom: 20,
  },
  viewAllFilter: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  viewAllText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  vegFilters: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  vegIconBadge: {
    width: 16,
    height: 16,
    borderWidth: 1.5,
    borderColor: '#22C55E',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 3,
  },
  vegDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#22C55E',
  },
  nonVegIconBadge: {
    width: 16,
    height: 16,
    borderWidth: 1.5,
    borderColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 3,
  },
  nonVegTriangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderBottomWidth: 8,
    borderStyle: 'solid',
    backgroundColor: 'transparent',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#EF4444',
  },
  filterSettingsBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  itemsList: {
    paddingHorizontal: 20,
    gap: 20,
  },
  itemCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    flexDirection: 'row',
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
    position: 'relative',
    marginLeft: 30,
  },
  foodImageContainer: {
    position: 'absolute',
    left: -45,
    top: 16,
    zIndex: 10,
  },
  foodCircleBg: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  foodCircleImg: {
    width: '100%',
    height: '100%',
  },
  itemDetails: {
    flex: 1,
    marginLeft: 50,
    gap: 6,
  },
  ribbon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#1E293B',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 0,
    alignSelf: 'flex-start',
    marginTop: -8,
  },
  ribbonText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  itemTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 4,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
  },
  vegBadgeMini: {
    width: 12,
    height: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 2,
  },
  vegBorderMini: { borderColor: '#22C55E' },
  nonVegBorderMini: { borderColor: '#EF4444' },
  vegDotMini: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  vegBgMini: { backgroundColor: '#22C55E' },
  nonVegBgMini: { backgroundColor: '#EF4444' },
  itemDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
    fontWeight: '500',
  },
  itemMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFDF2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  ratingText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#D97706',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#059669',
  },
  cardControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
  },
  heartBtn: {
    padding: 4,
  },
  addButtonRaw: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  addButtonRawText: {
    color: '#DC2626',
    fontWeight: '800',
    fontSize: 12,
  },
  qtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  qtyBtn: {
    padding: 4,
  },
  qtyValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#DC2626',
    paddingHorizontal: 8,
  },
  viewCartBtn: {
    backgroundColor: '#DC2626',
    borderRadius: 18,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 20,
    marginTop: 30,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
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
    paddingHorizontal: 20,
    gap: 10,
  },
  emptyText: {
    fontSize: 15,
    color: '#64748B',
    fontWeight: '700',
  },
  emptySub: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
    textAlign: 'center',
  },
});
