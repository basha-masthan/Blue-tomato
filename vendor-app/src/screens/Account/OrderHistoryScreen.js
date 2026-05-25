import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, SectionList, RefreshControl, ActivityIndicator } from 'react-native';
import { orderAPI } from '../../api/client';

export default function OrderHistoryScreen() {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await orderAPI.getHistory();
      const grouped = res.data.groupedHistory;
      const sortedDates = Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a));
      const sects = sortedDates.map(date => ({
        title: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        data: grouped[date],
      }));
      setSections(sects);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchHistory();
    setRefreshing(false);
  };

  if (loading) {
    return <View style={styles.loader}><ActivityIndicator size="large" color="#FF6B35" /></View>;
  }

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.customerName}>{item.customer?.name}</Text>
        <Text style={styles.amount}>₹{item.totalAmount.toFixed(2)}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.time}>{new Date(item.createdAt).toLocaleTimeString()}</Text>
        <Text style={styles.orderId}>#{item.orderId}</Text>
      </View>
      {item.serviceType && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{item.serviceType}</Text>
        </View>
      )}
    </View>
  );

  const renderSectionHeader = ({ section }) => (
    <Text style={styles.sectionHeader}>{section.title}</Text>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Order History</Text>
      <SectionList
        sections={sections}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={(item) => item._id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={sections.length === 0 ? styles.emptyContainer : { padding: 16 }}
        ListEmptyComponent={<Text style={styles.empty}>No order history</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: '800', color: '#333', padding: 20, paddingBottom: 8 },
  sectionHeader: { fontSize: 14, fontWeight: '700', color: '#FF6B35', marginTop: 16, marginBottom: 8, paddingHorizontal: 4 },
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 14, marginBottom: 8, elevation: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  customerName: { fontSize: 15, fontWeight: '600', color: '#333' },
  amount: { fontSize: 14, fontWeight: '700', color: '#FF6B35' },
  time: { fontSize: 12, color: '#999', marginTop: 4 },
  orderId: { fontSize: 12, color: '#999', marginTop: 4 },
  badge: { alignSelf: 'flex-start', backgroundColor: '#FFF5F0', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, marginTop: 6 },
  badgeText: { fontSize: 11, color: '#FF6B35', fontWeight: '600' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { fontSize: 14, color: '#999' },
});
