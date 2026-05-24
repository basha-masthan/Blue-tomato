import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function PaymentHistoryScreen({ navigation }) {
  const savedCards = [
    { id: '1', type: 'visa', number: '•••• •••• •••• 4242', holder: 'XAVIER ROCK', expiry: '12/28', balance: '$340.50', color: ['#1E3A8A', '#3B82F6'] },
    { id: '2', type: 'mastercard', number: '•••• •••• •••• 8844', holder: 'XAVIER ROCK', expiry: '06/27', balance: '$120.00', color: ['#0F172A', '#334155'] }
  ];

  const transactions = [
    { id: '1', type: 'Food', desc: 'Ordered from Green Salad Co.', date: 'Today, 2:30 PM', amount: '-$24.50', status: 'Completed', icon: 'fast-food' },
    { id: '2', type: 'Pickup', desc: 'Package delivery to Downtown', date: 'Yesterday, 5:10 PM', amount: '-$12.00', status: 'Completed', icon: 'cube' },
    { id: '3', type: 'Top-up', desc: 'Wallet refueled', date: '23 May, 11:00 AM', amount: '+$100.00', status: 'Completed', icon: 'wallet', isCredit: true },
    { id: '4', type: 'Home Services', desc: 'Home AC Repair Service', date: '20 May, 10:15 AM', amount: '-$85.00', status: 'Completed', icon: 'build' },
    { id: '5', type: 'Food', desc: 'Ordered from Pizza Feast', date: '18 May, 8:45 PM', amount: '-$42.80', status: 'Failed', icon: 'fast-food', isFailed: true },
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
        
        <Text style={styles.headerTitle}>Payments & History</Text>

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
        {/* Wallet balance & Quick actions */}
        <View style={styles.walletCard}>
          <View style={styles.walletHeader}>
            <View>
              <Text style={styles.walletLabel}>Total Balance</Text>
              <Text style={styles.walletAmount}>$460.50</Text>
            </View>
            <View style={styles.walletBadge}>
              <Ionicons name="wallet-outline" size={20} color="#1E3A8A" />
              <Text style={styles.walletBadgeText}>Active</Text>
            </View>
          </View>
          <View style={styles.walletDivider} />
          <View style={styles.walletActions}>
            <TouchableOpacity style={styles.walletActionBtn} activeOpacity={0.8}>
              <Ionicons name="add-circle-outline" size={20} color="#FFF" />
              <Text style={styles.walletActionText}>Add Money</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.walletActionBtn, styles.walletActionBtnSecondary]} activeOpacity={0.8}>
              <Ionicons name="send-outline" size={18} color="#1E3A8A" />
              <Text style={styles.walletActionTextSecondary}>Send to Bank</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Saved Cards Carousel Title */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Saved Cards</Text>
          <TouchableOpacity>
            <Text style={styles.sectionLink}>+ Add Card</Text>
          </TouchableOpacity>
        </View>

        {/* Horizontal Cards View */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.cardsContainer}
        >
          {savedCards.map((card) => (
            <View 
              key={card.id} 
              style={[styles.creditCard, { backgroundColor: card.color[0] }]}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardType}>{card.type.toUpperCase()}</Text>
                <Ionicons name="wifi-outline" size={20} color="#FFF" style={styles.wifiIcon} />
              </View>
              <Text style={styles.cardNumber}>{card.number}</Text>
              <View style={styles.cardFooter}>
                <View>
                  <Text style={styles.cardLabel}>CARD HOLDER</Text>
                  <Text style={styles.cardValue}>{card.holder}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.cardLabel}>EXPIRES</Text>
                  <Text style={styles.cardValue}>{card.expiry}</Text>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Transactions list title */}
        <Text style={[styles.sectionTitle, { marginHorizontal: 24, marginTop: 28, marginBottom: 12 }]}>
          Recent Transactions
        </Text>

        {/* Transactions list */}
        <View style={styles.transactionsContainer}>
          {transactions.map((tx) => (
            <View key={tx.id} style={styles.txRow}>
              <View style={[
                styles.txIconWrapper, 
                tx.isCredit && styles.txIconCredit,
                tx.isFailed && styles.txIconFailed
              ]}>
                <Ionicons 
                  name={tx.icon} 
                  size={20} 
                  color={tx.isCredit ? '#10B981' : tx.isFailed ? '#EF4444' : '#1E3A8A'} 
                />
              </View>
              <View style={styles.txDetails}>
                <Text style={styles.txDesc} numberOfLines={1}>{tx.desc}</Text>
                <Text style={styles.txDate}>{tx.date}</Text>
              </View>
              <View style={styles.txAmountContainer}>
                <Text style={[
                  styles.txAmount,
                  tx.isCredit && styles.txAmountCredit,
                  tx.isFailed && styles.txAmountFailed
                ]}>
                  {tx.amount}
                </Text>
                <Text style={[
                  styles.txStatus, 
                  tx.isFailed && styles.txStatusFailed
                ]}>
                  {tx.status}
                </Text>
              </View>
            </View>
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
  walletCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    marginHorizontal: 24,
    marginTop: 20,
    padding: 24,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  walletHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  walletLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  walletAmount: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 4,
  },
  walletBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  walletBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E3A8A',
  },
  walletDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 20,
  },
  walletActions: {
    flexDirection: 'row',
    gap: 12,
  },
  walletActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#1E3A8A',
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: '#1E3A8A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  walletActionBtnSecondary: {
    backgroundColor: '#FFF',
    borderWidth: 1.5,
    borderColor: '#1E3A8A',
    shadowOpacity: 0,
    elevation: 0,
  },
  walletActionText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  walletActionTextSecondary: {
    color: '#1E3A8A',
    fontSize: 14,
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 24,
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  sectionLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E3A8A',
  },
  cardsContainer: {
    paddingHorizontal: 24,
    gap: 16,
    paddingBottom: 4,
  },
  creditCard: {
    width: 280,
    height: 160,
    borderRadius: 20,
    padding: 20,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardType: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  wifiIcon: {
    transform: [{ rotate: '90deg' }],
  },
  cardNumber: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 2,
    marginVertical: 10,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLabel: {
    color: '#E2E8F0',
    fontSize: 8,
    fontWeight: '500',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  cardValue: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  transactionsContainer: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    marginHorizontal: 24,
    paddingVertical: 8,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  txIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  txIconCredit: {
    backgroundColor: '#ECFDF5',
  },
  txIconFailed: {
    backgroundColor: '#FEF2F2',
  },
  txDetails: {
    flex: 1,
    marginLeft: 16,
    marginRight: 12,
  },
  txDesc: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
  },
  txDate: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  txAmountContainer: {
    alignItems: 'flex-end',
  },
  txAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  txAmountCredit: {
    color: '#10B981',
  },
  txAmountFailed: {
    color: '#EF4444',
  },
  txStatus: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
  },
  txStatusFailed: {
    color: '#EF4444',
  },
});
