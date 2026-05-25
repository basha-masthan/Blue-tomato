import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, RefreshControl, ActivityIndicator,
} from 'react-native';
import { transactionAPI } from '../../api/client';

export default function TransactionsScreen() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTransactions = useCallback(async () => {
    try {
      const res = await transactionAPI.getAll();
      setTransactions(res.data.transactions);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTransactions();
    setRefreshing(false);
  };

  const renderTransaction = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.serviceType}>{item.serviceType || 'Service'}</Text>
        <View style={[styles.statusBadge, item.status === 'payment_received' ? styles.received : styles.pending]}>
          <Text style={[styles.statusText, item.status === 'payment_received' ? styles.receivedText : styles.pendingText]}>
            {item.status === 'payment_received' ? 'Payment Received' : 'Payment Pending'}
          </Text>
        </View>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Order: {item.order?.orderId || '#'}</Text>
        <Text style={styles.amount}>₹{item.amount?.toLocaleString() || '0'}</Text>
      </View>
      <Text style={styles.txnId}>Txn ID: {item.transactionId}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Transactions</Text>
      <FlatList
        data={transactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item._id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={transactions.length === 0 ? styles.emptyContainer : { padding: 16 }}
        ListEmptyComponent={<Text style={styles.empty}>No transactions found</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: '800', color: '#333', padding: 20, paddingBottom: 8 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 10, elevation: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  serviceType: { fontSize: 16, fontWeight: '700', color: '#333' },
  label: { fontSize: 13, color: '#666' },
  amount: { fontSize: 15, fontWeight: '800', color: '#333' },
  txnId: { fontSize: 11, color: '#999', marginTop: 4 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  received: { backgroundColor: '#E8F5E9' },
  pending: { backgroundColor: '#FFF8E1' },
  statusText: { fontSize: 11, fontWeight: '700' },
  receivedText: { color: '#2E7D32' },
  pendingText: { color: '#F57F17' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { fontSize: 14, color: '#999' },
});
