import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, FlatList, RefreshControl, Alert,
} from 'react-native';
import { orderAPI } from '../../api/client';

export default function ProcessingOrdersScreen() {
  const [orders, setOrders] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await orderAPI.getAll('processing');
      setOrders(res.data.orders);
    } catch (err) { console.error(err); }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  const handleComplete = async (id) => {
    try {
      await orderAPI.complete(id);
      fetchOrders();
    } catch { Alert.alert('Error', 'Failed to complete order'); }
  };

  const renderOrder = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.customerName}>{item.customer?.name}</Text>
          <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
        </View>
        <Text style={styles.orderId}>#{item.orderId}</Text>
      </View>
      <View style={styles.tableHeader}>
        <Text style={[styles.cell, { flex: 2 }]}>Item</Text>
        <Text style={[styles.cell, { flex: 1, textAlign: 'center' }]}>Qty</Text>
        <Text style={[styles.cell, { flex: 1, textAlign: 'right' }]}>Price</Text>
      </View>
      {item.items?.map((i, idx) => (
        <View key={idx} style={styles.itemRow}>
          <Text style={[styles.cell, { flex: 2 }]}>{i.name}</Text>
          <Text style={[styles.cell, { flex: 1, textAlign: 'center' }]}>{i.quantity}</Text>
          <Text style={[styles.cell, { flex: 1, textAlign: 'right', fontWeight: '600' }]}>₹{i.price.toFixed(2)}</Text>
        </View>
      ))}
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>₹{item.totalAmount.toFixed(2)}</Text>
      </View>
      <TouchableOpacity style={styles.completeBtn} onPress={() => handleComplete(item._id)}>
        <Text style={styles.completeText}>Order Completed</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.screenTitle}>Processing Orders</Text>
      <FlatList
        data={orders}
        renderItem={renderOrder}
        keyExtractor={(item) => item._id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={orders.length === 0 ? styles.emptyContainer : { padding: 16 }}
        ListEmptyComponent={<Text style={styles.empty}>No processing orders</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  screenTitle: { fontSize: 20, fontWeight: '800', color: '#333', padding: 20, paddingBottom: 8 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  customerName: { fontSize: 16, fontWeight: '700', color: '#333' },
  date: { fontSize: 12, color: '#999', marginTop: 2 },
  orderId: { fontSize: 12, color: '#FF6B35', fontWeight: '600' },
  tableHeader: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 6, marginBottom: 4 },
  cell: { fontSize: 13, color: '#555' },
  itemRow: { flexDirection: 'row', paddingVertical: 4, borderBottomWidth: 0.5, borderBottomColor: '#f5f5f5' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#eee' },
  totalLabel: { fontSize: 15, fontWeight: '700', color: '#333' },
  totalValue: { fontSize: 15, fontWeight: '800', color: '#FF6B35' },
  completeBtn: { backgroundColor: '#34C759', borderRadius: 8, paddingVertical: 12, alignItems: 'center', marginTop: 12 },
  completeText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { fontSize: 14, color: '#999' },
});
