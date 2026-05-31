import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import AvatarImg from '../../../assets/xavier_rock_avatar.png';

export default function AccountScreen({ navigation }) {
  const { logout } = useAuth();
  const menuItems = [
    { id: '1', title: 'Profile', route: 'Profile', icon: 'person-outline' },
    { id: '2', title: 'Payments & History', route: 'PaymentHistory', icon: 'card-outline' },
    { id: '3', title: 'Settings', route: 'Settings', icon: 'settings-outline' },
    { id: '4', title: 'My Address', route: 'Addresses', icon: 'location-outline' },
    { id: '5', title: 'Logout', route: 'Auth', icon: 'log-out-outline', isDestructive: true },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Slate Gray-Blue Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButtonCircle}
          onPress={() => navigation.navigate('Home')}
          activeOpacity={0.8}
        >
          <Ionicons name="chevron-back" size={20} color="#555" />
        </TouchableOpacity>
        
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.headerIconBtn} activeOpacity={0.7}>
            <Ionicons name="notifications-outline" size={22} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIconBtn} activeOpacity={0.7}>
            <Ionicons name="cart-outline" size={22} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card Section */}
        <View style={styles.profileContainer}>
          <View style={styles.profileImageContainer}>
            <Image source={AvatarImg} style={styles.profileImage} />
          </View>
          <Text style={styles.profileName}>Xavier Rock</Text>
        </View>

        {/* Action Menu List */}
        <View style={styles.menuContainer}>
          {menuItems.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={[styles.menuItem, item.isDestructive && styles.menuItemDestructive]}
              activeOpacity={0.7}
              onPress={() => {
                if (item.route === 'Auth') {
                  logout();
                } else {
                  navigation.navigate(item.route);
                }
              }}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.iconWrapper, item.isDestructive && styles.iconWrapperDestructive]}>
                  <Ionicons 
                    name={item.icon} 
                    size={20} 
                    color={item.isDestructive ? '#E53E3E' : '#1A2B4C'} 
                  />
                </View>
                <Text style={[styles.menuItemText, item.isDestructive && styles.menuItemTextDestructive]}>
                  {item.title}
                </Text>
              </View>
              <Ionicons 
                name="chevron-forward" 
                size={18} 
                color={item.isDestructive ? '#FEB2B2' : '#CBD5E0'} 
              />
            </TouchableOpacity>
          ))}
        </View>
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
  profileContainer: {
    alignItems: 'center',
    marginTop: -55,
    marginBottom: 30,
  },
  profileImageContainer: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 3,
    borderColor: '#93A8BA',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileName: {
    marginTop: 14,
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: 0.5,
  },
  menuContainer: {
    paddingHorizontal: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  menuItemDestructive: {
    borderColor: '#FEE2E2',
    backgroundColor: '#FFFDFD',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrapperDestructive: {
    backgroundColor: '#FEE2E2',
  },
  menuItemText: {
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '600',
  },
  menuItemTextDestructive: {
    color: '#DC2626',
  },
});
