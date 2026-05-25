import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, RefreshControl, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { profileAPI, orderAPI, authAPI } from '../../api/client';

const TIME_FILTERS = [
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'This Week' },
  { key: 'month', label: 'This Month' },
  { key: 'year', label: 'This Year' },
];

export default function DashboardScreen({ navigation }) {
  const { vendor, refreshVendor } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('today');

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, ordersRes] = await Promise.all([
        profileAPI.getDashboardStats(selectedFilter),
        orderAPI.getAll('pending'),
      ]);
      setStats(statsRes.data.stats);
      setRecentOrders(ordersRes.data.orders.slice(0, 10));
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    }
  }, [selectedFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleToggleOnline = async () => {
    setToggling(true);
    try {
      await authAPI.toggleOnline();
      await refreshVendor();
    } catch (err) {
      Alert.alert('Error', 'Failed to toggle status');
    } finally {
      setToggling(false);
    }
  };

  const handleAccept = async (orderId) => {
    try {
      await orderAPI.accept(orderId);
      fetchData();
    } catch (err) {
      Alert.alert('Error', 'Failed to accept order');
    }
  };

  const handleDecline = async (orderId) => {
    try {
      await orderAPI.decline(orderId);
      fetchData();
    } catch (err) {
      Alert.alert('Error', 'Failed to decline order');
    }
  };

  const isOnline = vendor?.isOnline;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello,</Text>
          <Text style={styles.vendorName}>{vendor?.name?.split(' ')[0] || 'Vendor'}</Text>
        </View>

        {/* Online/Offline Toggle */}
        <TouchableOpacity
          style={[styles.toggleContainer, isOnline ? styles.toggleOn : styles.toggleOff]}
          onPress={handleToggleOnline}
          disabled={toggling}
          activeOpacity={0.8}
        >
          <View style={[styles.toggleKnob, isOnline ? styles.knobRight : styles.knobLeft]}>
            <Ionicons
              name={isOnline ? 'power' : 'power-outline'}
              size={16}
              color={isOnline ? '#fff' : '#999'}
            />
          </View>
          <View style={[styles.toggleLabel, isOnline ? styles.labelOn : styles.labelOff]}>
            <Text style={[styles.toggleLabelText, isOnline ? styles.labelTextOn : styles.labelTextOff]}>
              {isOnline ? 'ONLINE' : 'OFFLINE'}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Time Filter */}
      <View style={styles.filterContainer}>
        {TIME_FILTERS.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterChip,
              selectedFilter === filter.key && styles.filterChipActive,
            ]}
            onPress={() => setSelectedFilter(filter.key)}
          >
            <Text
              style={[
                styles.filterText,
                selectedFilter === filter.key && styles.filterTextActive,
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Stats Cards */}
      {stats && (
        <>
          <View style={styles.mainStatsCard}>
            <View style={styles.mainStatRow}>
              <View style={styles.mainStatItem}>
                <Text style={styles.mainStatLabel}>Total Orders</Text>
                <Text style={styles.mainStatValue}>{stats.totalOrders || 0}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.mainStatItem}>
                <Text style={styles.mainStatLabel}>Earnings</Text>
                <Text style={styles.mainStatValue}>₹{(stats.earnings || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
              </View>
            </View>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={[styles.statIconBg, { backgroundColor: '#FFF5F0' }]}>
                <Ionicons name="today-outline" size={20} color="#FF6B35" />
              </View>
              <Text style={styles.statValue}>{stats.periodOrders || 0}</Text>
              <Text style={styles.statLabel}>
                {selectedFilter === 'today' ? "Today's Orders" :
                 selectedFilter === 'week' ? 'This Week' :
                 selectedFilter === 'month' ? 'This Month' : 'This Year'}
              </Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIconBg, { backgroundColor: '#E8F5E9' }]}>
                <Ionicons name="wallet-outline" size={20} color="#34C759" />
              </View>
              <Text style={styles.statValue}>₹{(stats.periodEarnings || 0).toLocaleString('en-IN', { minimumFractionDigits: 0 })}</Text>
              <Text style={styles.statLabel}>
                {selectedFilter === 'today' ? "Today's Earnings" :
                 selectedFilter === 'week' ? 'This Week' :
                 selectedFilter === 'month' ? 'This Month' : 'This Year'}
              </Text>
            </View>
          </View>

          {/* Order Status Row */}
          <View style={styles.orderStatusRow}>
            <TouchableOpacity
              style={[styles.statusCard, styles.pendingCard]}
              onPress={() => navigation.navigate('Orders', { screen: 'PendingOrders' })}
            >
              <View style={styles.statusIconBg}>
                <Ionicons name="time" size={22} color="#F59E0B" />
              </View>
              <Text style={styles.statusValue}>{stats.pendingOrders}</Text>
              <Text style={styles.statusLabel}>Pending</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.statusCard, styles.processingCard]}
              onPress={() => navigation.navigate('Orders', { screen: 'ProcessingOrders' })}
            >
              <View style={styles.statusIconBg}>
                <Ionicons name="reload" size={22} color="#3B82F6" />
              </View>
              <Text style={styles.statusValue}>{stats.processingOrders}</Text>
              <Text style={styles.statusLabel}>Processing</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.statusCard, styles.completedCard]}
              onPress={() => navigation.navigate('Orders', { screen: 'CompletedOrders' })}
            >
              <View style={styles.statusIconBg}>
                <Ionicons name="checkmark-circle" size={22} color="#10B981" />
              </View>
              <Text style={styles.statusValue}>{stats.completedOrders}</Text>
              <Text style={styles.statusLabel}>Completed</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* Recent Orders Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Orders</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Orders', { screen: 'PendingOrders' })}>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>

      {recentOrders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="receipt-outline" size={48} color="#ddd" />
          <Text style={styles.emptyText}>No pending orders</Text>
        </View>
      ) : (
        recentOrders.map((order) => (
          <View key={order._id} style={styles.orderCard}>
            <View style={styles.orderHeader}>
              <View style={styles.orderHeaderLeft}>
                <View style={styles.customerAvatar}>
                  <Text style={styles.customerInitial}>
                    {order.customer?.name?.charAt(0)?.toUpperCase() || 'C'}
                  </Text>
                </View>
                <View>
                  <Text style={styles.customerName}>{order.customer?.name}</Text>
                  <Text style={styles.orderId}>#{order.orderId}</Text>
                </View>
              </View>
              <View style={styles.orderHeaderRight}>
                <Text style={styles.orderTime}>
                  {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
                {order.paymentStatus === 'prepaid' && (
                  <View style={styles.prepaidBadge}>
                    <Ionicons name="card" size={12} color="#10B981" />
                    <Text style={styles.prepaidText}>Prepaid</Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.itemsContainer}>
              {order.items?.slice(0, 3).map((item, idx) => (
                <View key={idx} style={styles.itemRow}>
                  <Text style={styles.itemName}>{item.quantity}x {item.name}</Text>
                  <Text style={styles.itemPrice}>₹{item.price.toFixed(2)}</Text>
                </View>
              ))}
              {order.items?.length > 3 && (
                <Text style={styles.moreItemsText}>+{order.items.length - 3} more items</Text>
              )}
            </View>

            <View style={styles.orderFooter}>
              <View style={styles.totalContainer}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>₹{order.totalAmount.toFixed(2)}</Text>
              </View>
              <View style={styles.orderActions}>
                <TouchableOpacity
                  style={styles.declineBtn}
                  onPress={() => handleDecline(order._id)}
                >
                  <Text style={styles.declineText}>Decline</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.acceptBtn}
                  onPress={() => handleAccept(order._id)}
                >
                  <Ionicons name="checkmark" size={16} color="#fff" />
                  <Text style={styles.acceptText}>Accept</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))
      )}

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FF6B35',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  greeting: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  vendorName: { fontSize: 24, fontWeight: '800', color: '#fff' },

  // Toggle Switch
  toggleContainer: {
    width: 90,
    height: 44,
    borderRadius: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    overflow: 'hidden',
  },
  toggleOn: { backgroundColor: '#10B981' },
  toggleOff: { backgroundColor: '#FEE2E2' },
  toggleKnob: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  knobRight: { position: 'absolute', right: 4 },
  knobLeft: { position: 'absolute', left: 4 },
  toggleLabel: {
    position: 'absolute',
    width: 50,
    alignItems: 'center',
  },
  labelOn: { right: 8 },
  labelOff: { left: 8 },
  toggleLabelText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  labelTextOn: { color: '#fff' },
  labelTextOff: { color: '#EF4444' },

  // Filter
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterChipActive: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  filterText: { fontSize: 12, fontWeight: '600', color: '#6B7280' },
  filterTextActive: { color: '#fff' },

  // Main Stats
  mainStatsCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  mainStatRow: { flexDirection: 'row', alignItems: 'center' },
  mainStatItem: { flex: 1, alignItems: 'center' },
  statDivider: { width: 1, height: 50, backgroundColor: '#E5E7EB' },
  mainStatLabel: { fontSize: 12, color: '#6B7280', fontWeight: '500', marginBottom: 4 },
  mainStatValue: { fontSize: 28, fontWeight: '800', color: '#FF6B35' },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
  },
  statIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: { fontSize: 18, fontWeight: '800', color: '#1F2937', marginVertical: 4 },
  statLabel: { fontSize: 11, color: '#6B7280', textAlign: 'center' },

  // Order Status
  orderStatusRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 10,
  },
  statusCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    elevation: 2,
  },
  pendingCard: { borderTopWidth: 3, borderTopColor: '#F59E0B' },
  processingCard: { borderTopWidth: 3, borderTopColor: '#3B82F6' },
  completedCard: { borderTopWidth: 3, borderTopColor: '#10B981' },
  statusIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    marginBottom: 6,
  },
  statusValue: { fontSize: 22, fontWeight: '800', color: '#1F2937' },
  statusLabel: { fontSize: 11, color: '#6B7280', marginTop: 2 },

  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1F2937' },
  seeAllText: { fontSize: 14, color: '#FF6B35', fontWeight: '600' },

  // Empty State
  emptyContainer: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 14, color: '#9CA3AF', marginTop: 12 },

  // Order Card
  orderCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    padding: 16,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderHeaderLeft: { flexDirection: 'row', alignItems: 'center' },
  customerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  customerInitial: { fontSize: 16, fontWeight: '700', color: '#fff' },
  customerName: { fontSize: 15, fontWeight: '700', color: '#1F2937' },
  orderId: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  orderHeaderRight: { alignItems: 'flex-end' },
  orderTime: { fontSize: 12, color: '#6B7280' },
  prepaidBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 4,
  },
  prepaidText: { fontSize: 10, color: '#059669', fontWeight: '600', marginLeft: 4 },

  // Items
  itemsContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  itemName: { fontSize: 13, color: '#4B5563' },
  itemPrice: { fontSize: 13, fontWeight: '600', color: '#1F2937' },
  moreItemsText: { fontSize: 12, color: '#9CA3AF', marginTop: 4, fontStyle: 'italic' },

  // Footer
  orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalContainer: {},
  totalLabel: { fontSize: 12, color: '#6B7280' },
  totalValue: { fontSize: 18, fontWeight: '800', color: '#FF6B35' },
  orderActions: { flexDirection: 'row', gap: 10 },
  declineBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#FEE2E2',
  },
  declineText: { color: '#EF4444', fontWeight: '700', fontSize: 13 },
  acceptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#FF6B35',
    gap: 4,
  },
  acceptText: { color: '#fff', fontWeight: '700', fontSize: 13 },

  bottomPadding: { height: 100 },
});