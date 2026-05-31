import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import client from '../../api/client';

export default function RegistrationTypeScreen({ route }) {
  const { register } = useAuth();
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategories, setSelectedSubcategories] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const { basicDetails } = route.params || {};

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await client.get('/public/categories');
      setCategories(res.data.categories || []);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    } finally {
      setFetching(false);
    }
  };

  const fetchSubcategories = async (categoryId) => {
    try {
      const res = await client.get(`/public/subcategories?categoryId=${categoryId}`);
      setSubcategories(res.data.subcategories || []);
    } catch (err) {
      console.error('Failed to fetch subcategories:', err);
    }
  };

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    setSelectedSubcategories([]); // Reset subcategories
    fetchSubcategories(categoryId);
  };

  const handleSubcategoryToggle = (subId) => {
    setSelectedSubcategories(prev => 
      prev.includes(subId) ? prev.filter(id => id !== subId) : [...prev, subId]
    );
  };

  const handleSubmit = async () => {
    if (!selectedCategory) return Alert.alert('Error', 'Please select a service category');
    setLoading(true);
    try {
      const payload = {
        name: basicDetails.name,
        email: basicDetails.email,
        phone: basicDetails.phone,
        password: basicDetails.password,
        dateOfBirth: basicDetails.dateOfBirth || undefined,
        bloodGroup: basicDetails.bloodGroup || undefined,
        emergencyContact: basicDetails.emergencyContact || undefined,
        serviceCategory: selectedCategory,
        serviceSubcategories: selectedSubcategories,
        aadhaar: {
          number: basicDetails.aadhaarNumber || undefined,
        },
        pan: {
          number: basicDetails.panNumber || undefined,
        },
        currentAddress: {
          apartment: basicDetails.apartment,
          state: basicDetails.state,
          city: basicDetails.city,
          country: basicDetails.country,
          zip: basicDetails.zip,
        },
        sameAsCurrentAddress: basicDetails.sameAsCurrent,
        ...(basicDetails.sameAsCurrent ? {} : {
          permanentAddress: {
            apartment: basicDetails.permanentApartment,
            state: basicDetails.permanentState,
            city: basicDetails.permanentCity,
            country: basicDetails.permanentCountry,
            zip: basicDetails.permanentZip,
          },
        }),
        bankDetails: {
          bankName: basicDetails.bankName,
          accountNumber: basicDetails.accountNumber,
          ifscCode: basicDetails.ifscCode,
        },
      };
      await register(payload);
    } catch (err) {
      Alert.alert('Registration Failed', err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Choose Your Expertise</Text>
      <Text style={styles.subtitle}>Select the primary service you offer</Text>

      {fetching ? (
        <ActivityIndicator size="large" color="#FF6B35" />
      ) : (
        <View style={styles.grid}>
          {categories.map((item) => (
            <TouchableOpacity
              key={item._id}
              style={[styles.card, selectedCategory === item._id && styles.cardSelected]}
              onPress={() => handleCategorySelect(item._id)}
            >
              <Ionicons
                name={item.image || 'construct'} // Fallback icon
                size={36}
                color={selectedCategory === item._id ? '#FF6B35' : '#999'}
              />
              <Text style={[styles.cardLabel, selectedCategory === item._id && styles.cardLabelSelected]}>
                {item.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {selectedCategory && subcategories.length > 0 && (
        <View style={styles.subContainer}>
          <Text style={styles.subTitle}>Select Specific Services</Text>
          <View style={styles.subGrid}>
            {subcategories.map((sub) => {
              const isSelected = selectedSubcategories.includes(sub._id);
              return (
                <TouchableOpacity
                  key={sub._id}
                  style={[styles.subCard, isSelected && styles.subCardSelected]}
                  onPress={() => handleSubcategoryToggle(sub._id)}
                >
                  <Text style={[styles.subCardLabel, isSelected && styles.subCardLabelSelected]}>
                    {sub.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      <TouchableOpacity
        style={[styles.submitBtn, (!selectedCategory || selectedSubcategories.length === 0) && styles.submitBtnDisabled]}
        onPress={handleSubmit}
        disabled={loading || !selectedCategory || selectedSubcategories.length === 0}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitBtnText}>Register</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#fff', padding: 24, justifyContent: 'center' },
  title: { fontSize: 26, fontWeight: '800', color: '#FF6B35', textAlign: 'center', marginTop: 40 },
  subtitle: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 32, marginTop: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: {
    width: '48%', padding: 20, borderRadius: 12, borderWidth: 2, borderColor: '#eee',
    alignItems: 'center', marginBottom: 16, backgroundColor: '#fafafa',
  },
  cardSelected: { borderColor: '#FF6B35', backgroundColor: '#FFF5F0' },
  cardLabel: { marginTop: 10, fontSize: 14, fontWeight: '600', color: '#666', textAlign: 'center' },
  cardLabelSelected: { color: '#FF6B35' },
  
  subContainer: { marginTop: 20 },
  subTitle: { fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 16 },
  subGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  subCard: {
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20,
    backgroundColor: '#eee', marginRight: 10, marginBottom: 10,
  },
  subCardSelected: { backgroundColor: '#FF6B35' },
  subCardLabel: { color: '#666', fontWeight: '600' },
  subCardLabelSelected: { color: '#fff' },

  submitBtn: { backgroundColor: '#FF6B35', borderRadius: 8, paddingVertical: 16, alignItems: 'center', marginTop: 24, marginBottom: 40 },
  submitBtnDisabled: { opacity: 0.5 },
  submitBtnText: { color: '#fff', fontSize: 18, fontWeight: '700' },
});
