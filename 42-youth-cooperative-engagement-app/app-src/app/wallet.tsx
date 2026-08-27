import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { ArrowLeft, Wallet, TrendingUp, TrendingDown, Clock, CircleCheck as CheckCircle, Package } from 'lucide-react-native';
import { router } from 'expo-router';
import { useApp } from '@/contexts/AppContext';

export default function WalletScreen() {
  const { points, transactions, redemptions, rewards } = useApp();
  const [activeTab, setActiveTab] = useState<'transactions' | 'redemptions'>('transactions');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRewardById = (rewardId: string) => {
    return rewards.find(r => r.id === rewardId);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock size={16} color="#F59E0B" />;
      case 'approved': return <CheckCircle size={16} color="#22C55E" />;
      case 'delivered': return <Package size={16} color="#27F1E5" />;
      default: return <Clock size={16} color="#F59E0B" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'approved': return 'Aprovado';
      case 'delivered': return 'Entregue';
      default: return 'Pendente';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#F59E0B';
      case 'approved': return '#22C55E';
      case 'delivered': return '#27F1E5';
      default: return '#F59E0B';
    }
  };

  const TransactionItem = ({ transaction }: { transaction: any }) => (
    <View style={styles.transactionItem}>
      <View style={styles.transactionIcon}>
        {transaction.type === 'earned' ? (
          <TrendingUp size={20} color="#22C55E" />
        ) : (
          <TrendingDown size={20} color="#EF4444" />
        )}
      </View>
      
      <View style={styles.transactionInfo}>
        <Text style={styles.transactionReason}>{transaction.reason}</Text>
        <Text style={styles.transactionDate}>
          {formatDate(transaction.timestamp)}
        </Text>
      </View>
      
      <Text style={[
        styles.transactionAmount,
        { color: transaction.type === 'earned' ? '#22C55E' : '#EF4444' }
      ]}>
        {transaction.amount > 0 ? '+' : ''}{transaction.amount} pts
      </Text>
    </View>
  );

  const RedemptionItem = ({ redemption }: { redemption: any }) => {
    const reward = getRewardById(redemption.rewardId);
    if (!reward) return null;

    return (
      <View style={styles.redemptionItem}>
        <View style={styles.redemptionInfo}>
          <Text style={styles.redemptionTitle}>{reward.title}</Text>
          <View style={styles.redemptionMeta}>
            <Text style={styles.redemptionDate}>
              {formatDate(redemption.redeemedAt)}
            </Text>
            <View style={styles.statusContainer}>
              {getStatusIcon(redemption.status)}
              <Text style={[
                styles.statusText,
                { color: getStatusColor(redemption.status) }
              ]}>
                {getStatusText(redemption.status)}
              </Text>
            </View>
          </View>
        </View>
        
        <Text style={styles.redemptionCost}>-{reward.cost} pts</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#EDEDED" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Carteira</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Wallet size={24} color="#27F1E5" />
            <Text style={styles.balanceLabel}>Saldo atual</Text>
          </View>
          <Text style={styles.balanceAmount}>{points} pts</Text>
          <Text style={styles.balanceSubtext}>
            Pontos acumulados através de interações no app
          </Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'transactions' && styles.activeTab]}
            onPress={() => setActiveTab('transactions')}>
            <Text style={[styles.tabText, activeTab === 'transactions' && styles.activeTabText]}>
              Histórico
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'redemptions' && styles.activeTab]}
            onPress={() => setActiveTab('redemptions')}>
            <Text style={[styles.tabText, activeTab === 'redemptions' && styles.activeTabText]}>
              Resgates
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        {activeTab === 'transactions' ? (
          <View style={styles.transactionsList}>
            <Text style={styles.sectionTitle}>
              Histórico de pontos ({transactions.length})
            </Text>
            {transactions.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>
                  📊 Nenhuma transação ainda
                </Text>
                <Text style={styles.emptyStateSubtext}>
                  Comece assistindo vídeos e curtindo conteúdo!
                </Text>
              </View>
            ) : (
              transactions.map((transaction) => (
                <TransactionItem key={transaction.id} transaction={transaction} />
              ))
            )}
          </View>
        ) : (
          <View style={styles.redemptionsList}>
            <Text style={styles.sectionTitle}>
              Seus resgates ({redemptions.length})
            </Text>
            {redemptions.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>
                  🎁 Nenhum resgate ainda
                </Text>
                <Text style={styles.emptyStateSubtext}>
                  Visite a aba Recompensas para trocar seus pontos!
                </Text>
              </View>
            ) : (
              redemptions.map((redemption) => (
                <RedemptionItem key={redemption.id} redemption={redemption} />
              ))
            )}
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            💡 Continue interagindo no app para ganhar mais pontos!
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0E16',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: '#EDEDED',
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  balanceCard: {
    backgroundColor: 'rgba(39, 241, 229, 0.1)',
    margin: 20,
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(39, 241, 229, 0.2)',
    alignItems: 'center',
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  balanceLabel: {
    color: '#27F1E5',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  balanceAmount: {
    color: '#EDEDED',
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  balanceSubtext: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#27F1E5',
  },
  tabText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#27F1E5',
  },
  sectionTitle: {
    color: '#EDEDED',
    fontSize: 18,
    fontWeight: 'bold',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  transactionsList: {
    flex: 1,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(237, 237, 237, 0.05)',
    marginHorizontal: 20,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(39, 241, 229, 0.1)',
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(237, 237, 237, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionReason: {
    color: '#EDEDED',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  transactionDate: {
    color: '#666',
    fontSize: 14,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  redemptionsList: {
    flex: 1,
  },
  redemptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(237, 237, 237, 0.05)',
    marginHorizontal: 20,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(39, 241, 229, 0.1)',
  },
  redemptionInfo: {
    flex: 1,
  },
  redemptionTitle: {
    color: '#EDEDED',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  redemptionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  redemptionDate: {
    color: '#666',
    fontSize: 14,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  redemptionCost: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    color: '#666',
    fontSize: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
  },
});