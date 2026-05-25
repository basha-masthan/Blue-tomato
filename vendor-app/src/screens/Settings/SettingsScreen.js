import React, { useState } from 'react';
import { View, Text, Switch, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreen() {
  const [notifications, setNotifications] = useState(true);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <View style={styles.section}>
        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <Ionicons name="notifications-outline" size={22} color="#555" />
            <Text style={styles.rowLabel}>Notifications</Text>
          </View>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ false: '#ddd', true: '#FF6B35' }}
            thumbColor="#fff"
          />
        </View>
      </View>

      <TouchableOpacity style={styles.row}>
        <View style={styles.rowLeft}>
          <Ionicons name="shield-checkmark-outline" size={22} color="#555" />
          <Text style={styles.rowLabel}>Permissions</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#ccc" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.row}>
        <View style={styles.rowLeft}>
          <Ionicons name="document-text-outline" size={22} color="#555" />
          <Text style={styles.rowLabel}>Privacy Policy</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#ccc" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  title: { fontSize: 22, fontWeight: '800', color: '#333', padding: 20, paddingBottom: 16 },
  section: { backgroundColor: '#fff', marginBottom: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 0.5, borderBottomColor: '#f0f0f0' },
  rowLeft: { flexDirection: 'row', alignItems: 'center' },
  rowLabel: { fontSize: 15, color: '#333', marginLeft: 14 },
});
