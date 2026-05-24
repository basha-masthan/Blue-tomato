import React, { useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TextInput, TouchableOpacity, Image, Alert, Animated, Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const BANNER_SLIDES = [
  {
    id: 1,
    badge: 'JUMBO TREAT',
    title: 'Buy 2 Get 1',
    desc: 'Buy any 2 dishes and get 1 dish free',
    color: '#DC2626',
    lightColor: '#FCA5A5',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300&auto=format&fit=crop&q=80',
    btnText: 'ORDER NOW',
  },
  {
    id: 2,
    badge: 'MEGA OFFER',
    title: '50% OFF',
    desc: 'On your first Home Services booking',
    color: '#059669',
    lightColor: '#6EE7B7',
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=300&auto=format&fit=crop&q=80',
    btnText: 'BOOK NOW',
  },
];

export default function DashboardScreen({ navigation }) {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const currentSlide = useRef(0);

  // Auto slide banners
  useEffect(() => {
    const interval = setInterval(() => {
      currentSlide.current = (currentSlide.current + 1) % BANNER_SLIDES.length;
      Animated.timing(slideAnim, {
        toValue: -currentSlide.current * (width - 40),
        duration: 500,
        useNativeDriver: false,
      }).start();
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const services = [
    {
      id: 'food',
      title: 'Food Delivery',
      subtitle: 'Order from restaurants near you',
      color: '#FEF2F2',
      ribbonColor: '#DC2626',
      icon: 'fast-food',
      action: () => navigation.navigate('FoodHome'),
      image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=300&auto=format&fit=crop&q=80',
    },
    {
      id: 'services',
      title: 'Home Services',
      subtitle: 'Plumbing, Electrician, Painting & more',
      color: '#ECFDF5',
      ribbonColor: '#059669',
      icon: 'construct',
      action: () => navigation.navigate('HomeServicesHome'),
      image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=300&auto=format&fit=crop&q=80',
    },
    {
      id: 'ride',
      title: 'Ride-Sharing',
      subtitle: 'Book a safe ride in minutes',
      color: '#FFFBEB',
      ribbonColor: '#D97706',
      icon: 'car',
      action: () => Alert.alert('Ride-Sharing', 'Ride-sharing module is coming soon!'),
      image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=300&auto=format&fit=crop&q=80',
    },
    {
      id: 'it',
      title: 'IT Services',
      subtitle: 'Computer repair and setup support',
      color: '#F0F9FF',
      ribbonColor: '#0369A1',
      icon: 'laptop',
      action: () => Alert.alert('IT Services', 'IT Services module is coming soon!'),
      image: 'https://images.unsplash.com/photo-1588702547919-26089e690ecc?w=300&auto=format&fit=crop&q=80',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.locationContainer}>
          <View style={styles.locationIconCircle}>
            <Ionicons name="location" size={16} color="#DC2626" />
          </View>
          <View style={styles.locationTextContainer}>
            <Text style={styles.locationLabel}>DELIVER TO</Text>
            <View style={styles.locationRow}>
              <Text style={styles.locationValue} numberOfLines={1}>Halal Lab office, Srinagar</Text>
              <Ionicons name="chevron-down" size={14} color="#64748B" />
            </View>
          </View>
        </View>

        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.headerIconCircle} activeOpacity={0.7}>
            <Ionicons name="notifications-outline" size={20} color="#1E293B" />
            <View style={styles.notifDot} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIconCircle} activeOpacity={0.7}>
            <Ionicons name="cart-outline" size={20} color="#1E293B" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={styles.searchSection}>
          <TouchableOpacity
            style={styles.searchContainer}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('FoodHome')}
          >
            <Ionicons name="search-outline" size={20} color="#94A3B8" style={styles.searchIcon} />
            <Text style={styles.searchPlaceholder}>Food, Plumbing, Electrician...</Text>
            <View style={styles.searchFilterBtn}>
              <Ionicons name="options-outline" size={16} color="#DC2626" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Quick Category Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillsRow}
          style={styles.pillsScroll}
        >
          {[
            { label: 'Biryani', icon: 'restaurant', color: '#DC2626' },
            { label: 'Pizza', icon: 'pizza', color: '#D97706' },
            { label: 'Burger', icon: 'fast-food', color: '#7C3AED' },
            { label: 'Plumbing', icon: 'water', color: '#0369A1' },
            { label: 'Cleaning', icon: 'sparkles', color: '#059669' },
          ].map((pill) => (
            <TouchableOpacity
              key={pill.label}
              style={styles.pill}
              onPress={() => navigation.navigate(pill.label === 'Plumbing' ? 'HomeServicesHome' : 'FoodHome')}
              activeOpacity={0.7}
            >
              <Ionicons name={pill.icon} size={14} color={pill.color} />
              <Text style={[styles.pillText, { color: pill.color }]}>{pill.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Banner Carousel */}
        <View style={styles.bannerSection}>
          <View style={styles.bannerTrackWrapper}>
            <Animated.View style={[styles.bannerTrack, { transform: [{ translateX: slideAnim }] }]}>
              {BANNER_SLIDES.map((slide) => (
                <TouchableOpacity
                  key={slide.id}
                  style={[styles.bannerCard, { backgroundColor: slide.color }]}
                  activeOpacity={0.92}
                  onPress={() => navigation.navigate('FoodHome')}
                >
                  {/* Left text */}
                  <View style={styles.bannerLeft}>
                    <View style={styles.bannerBadge}>
                      <Text style={[styles.bannerBadgeText, { color: slide.color }]}>{slide.badge}</Text>
                    </View>
                    <Text style={styles.bannerOfferTitle}>{slide.title}</Text>
                    <Text style={[styles.bannerOfferDesc, { color: slide.lightColor }]}>{slide.desc}</Text>
                    <View style={styles.bannerButton}>
                      <Text style={[styles.bannerButtonText, { color: slide.color }]}>{slide.btnText}</Text>
                      <Ionicons name="arrow-forward" size={11} color={slide.color} />
                    </View>
                  </View>
                  {/* Right image */}
                  <View style={styles.bannerImageWrapper}>
                    <Image
                      source={{ uri: slide.image }}
                      style={styles.bannerImage}
                      resizeMode="cover"
                    />
                  </View>
                </TouchableOpacity>
              ))}
            </Animated.View>
          </View>

          {/* Dots */}
          <View style={styles.dotsRow}>
            {BANNER_SLIDES.map((s, i) => (
              <View key={s.id} style={[styles.dot, i === 0 && styles.dotActive]} />
            ))}
          </View>
        </View>

        {/* Services */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Services</Text>

          {services.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.serviceCard, { backgroundColor: item.color }]}
              onPress={item.action}
              activeOpacity={0.85}
            >
              {/* Real Image */}
              <View style={styles.serviceImageWrapper}>
                <Image
                  source={{ uri: item.image }}
                  style={styles.serviceImage}
                  resizeMode="cover"
                />
                <View style={[styles.serviceImageOverlay, { backgroundColor: item.ribbonColor + 'CC' }]}>
                  <Ionicons name={item.icon} size={22} color="#FFF" />
                </View>
              </View>

              {/* Content */}
              <View style={styles.serviceContent}>
                <View style={[styles.serviceRibbon, { backgroundColor: item.ribbonColor }]}>
                  <Text style={styles.serviceRibbonText}>{item.title}</Text>
                </View>
                <Text style={styles.serviceSubtitle}>{item.subtitle}</Text>
                <View style={styles.serviceArrow}>
                  <Text style={[styles.serviceArrowText, { color: item.ribbonColor }]}>Explore</Text>
                  <Ionicons name="arrow-forward" size={13} color={item.ribbonColor} />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Popular Near You */}
        <View style={[styles.section, { marginTop: 28 }]}>
          <Text style={styles.sectionTitle}>Popular Near You 🔥</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.nearbyList}>
            {[
              {
                name: 'Wazwan House',
                tag: 'Kashmiri Cuisine',
                rating: '4.8',
                time: '25 min',
                img: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=200&auto=format&fit=crop&q=80',
              },
              {
                name: 'Tandoor King',
                tag: 'Mughlai, Biryani',
                rating: '4.6',
                time: '30 min',
                img: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=200&auto=format&fit=crop&q=80',
              },
              {
                name: 'Burger Street',
                tag: 'Burgers, Fast Food',
                rating: '4.4',
                time: '20 min',
                img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&auto=format&fit=crop&q=80',
              },
            ].map((r, i) => (
              <TouchableOpacity
                key={i}
                style={styles.nearbyCard}
                onPress={() => navigation.navigate('FoodMenu')}
                activeOpacity={0.85}
              >
                <Image source={{ uri: r.img }} style={styles.nearbyImage} resizeMode="cover" />
                <View style={styles.nearbyInfo}>
                  <Text style={styles.nearbyName} numberOfLines={1}>{r.name}</Text>
                  <Text style={styles.nearbyTag} numberOfLines={1}>{r.tag}</Text>
                  <View style={styles.nearbyMeta}>
                    <Ionicons name="star" size={11} color="#F59E0B" />
                    <Text style={styles.nearbyRating}>{r.rating}</Text>
                    <Text style={styles.nearbyDot}>·</Text>
                    <Text style={styles.nearbyTime}>{r.time}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
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
    paddingTop: 14,
    paddingBottom: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginRight: 16,
  },
  locationIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationTextContainer: {
    gap: 1,
    flex: 1,
  },
  locationLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 1,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 10,
  },
  headerIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    position: 'relative',
  },
  notifDot: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#DC2626',
    borderWidth: 1.5,
    borderColor: '#FFF',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  searchSection: {
    paddingHorizontal: 20,
    marginTop: 18,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 18,
    paddingHorizontal: 16,
    height: 54,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '500',
  },
  searchFilterBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pillsScroll: {
    marginTop: 16,
  },
  pillsRow: {
    paddingHorizontal: 20,
    gap: 10,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '700',
  },
  bannerSection: {
    marginTop: 22,
    paddingHorizontal: 20,
  },
  bannerTrackWrapper: {
    overflow: 'hidden',
    borderRadius: 24,
  },
  bannerTrack: {
    flexDirection: 'row',
  },
  bannerCard: {
    width: width - 40,
    height: 155,
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingVertical: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    overflow: 'hidden',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
    marginRight: 0,
  },
  bannerLeft: {
    flex: 1,
    justifyContent: 'space-between',
    paddingRight: 10,
  },
  bannerBadge: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  bannerBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
    color: '#FFF',
  },
  bannerOfferTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFF',
    marginTop: 4,
  },
  bannerOfferDesc: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  bannerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    marginTop: 10,
  },
  bannerButtonText: {
    fontSize: 10,
    fontWeight: '800',
  },
  bannerImageWrapper: {
    width: 110,
    height: '100%',
    borderRadius: 18,
    overflow: 'hidden',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#CBD5E1',
  },
  dotActive: {
    width: 20,
    backgroundColor: '#DC2626',
  },
  section: {
    marginTop: 28,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  serviceCard: {
    flexDirection: 'row',
    borderRadius: 22,
    marginBottom: 14,
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    alignItems: 'center',
    padding: 14,
    gap: 16,
  },
  serviceImageWrapper: {
    width: 82,
    height: 82,
    borderRadius: 18,
    overflow: 'hidden',
    position: 'relative',
  },
  serviceImage: {
    width: '100%',
    height: '100%',
  },
  serviceImageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceContent: {
    flex: 1,
    gap: 6,
  },
  serviceRibbon: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
  },
  serviceRibbonText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  serviceSubtitle: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  serviceArrow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  serviceArrowText: {
    fontSize: 12,
    fontWeight: '700',
  },
  nearbyList: {
    gap: 14,
    paddingBottom: 4,
  },
  nearbyCard: {
    width: 150,
    borderRadius: 20,
    backgroundColor: '#FFF',
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  nearbyImage: {
    width: '100%',
    height: 100,
  },
  nearbyInfo: {
    padding: 10,
    gap: 3,
  },
  nearbyName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  nearbyTag: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  nearbyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 4,
  },
  nearbyRating: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D97706',
  },
  nearbyDot: {
    fontSize: 12,
    color: '#CBD5E1',
    fontWeight: '700',
  },
  nearbyTime: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
});
