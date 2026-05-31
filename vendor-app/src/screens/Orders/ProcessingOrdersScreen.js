import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, FlatList, RefreshControl, Alert, Modal, TextInput
} from 'react-native';
import { orderAPI } from '../../api/client';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';

export default function ProcessingOrdersScreen() {
  const [orders, setOrders] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const { socket } = useSocket();
  const { vendor } = useAuth();

  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  const fetchOrders = useCallback(async () => {
    try {
      const res = await orderAPI.getAll('processing');
      // For now we still use this endpoint but it should ideally return ServiceBookings too.
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

  const openCancelModal = (id) => {
    setSelectedOrderId(id);
    setCancelReason('');
    setCancelModalVisible(true);
  };

  const handleCancelLead = () => {
    if (!cancelReason.trim()) {
      return Alert.alert('Error', 'Please provide a reason for cancellation.');
    }
    
    if (socket && vendor) {
      socket.emit('cancel_lead', {
        bookingId: selectedOrderId,
        vendorId: vendor._id,
        reason: cancelReason,
      });
      Alert.alert('Success', 'Lead cancelled. It has been re-broadcasted.');
      setCancelModalVisible(false);
      fetchOrders(); // refresh
    }
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
        <Text style={styles.totalValue}>₹{item.totalAmount?.toFixed(2) || '0.00'}</Text>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
        <TouchableOpacity style={styles.cancelBtn} onPress={() => openCancelModal(item._id)}>
          <Text style={styles.cancelText}>Cancel Lead</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.completeBtn} onPress={() => handleComplete(item._id)}>
          <Text style={styles.completeText}>Job Done</Text>
        </TouchableOpacity>
      </View>
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

      <Modal visible={cancelModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Cancel Lead</Text>
            <Text style={styles.modalSubtitle}>Please provide a reason so we can inform the user and re-assign.</Text>
            
            <TextInput
              style={styles.input}
              placeholder="E.g. distance is too far, busy right now..."
              value={cancelReason}
              onChangeText={setCancelReason}
              multiline
            />
            
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalBtnCancel} onPress={() => setCancelModalVisible(false)}>
                <Text style={styles.modalBtnCancelText}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtnConfirm} onPress={handleCancelLead}>
                <Text style={styles.modalBtnConfirmText}>Cancel Job</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  cancelBtn: { flex: 1, backgroundColor: '#FBE9E7', borderRadius: 8, paddingVertical: 12, alignItems: 'center', marginRight: 8 },
  cancelText: { color: '#FF5252', fontWeight: '700', fontSize: 15 },
  completeBtn: { flex: 1, backgroundColor: '#34C759', borderRadius: 8, paddingVertical: 12, alignItems: 'center', marginLeft: 8 },
  completeText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { fontSize: 14, color: '#999' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalCard: { backgroundColor: '#fff', padding: 20, borderRadius: 12, width: '100%' },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#333', marginBottom: 8 },
  modalSubtitle: { fontSize: 14, color: '#666', marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, height: 100, textAlignVertical: 'top', marginBottom: 16 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  modalBtnCancel: { paddingHorizontal: 16, paddingVertical: 10 },
  modalBtnCancelText: { color: '#666', fontWeight: '600' },
  modalBtnConfirm: { backgroundColor: '#FF5252', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  modalBtnConfirmText: { color: '#fff', fontWeight: '600' },
});
