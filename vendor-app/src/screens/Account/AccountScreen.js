import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { profileAPI } from '../../api/client';

const MENU_ITEMS = [
  { icon: 'person-outline', label: 'Profile', screen: 'Profile' },
  { icon: 'time-outline', label: 'Order History', screen: 'OrderHistory' },
  { icon: 'card-outline', label: 'Transactions', screen: 'Transactions' },
  { icon: 'settings-outline', label: 'Settings', screen: 'Settings' },
];

export default function AccountScreen({ navigation }) {
  const { vendor, logout } = useAuth();
  const [stats, setStats] = useState({ lastMonthEarnings: 0, totalOrders: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const res = await profileAPI.getDashboardStats();
      setStats(res.data.stats);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {vendor?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'VN'}
          </Text>
        </View>
        <Text style={styles.name}>{vendor?.name || 'Vendor'}</Text>
        <Text style={styles.phone}>{vendor?.phone || ''}</Text>
        <Text style={styles.joinDate}>
          Joined {vendor?.createdAt ? new Date(vendor.createdAt).toLocaleDateString() : ''}
        </Text>
      </View>

      <View style={styles.earningsCard}>
        <View style={styles.earningRow}>
          <Text style={styles.earningLabel}>Earnings</Text>
          <Text style={styles.earningValue}>
            ₹{stats.lastMonthEarnings?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}
          </Text>
        </View>
        <View style={styles.earningRow}>
          <Text style={styles.earningLabel}>Total Orders</Text>
          <Text style={styles.earningValue}>
            {stats.totalOrders || 0}
          </Text>
        </View>
      </View>

      {MENU_ITEMS.map((item, index) => (
        <TouchableOpacity
          key={index}
          style={styles.menuItem}
          onPress={() => navigation.navigate(item.screen)}
        >
          <Ionicons name={item.icon} size={22} color="#555" />
          <Text style={styles.menuLabel}>{item.label}</Text>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={styles.bankRow} onPress={() => navigation.navigate('BankDetails')}>
        <Ionicons name="business-outline" size={22} color="#555" />
        <Text style={styles.menuLabel}>Bank Details</Text>
        <Ionicons name="chevron-forward" size={20} color="#ccc" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.bankRow} onPress={() => navigation.navigate('Documents')}>
        <Ionicons name="document-text-outline" size={22} color="#555" />
        <Text style={styles.menuLabel}>My Documents</Text>
        <Ionicons name="chevron-forward" size={20} color="#ccc" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={22} color="#FF5252" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  profileCard: { backgroundColor: '#fff', alignItems: 'center', padding: 24, borderBottomWidth: 1, borderBottomColor: '#eee' },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#FF6B35', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarText: { fontSize: 24, fontWeight: '800', color: '#fff' },
  name: { fontSize: 20, fontWeight: '800', color: '#333' },
  phone: { fontSize: 13, color: '#666', marginTop: 4 },
  joinDate: { fontSize: 11, color: '#999', marginTop: 2 },
  earningsCard: { backgroundColor: '#fff', marginHorizontal: 16, marginTop: 16, borderRadius: 12, padding: 16, elevation: 2 },
  earningRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  earningLabel: { fontSize: 14, color: '#666' },
  earningValue: { fontSize: 14, fontWeight: '700', color: '#333' },
  menuItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 20, paddingVertical: 16, marginTop: 1 },
  menuLabel: { flex: 1, fontSize: 15, color: '#333', marginLeft: 14 },
  bankRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 20, paddingVertical: 16, marginTop: 1 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', marginHorizontal: 16, marginTop: 24, paddingVertical: 16, borderRadius: 12, elevation: 2 },
  logoutText: { color: '#FF5252', fontWeight: '700', fontSize: 16, marginLeft: 8 },
});
