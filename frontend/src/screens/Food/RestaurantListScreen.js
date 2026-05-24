import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function RestaurantListScreen({ navigation }) {
  const [categories, setCategories] = useState([]);
  const [featuredDishes, setFeaturedDishes] = useState([]);
  const [selectedCat, setSelectedCat] = useState('Chicken');
  const [loadingCats, setLoadingCats] = useState(true);
  const [loadingDishes, setLoadingDishes] = useState(true);

  // Fetch categories on mount
  useEffect(() => {
    fetch('https://www.themealdb.com/api/json/v1/1/categories.php')
      .then(res => res.json())
      .then(data => {
        if (data.categories) {
          // Take first 6 categories for neat UI
          setCategories(data.categories.slice(0, 6));
        }
        setLoadingCats(false);
      })
      .catch(err => {
        console.error('Error fetching categories:', err);
        setLoadingCats(false);
      });
  }, []);

  // Fetch dishes whenever selected category changes
  useEffect(() => {
    setLoadingDishes(true);
    fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${selectedCat}`)
      .then(res => res.json())
      .then(data => {
        if (data.meals) {
          // Take first 5 meals for beautiful display
          setFeaturedDishes(data.meals.slice(0, 5));
        }
        setLoadingDishes(false);
      })
      .catch(err => {
        console.error('Error fetching dishes:', err);
        setLoadingDishes(false);
      });
  }, [selectedCat]);

  const handleSearch = () => {
    navigation.navigate('FoodSearch');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Title Header bar */}
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
          <TouchableOpacity style={styles.headerIconBtn} onPress={() => navigation.navigate('FoodCart')}>
            <Ionicons name="cart-outline" size={22} color="#1E293B" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Deliver To subheader */}
      <View style={styles.subheader}>
        <View style={styles.deliverTo}>
          <Ionicons name="location" size={16} color="#DC2626" />
          <Text style={styles.subheaderText}>
            DELIVER TO <Text style={styles.boldText}>Halal Lab office</Text>
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
          <Ionicons name="search-outline" size={20} color="#94A3B8" style={styles.searchIcon} />
          <Text style={styles.searchPlaceholder}>Search for restaurants, Biryani</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        {/* Live All Categories list */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>All Categories</Text>
            <TouchableOpacity onPress={handleSearch}>
              <Text style={styles.sectionLink}>See All ❯</Text>
            </TouchableOpacity>
          </View>
          
          {loadingCats ? (
            <ActivityIndicator size="small" color="#1E3A8A" style={{ marginVertical: 20 }} />
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.allCatList}>
              {categories.map((cat) => {
                const isActive = cat.strCategory === selectedCat;
                return (
                  <TouchableOpacity 
                    key={cat.idCategory} 
                    style={[styles.allCatItem, isActive && styles.allCatItemActive]}
                    activeOpacity={0.8}
                    onPress={() => setSelectedCat(cat.strCategory)}
                  >
                    <View style={[styles.allCatCircle, isActive && styles.allCatCircleActive]}>
                      {cat.strCategoryThumb ? (
                        <Image source={{ uri: cat.strCategoryThumb }} style={styles.catImage} />
                      ) : (
                        <Ionicons name="pizza-outline" size={22} color={isActive ? '#FFF' : '#64748B'} />
                      )}
                    </View>
                    <Text style={[styles.allCatText, isActive && styles.allCatTextActive]}>{cat.strCategory}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
        </View>

        {/* Live Grid Categories */}
        <View style={[styles.section, { marginTop: 28 }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Popular in {selectedCat}</Text>
            <TouchableOpacity onPress={handleSearch}>
              <Text style={styles.sectionLink}>Search ❯</Text>
            </TouchableOpacity>
          </View>
          
          {loadingDishes ? (
            <ActivityIndicator size="medium" color="#1E3A8A" style={{ marginVertical: 30 }} />
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catGrid}>
              {featuredDishes.map((item) => (
                <TouchableOpacity 
                  key={item.idMeal} 
                  style={styles.catCard}
                  activeOpacity={0.85}
                  onPress={() => navigation.navigate('FoodMenu')}
                >
                  <View style={styles.catImageWrapper}>
                    <Image source={{ uri: item.strMealThumb }} style={styles.dishGridImage} />
                  </View>
                  <Text style={styles.catCardTitle} numberOfLines={1}>{item.strMeal}</Text>
                  <Text style={styles.catCardStarting}>Starting</Text>
                  <Text style={styles.catCardPrice}>₹96.00</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Popular Restaurants */}
        <View style={[styles.section, { marginTop: 28 }]}>
          <Text style={styles.sectionTitle}>Popular Restaurants</Text>

          {[
            {
              name: 'Hotel Paradise',
              cuisines: 'Biryani · Seafood · Indian',
              rating: '4.7',
              time: '20-25 min',
              priceTag: '₹300 for two',
              offer: '20% OFF',
              img: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80',
            },
            {
              name: 'Wazwan House',
              cuisines: 'Kashmiri · Mughlai',
              rating: '4.8',
              time: '30-35 min',
              priceTag: '₹400 for two',
              offer: 'FREE DELIVERY',
              img: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&auto=format&fit=crop&q=80',
            },
            {
              name: 'Burger Street',
              cuisines: 'Burgers · Wraps · Fries',
              rating: '4.4',
              time: '18-22 min',
              priceTag: '₹200 for two',
              offer: 'BUY 1 GET 1',
              img: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&auto=format&fit=crop&q=80',
            },
          ].map((r, i) => (
            <TouchableOpacity
              key={i}
              style={styles.restaurantCard}
              activeOpacity={0.9}
              onPress={() => navigation.navigate('FoodMenu')}
            >
              {/* Real photo */}
              <View style={styles.restaurantImageBg}>
                <Image source={{ uri: r.img }} style={styles.restaurantPhoto} resizeMode="cover" />
                <View style={styles.buildingOverlay}>
                  <View style={styles.offerBadge}>
                    <Text style={styles.offerBadgeText}>{r.offer}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.restaurantInfo}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.restaurantName}>{r.name}</Text>
                  <Text style={styles.restaurantCuisines}>{r.cuisines}</Text>
                  <Text style={styles.restaurantPrice}>{r.priceTag}</Text>
                </View>
                <View style={styles.restaurantMeta}>
                  <View style={styles.ratingBadge}>
                    <Ionicons name="star" size={12} color="#F59E0B" />
                    <Text style={styles.ratingText}>{r.rating}</Text>
                  </View>
                  <View style={styles.timeBadge}>
                    <Ionicons name="time-outline" size={12} color="#64748B" />
                    <Text style={styles.timeText}>{r.time}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

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
  subheader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  deliverTo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  subheaderText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
  },
  boldText: {
    fontWeight: '700',
    color: '#0F172A',
  },
  editText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DC2626',
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFF',
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
  searchPlaceholder: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '500',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: 0.3,
  },
  sectionLink: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
  allCatList: {
    gap: 16,
    paddingBottom: 4,
  },
  allCatItem: {
    alignItems: 'center',
    gap: 8,
    width: 70,
  },
  allCatCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    overflow: 'hidden',
  },
  allCatCircleActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
    borderWidth: 2,
  },
  catImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  allCatText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  allCatTextActive: {
    color: '#2563EB',
    fontWeight: '700',
  },
  catGrid: {
    gap: 16,
    paddingBottom: 4,
  },
  catCard: {
    width: 130,
    borderRadius: 22,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    backgroundColor: '#FFF',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  catImageWrapper: {
    width: 90,
    height: 90,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  dishGridImage: {
    width: '100%',
    height: '100%',
  },
  catCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
    textAlign: 'center',
    width: '100%',
  },
  catCardStarting: {
    fontSize: 9,
    fontWeight: '600',
    color: '#64748B',
  },
  catCardPrice: {
    fontSize: 13,
    fontWeight: '750',
    color: '#059669',
    marginTop: 2,
  },
  restaurantCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 16,
  },
  restaurantImageBg: {
    width: '100%',
    height: 170,
    backgroundColor: '#E2E8F0',
    position: 'relative',
    overflow: 'hidden',
  },
  restaurantPhoto: {
    width: '100%',
    height: '100%',
  },
  buildingOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0,0,0,0.22)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  offerBadge: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  offerBadgeText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  restaurantInfo: {
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  restaurantName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  restaurantCuisines: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 3,
  },
  restaurantPrice: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  restaurantMeta: {
    flexDirection: 'column',
    gap: 6,
    alignItems: 'flex-end',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFDF2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D97706',
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  timeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
});
