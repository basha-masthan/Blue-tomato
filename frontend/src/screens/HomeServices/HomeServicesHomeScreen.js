import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function HomeServicesHomeScreen({ navigation }) {
  const popularServices = [
    { id: '1', title: 'Plumbing', desc: 'Leaky pipes & repair', icon: 'construct', color: '#EFF6FF', textColor: '#2563EB', illustration: '🪠' },
    { id: '2', title: 'Carpenter / Woodwork', desc: 'Furniture & woodwork', icon: 'hammer', color: '#FFF7ED', textColor: '#EA580C', illustration: '🪚' },
  ];

  const moreServices = [
    { id: 'carpenter', name: 'Carpenter', icon: 'hammer-outline', color: '#FFF7ED', iconColor: '#EA580C' },
    { id: 'electrician', name: 'Electrician', icon: 'flash-outline', color: '#F0FDF4', iconColor: '#16A34A' },
    { id: 'plumbing', name: 'Plumbing', icon: 'construct-outline', color: '#EFF6FF', iconColor: '#2563EB' },
    { id: 'cleaner', name: 'Cleaner', icon: 'leaf-outline', color: '#FAF5FF', iconColor: '#9333EA' },
    { id: 'painter', name: 'Painter', icon: 'brush-outline', color: '#FFF1F2', iconColor: '#E11D48' },
  ];

  const handleSearch = () => {
    navigation.navigate('HomeServicesSearch');
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
          <Ionicons name="search-outline" size={20} color="#94A3B8" style={styles.searchIcon} />
          <Text style={styles.searchPlaceholder}>Plumbing, Carpentry, Cleaner</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        {/* Popular Services Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Popular Services</Text>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.popularScroll}>
            {popularServices.map((service) => (
              <TouchableOpacity 
                key={service.id} 
                style={[styles.popularCard, { backgroundColor: service.color }]}
                activeOpacity={0.85}
                onPress={handleSearch}
              >
                <View style={styles.illustrationWrapper}>
                  <Text style={styles.illustrationEmoji}>{service.illustration}</Text>
                </View>
                <View style={styles.popularCardContent}>
                  <Text style={styles.popularCardTitle}>{service.title}</Text>
                  <Text style={styles.popularCardDesc}>{service.desc}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* More Services Section */}
        <View style={[styles.section, { marginTop: 32 }]}>
          <Text style={styles.sectionTitle}>More Services</Text>
          
          <View style={styles.gridContainer}>
            {moreServices.map((item) => (
              <TouchableOpacity 
                key={item.id} 
                style={styles.gridItem}
                activeOpacity={0.8}
                onPress={handleSearch}
              >
                <View style={[styles.gridIconCircle, { backgroundColor: item.color }]}>
                  <Ionicons name={item.icon} size={24} color={item.iconColor} />
                </View>
                <Text style={styles.gridItemText}>{item.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
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
  searchingNear: {
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
    color: '#2563EB',
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
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  popularScroll: {
    gap: 16,
    paddingBottom: 4,
  },
  popularCard: {
    width: 220,
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 2,
  },
  illustrationWrapper: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  illustrationEmoji: {
    fontSize: 24,
  },
  popularCardContent: {
    flex: 1,
    gap: 2,
  },
  popularCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  popularCardDesc: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  gridItem: {
    width: '30%',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  gridIconCircle: {
    width: 66,
    height: 66,
    borderRadius: 33,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  gridItemText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
});
