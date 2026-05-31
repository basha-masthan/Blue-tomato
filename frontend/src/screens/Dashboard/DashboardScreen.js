import React, { useRef, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TextInput, TouchableOpacity, Image, Animated, Dimensions,
  ActivityIndicator, Platform, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import client from '../../api/client';
import { API_CONFIG } from '../../config';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width - 48;



const CATEGORY_ICONS = {
  plumbing: 'water-outline',
  electrical: 'flash-outline',
  cleaning: 'sparkles-outline',
  painting: 'color-palette-outline',
  carpentry: 'hammer-outline',
  appliance: 'settings-outline',
  pest: 'bug-outline',
  default: 'construct-outline',
};

const CATEGORY_GRADIENTS = [
  ['#3B82F6', '#1D4ED8'],
  ['#10B981', '#059669'],
  ['#F59E0B', '#D97706'],
  ['#8B5CF6', '#7C3AED'],
  ['#EF4444', '#DC2626'],
  ['#EC4899', '#DB2777'],
  ['#14B8A6', '#0D9488'],
  ['#F97316', '#EA580C'],
];

export default function DashboardScreen({ navigation }) {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const headerScale = useRef(new Animated.Value(0.95)).current;
  const currentSlide = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedServiceType, setSelectedServiceType] = useState('home');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(headerScale, { toValue: 1, tension: 50, friction: 8, useNativeDriver: true }),
    ]).start();
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const baseURL = API_CONFIG.BASE_URL.replace('/api/user', '/api');
      const [catRes, banRes, subRes] = await Promise.all([
        client.get(`${baseURL}/public/categories`),
        client.get(`${baseURL}/public/banners?app=user`),
        client.get(`${baseURL}/public/subcategories`),
      ]);
      const fetchedCats = catRes.data?.categories || catRes.data || [];
      const fetchedBans = banRes.data?.banners || banRes.data || [];
      const fetchedSubs = subRes.data?.subcategories || subRes.data || [];
      setCategories(fetchedCats);
      setBanners(fetchedBans);
      setSubcategories(fetchedSubs);
    } catch (error) {
      console.log('Error fetching dashboard data:', error.message);
      setBanners([]);
      setSubcategories([]);
    } finally {
      setLoading(false);
    }
  };

  // Auto slide banners
  useEffect(() => {
    if (banners.length === 0) return;
    const interval = setInterval(() => {
      const next = (currentSlide.current + 1) % banners.length;
      currentSlide.current = next;
      setActiveIndex(next);

      // 3D slide with scale pulse
      Animated.sequence([
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 0.97, tension: 200, friction: 10, useNativeDriver: false,
          }),
          Animated.timing(slideAnim, {
            toValue: -next * (CARD_WIDTH + 16),
            duration: 450,
            useNativeDriver: false,
          }),
        ]),
        Animated.spring(scaleAnim, {
          toValue: 1, tension: 100, friction: 8, useNativeDriver: false,
        }),
      ]).start();
    }, 3800);
    return () => clearInterval(interval);
  }, [banners.length]);

  const goToSlide = (index) => {
    currentSlide.current = index;
    setActiveIndex(index);
    Animated.timing(slideAnim, {
      toValue: -index * (CARD_WIDTH + 16),
      duration: 400,
      useNativeDriver: false,
    }).start();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F0F4FF" />
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        {/* ── Header ─────────────────────────────────────── */}
        <Animated.View style={[styles.header, { transform: [{ scale: headerScale }] }]}>
          <View style={styles.locationRow}>
            <View style={styles.locIcon}>
              <Ionicons name="location" size={16} color="#4F46E5" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.locLabel}>DELIVER TO</Text>
              <TouchableOpacity style={styles.locValue} activeOpacity={0.7}>
                <Text style={styles.locText} numberOfLines={1}>Your Location</Text>
                <Ionicons name="chevron-down" size={14} color="#4F46E5" />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
              <Ionicons name="notifications-outline" size={20} color="#1E293B" />
              <View style={styles.badge} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
              <Ionicons name="cart-outline" size={20} color="#1E293B" />
            </TouchableOpacity>
          </View>
        </Animated.View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Search Bar ─────────────────────────────────── */}
          <TouchableOpacity
            style={styles.searchBar}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('HomeServicesSearch')}
          >
            <Ionicons name="search-outline" size={18} color="#94A3B8" />
            <Text style={styles.searchText}>Search plumbing, electrical…</Text>
            <View style={styles.searchFilter}>
              <Ionicons name="options-outline" size={15} color="#4F46E5" />
            </View>
          </TouchableOpacity>

          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color="#4F46E5" />
              <Text style={styles.loadingText}>Loading…</Text>
            </View>
          ) : (
            <>
              {/* ── Service Types Tab Selector ─────────────────── */}
              <View style={styles.serviceTypeRow}>
                {[
                  { id: 'home', label: 'Home Services', icon: 'construct-outline', color: '#4F46E5' },
                  { id: 'food', label: 'Food Delivery', icon: 'pizza-outline', color: '#F97316' },
                  { id: 'rides', label: 'Ride Services', icon: 'car-outline', color: '#0EA5E9' },
                ].map(type => {
                  const isActive = selectedServiceType === type.id;
                  return (
                    <TouchableOpacity
                      key={type.id}
                      style={[
                        styles.serviceTypeTab,
                        isActive && { borderColor: type.color, backgroundColor: type.color + '0E' },
                      ]}
                      activeOpacity={0.8}
                      onPress={() => setSelectedServiceType(type.id)}
                    >
                      <View style={[styles.serviceTypeIconBg, { backgroundColor: isActive ? type.color : '#F1F5F9' }]}>
                        <Ionicons name={type.icon} size={18} color={isActive ? '#FFFFFF' : '#64748B'} />
                      </View>
                      <Text style={[styles.serviceTypeLabel, isActive && { color: type.color, fontWeight: '800' }]}>
                        {type.label}
                      </Text>
                      {(type.id === 'food' || type.id === 'rides') && (
                        <View style={styles.soonBadge}>
                          <Text style={styles.soonText}>Soon</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* ── Offer Banners ──────────────────────────────── */}
              {banners && banners.length > 0 && (
                <>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>✨ Special Offers</Text>
                  </View>

                  <View style={styles.carouselWrap}>
                    <Animated.View style={[styles.carouselTrack, { transform: [{ translateX: slideAnim }] }]}>
                      {banners.map((banner, index) => {
                        const bg = banner.backgroundColor || '#4F46E5';
                        const lightC = banner.lightColor || '#A5B4FC';
                        const imgUri = banner.image || banner.imageUrl || 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&auto=format&fit=crop';

                        return (
                          <TouchableOpacity
                            key={banner._id || index}
                            activeOpacity={0.92}
                            style={styles.bannerCard}
                          >
                            {/* Background gradient */}
                            <View style={[styles.bannerBg, { backgroundColor: bg }]}>
                              {/* Decorative circles */}
                              <View style={[styles.decCircle1, { backgroundColor: lightC + '33' }]} />
                              <View style={[styles.decCircle2, { backgroundColor: lightC + '22' }]} />

                              <View style={styles.bannerContent}>
                                {/* Tag pill */}
                                {banner.tag && (
                                  <View style={styles.tagPill}>
                                    <Text style={[styles.tagText, { color: bg }]}>{banner.tag}</Text>
                                  </View>
                                )}

                                {/* Title */}
                                <Text style={styles.bannerTitle}>{banner.title}</Text>
                                {banner.description && (
                                  <Text style={[styles.bannerDesc, { color: lightC }]}>
                                    {banner.description}
                                  </Text>
                                )}

                                {/* CTA */}
                                <View style={styles.ctaRow}>
                                  <View style={styles.ctaBtn}>
                                    <Text style={[styles.ctaText, { color: bg }]}>
                                      {banner.btnText || 'BOOK NOW'}
                                    </Text>
                                    <Ionicons name="arrow-forward" size={11} color={bg} />
                                  </View>
                                </View>
                              </View>

                              {/* Right Image */}
                              <View style={styles.bannerImgWrap}>
                                <Image
                                  source={{ uri: imgUri }}
                                  style={styles.bannerImg}
                                  resizeMode="cover"
                                />
                                {/* 3D shine overlay */}
                                <View style={styles.bannerShine} />
                              </View>
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                    </Animated.View>

                    {/* Indicator dots */}
                    <View style={styles.dotsRow}>
                      {banners.map((_, i) => (
                        <TouchableOpacity key={i} onPress={() => goToSlide(i)}>
                          <View style={[styles.dot, i === activeIndex && styles.dotActive]} />
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </>
              )}

              {selectedServiceType === 'home' ? (
                <>
                  {/* ── Service Categories ─────────────────────────── */}
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>🏠 Our Services</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('HomeServicesSearch')}>
                      <Text style={styles.seeAll}>See All</Text>
                    </TouchableOpacity>
                  </View>

                  {categories.length === 0 ? (
                    <View style={styles.emptyServices}>
                      <Ionicons name="construct-outline" size={48} color="#CBD5E1" />
                      <Text style={styles.emptyText}>No services available yet</Text>
                      <Text style={styles.emptySubText}>Check back soon!</Text>
                    </View>
                  ) : (
                    <View style={styles.categoryGrid}>
                      {categories.map((cat, idx) => {
                        const gradient = CATEGORY_GRADIENTS[idx % CATEGORY_GRADIENTS.length];
                        const iconName = CATEGORY_ICONS[cat.name?.toLowerCase()] || CATEGORY_ICONS.default;
                        return (
                          <TouchableOpacity
                            key={cat._id || idx}
                            style={styles.catCard}
                            onPress={() => navigation.navigate('HomeServicesHome', { categoryId: cat._id })}
                            activeOpacity={0.85}
                          >
                            {/* 3D card face */}
                            <View style={[styles.catFace, { backgroundColor: gradient[0] }]}>
                              {/* Decorative blob */}
                              <View style={[styles.catBlob, { backgroundColor: gradient[1] + '88' }]} />

                              {/* Icon box */}
                              <View style={styles.catIconBox}>
                                <Ionicons name={iconName} size={28} color="#FFFFFF" />
                              </View>

                              {/* Name */}
                              <Text style={styles.catName}>{cat.name}</Text>
                              {cat.description && (
                                <Text style={styles.catDesc} numberOfLines={2}>{cat.description}</Text>
                              )}

                              <View style={styles.catArrow}>
                                <Text style={styles.catArrowText}>Explore</Text>
                                <Ionicons name="chevron-forward" size={12} color="rgba(255,255,255,0.7)" />
                              </View>
                            </View>
                            {/* 3D shadow layer */}
                            <View style={[styles.catShadow, { backgroundColor: gradient[1] }]} />
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}

                  {/* ── Top Ranked Sub-Services ────────────────────── */}
                  {subcategories && subcategories.length > 0 && (
                    <>
                      <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>🔥 Popular Sub-Services</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('HomeServicesSearch')}>
                          <Text style={styles.seeAll}>See All</Text>
                        </TouchableOpacity>
                      </View>
                      
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.subScroll}
                      >
                        {subcategories.map((sub, idx) => {
                          const catName = categories.find(c => c._id === sub.category)?.name || 'Home Service';
                          return (
                            <TouchableOpacity
                              key={sub._id || idx}
                              style={styles.subCardWide}
                              activeOpacity={0.9}
                              onPress={() => navigation.navigate('HomeServicesHome', { categoryId: sub.category })}
                            >
                              <View style={styles.subCardTop}>
                                <View style={styles.subCategoryBadge}>
                                  <Text style={styles.subCategoryBadgeText}>{catName}</Text>
                                </View>
                                <View style={styles.ratingBadge}>
                                  <Ionicons name="star" size={10} color="#F59E0B" />
                                  <Text style={styles.ratingBadgeText}>4.8</Text>
                                </View>
                              </View>
                              
                              <Text style={styles.subCardTitle} numberOfLines={1}>{sub.name}</Text>
                              <Text style={styles.subCardDesc} numberOfLines={2}>{sub.description || 'Professional repair and installation service at your doorstep.'}</Text>
                              
                              <View style={styles.subCardFooter}>
                                <Text style={styles.subCardPrice}>Starting ₹{sub.basePrice || '299'}</Text>
                                <View style={styles.bookBtnSmall}>
                                  <Text style={styles.bookBtnSmallText}>Book</Text>
                                  <Ionicons name="arrow-forward-outline" size={10} color="#FFFFFF" />
                                </View>
                              </View>
                            </TouchableOpacity>
                          );
                        })}
                      </ScrollView>
                    </>
                  )}
                </>
              ) : (
                /* ── Coming Soon Panel for Other Services ───────── */
                <View style={styles.comingSoonCard}>
                  <View style={styles.comingSoonIconBg}>
                    <Ionicons
                      name={selectedServiceType === 'food' ? 'pizza-outline' : 'car-outline'}
                      size={44}
                      color="#94A3B8"
                    />
                  </View>
                  <Text style={styles.comingSoonTitle}>
                    {selectedServiceType === 'food' ? 'Food Services Coming Soon!' : 'Ride Services Coming Soon!'}
                  </Text>
                  <Text style={styles.comingSoonDesc}>
                    We are currently expanding our platform to bring you premium{' '}
                    {selectedServiceType === 'food' ? 'gourmet delivery' : 'on-demand rides'}{' '}
                    right to your screen. Stay tuned!
                  </Text>
                  <TouchableOpacity
                    style={styles.notifyBtn}
                    activeOpacity={0.8}
                    onPress={() => alert("We'll notify you when this service launches!")}
                  >
                    <Text style={styles.notifyBtnText}>Notify Me</Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F0F4FF' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 4,
  },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  locIcon: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center', alignItems: 'center',
  },
  locLabel: { fontSize: 9, fontWeight: '800', color: '#94A3B8', letterSpacing: 1.2 },
  locValue: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locText: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  headerActions: { flexDirection: 'row', gap: 8 },
  iconBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: '#E2E8F0', position: 'relative',
  },
  badge: {
    position: 'absolute', top: 8, right: 8,
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: '#EF4444', borderWidth: 1.5, borderColor: '#FFF',
  },

  scroll: { paddingBottom: 48 },

  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginHorizontal: 20, marginTop: 20,
    backgroundColor: '#FFFFFF', borderRadius: 16,
    paddingHorizontal: 16, height: 52,
    shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 5,
    borderWidth: 1.5, borderColor: '#E0E7FF',
  },
  searchText: { flex: 1, fontSize: 13, color: '#94A3B8', fontWeight: '500' },
  searchFilter: {
    width: 30, height: 30, borderRadius: 10,
    backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center',
  },

  loadingBox: { flex: 1, alignItems: 'center', paddingTop: 80, gap: 12 },
  loadingText: { color: '#94A3B8', fontSize: 14 },

  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, marginTop: 28, marginBottom: 14,
  },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: '#0F172A' },
  seeAll: { fontSize: 13, fontWeight: '700', color: '#4F46E5' },

  // Banner carousel
  carouselWrap: { paddingLeft: 20 },
  carouselTrack: { flexDirection: 'row', gap: 16 },
  bannerCard: { width: CARD_WIDTH, marginRight: 0 },
  bannerBg: {
    width: CARD_WIDTH, height: 170, borderRadius: 24,
    flexDirection: 'row', overflow: 'hidden',
    shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3, shadowRadius: 20, elevation: 10,
    position: 'relative',
  },
  decCircle1: {
    position: 'absolute', width: 160, height: 160, borderRadius: 80,
    top: -60, right: -20,
  },
  decCircle2: {
    position: 'absolute', width: 100, height: 100, borderRadius: 50,
    bottom: -30, left: 80,
  },
  bannerContent: {
    flex: 1, paddingLeft: 20, paddingVertical: 18, justifyContent: 'space-between', zIndex: 2,
  },
  tagPill: {
    alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
  },
  tagText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  bannerTitle: { fontSize: 28, fontWeight: '900', color: '#FFFFFF', lineHeight: 32 },
  bannerDesc: { fontSize: 11, fontWeight: '500', lineHeight: 15, marginTop: 2 },
  ctaRow: { flexDirection: 'row' },
  ctaBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12,
  },
  ctaText: { fontSize: 11, fontWeight: '800' },
  bannerImgWrap: { width: 115, position: 'relative' },
  bannerImg: { width: '100%', height: '100%' },
  bannerShine: {
    position: 'absolute', top: 0, left: 0, width: 40, height: '100%',
    backgroundColor: 'rgba(255,255,255,0.12)',
    transform: [{ skewX: '-10deg' }],
  },
  dotsRow: {
    flexDirection: 'row', gap: 6, justifyContent: 'center',
    marginTop: 12, paddingRight: 20,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#CBD5E1' },
  dotActive: { width: 22, backgroundColor: '#4F46E5', borderRadius: 3 },

  // Category grid - 2 columns with 3D cards
  categoryGrid: {
    paddingHorizontal: 20, flexDirection: 'row', flexWrap: 'wrap', gap: 14,
  },
  catCard: {
    width: (width - 54) / 2,
    position: 'relative', marginBottom: 4,
  },
  catFace: {
    borderRadius: 20, padding: 16, minHeight: 155,
    overflow: 'hidden', position: 'relative',
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15, shadowRadius: 10, elevation: 8,
  },
  catBlob: {
    position: 'absolute', width: 90, height: 90, borderRadius: 45,
    top: -20, right: -20,
  },
  catIconBox: {
    width: 52, height: 52, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 10,
  },
  catName: { fontSize: 15, fontWeight: '800', color: '#FFFFFF', marginBottom: 4 },
  catDesc: { fontSize: 10, color: 'rgba(255,255,255,0.75)', lineHeight: 14, marginBottom: 8 },
  catArrow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  catArrowText: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.7)' },
  catShadow: {
    position: 'absolute', bottom: -5, left: 6, right: 6,
    height: 12, borderRadius: 10, opacity: 0.35, zIndex: -1,
  },

  emptyServices: { alignItems: 'center', paddingVertical: 40, gap: 10 },
  emptyText: { fontSize: 15, fontWeight: '600', color: '#94A3B8' },
  emptySubText: { fontSize: 13, color: '#CBD5E1' },

  // Why Us section
  whyUsCard: {
    marginHorizontal: 20, marginTop: 24,
    backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20,
    shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06, shadowRadius: 12, elevation: 4,
    borderWidth: 1, borderColor: '#E0E7FF',
  },
  whyUsTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A', marginBottom: 16 },
  whyRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 14 },
  whyIcon: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center',
  },
  whyLabel: { fontSize: 13, fontWeight: '700', color: '#0F172A' },
  whyDesc: { fontSize: 11, color: '#94A3B8', marginTop: 2 },

  // Service type row selector styles
  serviceTypeRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 20,
    gap: 10,
    justifyContent: 'space-between',
  },
  serviceTypeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    position: 'relative',
    shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03, shadowRadius: 6, elevation: 2,
  },
  serviceTypeIconBg: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceTypeLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  soonBadge: {
    position: 'absolute',
    top: -6,
    right: 4,
    backgroundColor: '#94A3B8',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 6,
  },
  soonText: {
    fontSize: 7,
    fontWeight: '800',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },

  // Scrollable featured sub-services styles
  subScroll: {
    paddingLeft: 20,
    paddingRight: 20,
    gap: 16,
    paddingBottom: 10,
  },
  subCardWide: {
    width: 210,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E7FF',
    shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05, shadowRadius: 10, elevation: 3,
  },
  subCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  subCategoryBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  subCategoryBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#4F46E5',
    textTransform: 'uppercase',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
  },
  ratingBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#D97706',
  },
  subCardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  subCardDesc: {
    fontSize: 10,
    color: '#64748B',
    lineHeight: 14,
    height: 28,
    marginBottom: 12,
  },
  subCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subCardPrice: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  bookBtnSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#4F46E5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  bookBtnSmallText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // Coming Soon Cards
  comingSoonCard: {
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05, shadowRadius: 12, elevation: 4,
  },
  comingSoonIconBg: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  comingSoonTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 8,
    textAlign: 'center',
  },
  comingSoonDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  notifyBtn: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
  },
  notifyBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
