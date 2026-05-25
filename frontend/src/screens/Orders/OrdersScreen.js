import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { orderAPI } from '../../api/client';
import { useSocket } from '../../context/SocketContext';
import { useIsFocused } from '@react-navigation/native';

export default function OrdersScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const socket = useSocket();
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      fetchOrders();
    }
  }, [isFocused]);

  useEffect(() => {
    if (socket) {
      const handleOrderUpdated = (data) => {
        // data: { orderId, userId, status }
        setOrders((prevOrders) => 
          prevOrders.map((o) => 
            o._id === data.orderId ? { ...o, status: data.status } : o
          )
        );
      };

      socket.on('order_updated', handleOrderUpdated);
      return () => {
        socket.off('order_updated', handleOrderUpdated);
      };
    }
  }, [socket]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await orderAPI.getMyOrders();
      setOrders(res.data.orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'delivered': return '#10B981';
      case 'cancelled': return '#EF4444';
      default: return '#F59E0B';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Orders</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <ActivityIndicator size="large" color="#DC2626" style={{ marginTop: 40 }} />
        ) : orders.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={60} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>No Orders Yet</Text>
            <Text style={styles.emptySub}>You haven't placed any orders yet.</Text>
          </View>
        ) : (
          orders.map((order) => (
            <View key={order._id} style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <Text style={styles.resName}>{order.restaurantId?.name || 'Restaurant'}</Text>
                <Text style={[styles.orderStatus, { color: getStatusColor(order.status) }]}>
                  {order.status.toUpperCase()}
                </Text>
              </View>
              <Text style={styles.orderId}>Order #{order.orderNumber}</Text>
              <Text style={styles.orderDate}>{new Date(order.createdAt).toLocaleString()}</Text>
              
              <View style={styles.itemsList}>
                {order.items.map((item, idx) => (
                  <Text key={idx} style={styles.itemText}>
                    {item.quantity} x {item.name}
                  </Text>
                ))}
              </View>

              <View style={styles.orderFooter}>
                <Text style={styles.totalText}>Total: ₹{order.pricing.grandTotal}</Text>
                <TouchableOpacity style={styles.trackBtn}>
                  <Text style={styles.trackBtnText}>Details</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
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
    height: 60,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 80,
  },
  orderCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  resName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  orderStatus: {
    fontSize: 12,
    fontWeight: '800',
  },
  orderId: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 2,
  },
  orderDate: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 12,
  },
  itemsList: {
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 12,
    gap: 4,
  },
  itemText: {
    fontSize: 13,
    color: '#334155',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  trackBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
  },
  trackBtnText: {
    color: '#DC2626',
    fontWeight: '700',
    fontSize: 13,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 60,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#334155',
  },
  emptySub: {
    fontSize: 14,
    color: '#64748B',
  },
});
