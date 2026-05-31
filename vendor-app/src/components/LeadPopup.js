import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function LeadPopup() {
  const { socket } = useSocket();
  const navigation = useNavigation();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(false);

  const { vendor } = useAuth();
  
  useEffect(() => {
    if (!socket) return;

    const handleNewLead = (data) => {
      console.log('New lead received:', data);
      setLead(data); // data: { bookingId, serviceName, address, scheduledDate, pricing }
    };

    const handleLeadTaken = (data) => {
      // Another vendor took this lead
      if (lead && lead.bookingId === data.bookingId) {
        setLead(null);
        Alert.alert('Lead taken', 'Another vendor accepted this request first.');
      }
    };

    socket.on('lead_broadcast', handleNewLead);
    socket.on('lead_taken', handleLeadTaken);

    return () => {
      socket.off('lead_broadcast', handleNewLead);
      socket.off('lead_taken', handleLeadTaken);
    };
  }, [socket, lead]);

  const handleAccept = () => {
    if (!socket || !lead || !vendor) return;
    setLoading(true);

    socket.emit('claim_lead', { bookingId: lead.bookingId, vendorId: vendor._id }, (response) => {
      setLoading(false);
      if (response.success) {
        Alert.alert('Success', 'You have claimed this job!');
        setLead(null);
        // Assuming there is an OrderDetails route or Dashboard refresh
        navigation.navigate('Orders');
      } else {
        Alert.alert('Too Late', response.message || 'This lead was already claimed.');
        setLead(null);
      }
    });
  };

  const handleReject = () => {
    if (!socket || !lead) return;
    // We just ignore the popup. No need to inform the server unless we want to remove them from future broadcasts for this exact lead right now.
    // For simplicity, just hide the popup.
    setLead(null);
  };

  if (!lead) return null;

  return (
    <Modal visible={!!lead} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Ionicons name="flash" size={24} color="#FF6B35" />
            <Text style={styles.headerTitle}>New Service Request!</Text>
          </View>
          
          <Text style={styles.serviceName}>{lead.serviceName}</Text>
          <Text style={styles.address}>
            <Ionicons name="location" size={16} color="#666" /> {lead.address.addressLine1}, {lead.address.city}
          </Text>
          
          <Text style={styles.price}>Est. Total: ₹{lead.pricing?.grandTotal}</Text>
          
          <View style={styles.actions}>
            <TouchableOpacity style={[styles.btn, styles.rejectBtn]} onPress={handleReject} disabled={loading}>
              <Text style={styles.rejectText}>Decline</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.btn, styles.acceptBtn]} onPress={handleAccept} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.acceptText}>Accept Job</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    minHeight: 250,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FF6B35',
    marginLeft: 8,
  },
  serviceName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#333',
    marginBottom: 8,
  },
  address: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  price: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 24,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  btn: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  rejectBtn: {
    backgroundColor: '#eee',
    marginRight: 8,
  },
  acceptBtn: {
    backgroundColor: '#FF6B35',
    marginLeft: 8,
  },
  rejectText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  acceptText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
