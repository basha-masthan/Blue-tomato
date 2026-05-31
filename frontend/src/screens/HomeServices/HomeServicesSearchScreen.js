import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import client from '../../api/client';
import { API_CONFIG } from '../../config';

export default function HomeServicesSearchScreen({ navigation }) {
  const [searchValue, setSearchValue] = useState('');
  const [allServices, setAllServices] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const baseURL = API_CONFIG.BASE_URL.replace('/api/user', '/api');
      const res = await client.get(`${baseURL}/public/subcategories`);
      setAllServices(res.data?.subcategories || res.data || []);
    } catch (error) {
      console.log('Error fetching search services:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredServices = allServices.filter(s => 
    s.name.toLowerCase().includes(searchValue.toLowerCase()) || 
    (s.description && s.description.toLowerCase().includes(searchValue.toLowerCase()))
  );

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
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#2563EB" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            value={searchValue}
            onChangeText={setSearchValue}
            placeholder="Search for plumbing, electrician..."
            placeholderTextColor="#94A3B8"
          />
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.resultsLabel}>Search Results</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 20 }} />
        ) : (
          <View style={styles.servicesList}>
            {filteredServices.length === 0 ? (
              <Text style={{ textAlign: 'center', color: '#64748B', marginTop: 20 }}>No services found.</Text>
            ) : (
              filteredServices.map((item) => (
                <TouchableOpacity 
                  key={item._id} 
                  style={styles.serviceCard}
                  activeOpacity={0.9}
                  onPress={() => navigation.navigate('PlumbingDetails')}
                >
                  {/* Left plumber cartoon/wrench badge */}
                  <View style={styles.cardLeft}>
                    <View style={styles.iconCircleBg}>
                      <Ionicons name="build" size={32} color="#2563EB" />
                    </View>
                  </View>

                  {/* Center Details */}
                  <View style={styles.cardCenter}>
                    <Text style={styles.cardName}>{item.name}</Text>
                    <Text style={styles.cardDesc} numberOfLines={2}>{item.description || 'No description available.'}</Text>
                  </View>

                  {/* Right Action Price & add */}
                  <View style={styles.cardRight}>
                    <Text style={styles.cardPrice}>{item.basePrice ? `₹${item.basePrice}` : 'Free'}</Text>
                    <TouchableOpacity 
                      style={styles.addBtn}
                      activeOpacity={0.7}
                      onPress={() => navigation.navigate('PlumbingDetails')}
                    >
                      <Ionicons name="add" size={16} color="#FFF" />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
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
  resultsLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  servicesList: {
    paddingHorizontal: 20,
    gap: 16,
  },
  serviceCard: {
    backgroundColor: '#FFF',
    borderRadius: 22,
    padding: 16,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
    alignItems: 'center',
  },
  cardLeft: {
    marginRight: 14,
  },
  iconCircleBg: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardCenter: {
    flex: 1,
    gap: 4,
    marginRight: 10,
  },
  cardName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  cardDesc: {
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
  cardRight: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 64,
  },
  cardPrice: {
    fontSize: 15,
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
});
