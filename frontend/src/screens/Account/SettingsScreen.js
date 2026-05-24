import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreen({ navigation }) {
  const [notifications, setNotifications] = useState(true);
  const [emails, setEmails] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [biometrics, setBiometrics] = useState(true);

  const settingSections = [
    {
      title: 'Preferences',
      items: [
        { id: 'notifications', title: 'Push Notifications', type: 'toggle', value: notifications, setValue: setNotifications, icon: 'notifications-outline' },
        { id: 'emails', title: 'Email Newsletters', type: 'toggle', value: emails, setValue: setEmails, icon: 'mail-outline' },
        { id: 'darkMode', title: 'Dark Mode', type: 'toggle', value: darkMode, setValue: setDarkMode, icon: 'moon-outline' },
        { id: 'biometrics', title: 'Biometric Authentication', type: 'toggle', value: biometrics, setValue: setBiometrics, icon: 'finger-print-outline' },
      ]
    },
    {
      title: 'Support & Info',
      items: [
        { id: 'language', title: 'Language', type: 'link', value: 'English (US)', icon: 'globe-outline' },
        { id: 'help', title: 'Help & FAQ', type: 'link', icon: 'help-circle-outline' },
        { id: 'privacy', title: 'Privacy Policy', type: 'link', icon: 'shield-checkmark-outline' },
        { id: 'terms', title: 'Terms of Service', type: 'link', icon: 'document-text-outline' },
      ]
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header matching Account Screen */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButtonCircle} 
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Ionicons name="chevron-back" size={20} color="#555" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Settings</Text>

        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.headerIconBtn} activeOpacity={0.7}>
            <Ionicons name="notifications-outline" size={22} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIconBtn} activeOpacity={0.7}>
            <Ionicons name="cart-outline" size={22} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {settingSections.map((section, idx) => (
          <View key={idx} style={styles.section}>
            <Text style={styles.sectionHeader}>{section.title}</Text>
            <View style={styles.card}>
              {section.items.map((item, itemIdx) => (
                <View 
                  key={item.id} 
                  style={[
                    styles.itemRow, 
                    itemIdx === section.items.length - 1 && styles.itemRowLast
                  ]}
                >
                  <View style={styles.itemLeft}>
                    <View style={styles.iconWrapper}>
                      <Ionicons name={item.icon} size={20} color="#1E3A8A" />
                    </View>
                    <Text style={styles.itemTitle}>{item.title}</Text>
                  </View>

                  {item.type === 'toggle' ? (
                    <Switch
                      value={item.value}
                      onValueChange={item.setValue}
                      trackColor={{ false: '#CBD5E1', true: '#BFDBFE' }}
                      thumbColor={item.value ? '#1E3A8A' : '#F1F5F9'}
                    />
                  ) : (
                    <TouchableOpacity style={styles.itemRightBtn} activeOpacity={0.7}>
                      {item.value && <Text style={styles.itemValue}>{item.value}</Text>}
                      <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* Build version info */}
        <Text style={styles.versionText}>Blue Tomato App v1.0.0 (Expo SDK 56)</Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#93A8BA',
    height: 120,
    paddingTop: 10,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backButtonCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },
  headerIcons: { 
    flexDirection: 'row', 
    gap: 16 
  },
  headerIconBtn: {
    padding: 4,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 24,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
    marginLeft: 4,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  itemRowLast: {
    borderBottomWidth: 0,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
  },
  itemRightBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemValue: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  versionText: {
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 40,
    fontWeight: '500',
  },
});
