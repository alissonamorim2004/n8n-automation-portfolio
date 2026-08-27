import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import { Gift, Star, CreditCard, GraduationCap, Calendar, Trophy, Award, Target, ArrowRight } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { router } from 'expo-router';
import { PointsToast } from '@/components/PointsToast';

// Points milestones with rewards
const pointsMilestones = [
  { points: 100, reward: 'Badge Iniciante', icon: '🌟', unlocked: false },
  { points: 250, reward: 'Desconto 5% em cursos', icon: '📚', unlocked: false },
  { points: 500, reward: 'Consultoria gratuita 30min', icon: '💬', unlocked: false },
  { points: 750, reward: 'Badge Cooperativista', icon: '🤝', unlocked: false },
  { points: 1000, reward: 'Kit sustentabilidade', icon: '🌱', unlocked: false },
  { points: 1500, reward: 'Desconto 10% em eventos', icon: '🎪', unlocked: false },
  { points: 2000, reward: 'Badge Expert', icon: '🏆', unlocked: false },
  { points: 3000, reward: 'Mentoria personalizada', icon: '👨‍🏫', unlocked: false },
  { points: 5000, reward: 'Badge Embaixador', icon: '👑', unlocked: false },
];

export default function RewardsScreen() {
  const { rewards, points, redeemReward } = useApp();
  const [activeTab, setActiveTab] = useState<'rewards' | 'milestones'>('rewards');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [toast, setToast] = useState<{ visible: boolean; points: number; message: string }>({
    visible: false,
    points: 0,
    message: '',
  });

  const categories = [
    { id: 'credit', label: 'Crédito', icon: CreditCard, color: '#23B6FF' },
    { id: 'education', label: 'Educação', icon: GraduationCap, color: '#27F1E5' },
    { id: 'events', label: 'Eventos', icon: Calendar, color: '#FF3D7F' },
  ];

  const filteredRewards = selectedCategory 
    ? rewards.filter(r => r.category === selectedCategory)
    : rewards;

  // Calculate unlocked milestones
  const milestonesWithStatus = pointsMilestones.map(milestone => ({
    ...milestone,
    unlocked: points >= milestone.points,
  }));

  const handleRedeem = async (rewardId: string) => {
    const reward = rewards.find(r => r.id === rewardId);
    if (!reward) return;

    if (points < reward.cost) {
      Alert.alert(
        'Pontos insuficientes',
        `Você precisa de ${reward.cost} pontos, mas tem apenas ${points} pontos.`,
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Confirmar resgate',
      `Deseja resgatar "${reward.title}" por ${reward.cost} pontos?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Resgatar',
          onPress: async () => {
            await redeemReward(rewardId);
            setToast({
              visible: true,
              points: -reward.cost,
              message: 'Recompensa resgatada!',
            });
          },
        },
      ]
    );
  };

  const CategoryFilter = () => (
    <View style={styles.categoryContainer}>
      <TouchableOpacity
        style={[styles.categoryButton, !selectedCategory && styles.activeCategoryButton]}
        onPress={() => setSelectedCategory(null)}>
        <Text style={[styles.categoryText, !selectedCategory && styles.activeCategoryText]}>
          Todas
        </Text>
      </TouchableOpacity>
      {categories.slice(0, 3).map(category => {
        const IconComponent = category.icon;
        const isActive = selectedCategory === category.id;
        
        return (
          <TouchableOpacity
            key={category.id}
            style={[styles.categoryButton, isActive && styles.activeCategoryButton]}
            onPress={() => setSelectedCategory(category.id)}>
            <IconComponent 
              size={16} 
              color={isActive ? '#0D0E16' : category.color}
            />
            <Text style={[
              styles.categoryText, 
              isActive && styles.activeCategoryText,
              { color: isActive ? '#0D0E16' : category.color }
            ]}>
              {category.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const RewardCard = ({ reward }: { reward: any }) => {
    const canAfford = points >= reward.cost;
    
    return (
      <View style={styles.rewardCard}>
        <Image source={{ uri: reward.image }} style={styles.rewardImage} />
        <View style={styles.rewardContent}>
          <Text style={styles.rewardTitle}>{reward.title}</Text>
          <Text style={styles.rewardDescription}>{reward.description}</Text>
          
          <View style={styles.rewardFooter}>
            <View style={styles.costContainer}>
              <Star size={16} color="#F59E0B" />
              <Text style={styles.costText}>{reward.cost} pts</Text>
            </View>
            
            <TouchableOpacity
              style={[
                styles.redeemButton,
                !canAfford && styles.redeemButtonDisabled,
              ]}
              onPress={() => handleRedeem(reward.id)}
              disabled={!canAfford}>
              <Text style={[
                styles.redeemButtonText,
                !canAfford && styles.redeemButtonTextDisabled,
              ]}>
                {canAfford ? 'Resgatar' : 'Insuficiente'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const MilestoneItem = ({ milestone, index }: { milestone: any; index: number }) => {
    const isNext = !milestone.unlocked && (index === 0 || milestonesWithStatus[index - 1].unlocked);
    
    return (
      <View style={styles.milestoneContainer}>
        <View style={styles.milestoneLine}>
          <View style={[
            styles.milestonePoint,
            milestone.unlocked && styles.milestonePointUnlocked,
            isNext && styles.milestonePointNext,
          ]}>
            <Text style={styles.milestoneIcon}>{milestone.icon}</Text>
          </View>
          {index < milestonesWithStatus.length - 1 && (
            <View style={[
              styles.milestoneConnector,
              milestone.unlocked && styles.milestoneConnectorUnlocked,
            ]} />
          )}
        </View>
        
        <View style={[
          styles.milestoneCard,
          milestone.unlocked && styles.milestoneCardUnlocked,
          isNext && styles.milestoneCardNext,
        ]}>
          <View style={styles.milestoneHeader}>
            <Text style={[
              styles.milestonePoints,
              milestone.unlocked && styles.milestonePointsUnlocked,
            ]}>
              {milestone.points} pts
            </Text>
            {milestone.unlocked && (
              <View style={styles.unlockedBadge}>
                <Trophy size={12} color="#22C55E" />
                <Text style={styles.unlockedText}>Desbloqueado</Text>
              </View>
            )}
          </View>
          <Text style={[
            styles.milestoneReward,
            milestone.unlocked && styles.milestoneRewardUnlocked,
          ]}>
            {milestone.reward}
          </Text>
          {isNext && (
            <Text style={styles.nextMilestoneText}>
              Faltam {milestone.points - points} pontos
            </Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Gift size={24} color="#27F1E5" />
          <Text style={styles.headerTitle}>Recompensas</Text>
        </View>
        <View style={styles.pointsContainer}>
          <Star size={16} color="#F59E0B" />
          <Text style={styles.pointsText}>{points} pts</Text>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.missionsButton}
            onPress={() => router.push('/(tabs)/missions')}>
            <Target size={16} color="#27F1E5" />
            <Text style={styles.missionsButtonText}>Missões</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.rankingButton}
            onPress={() => router.push('/(tabs)/ranking')}>
            <Trophy size={16} color="#F59E0B" />
            <Text style={styles.rankingButtonText}>Ranking</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Tabs */}
      <View style={styles.mainTabsContainer}>
        <TouchableOpacity
          style={[styles.mainTab, activeTab === 'rewards' && styles.activeMainTab]}
          onPress={() => setActiveTab('rewards')}>
          <Gift size={16} color={activeTab === 'rewards' ? '#0D0E16' : '#666'} />
          <Text style={[styles.mainTabText, activeTab === 'rewards' && styles.activeMainTabText]}>
            Recompensas
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.mainTab, activeTab === 'milestones' && styles.activeMainTab]}
          onPress={() => setActiveTab('milestones')}>
          <Target size={16} color={activeTab === 'milestones' ? '#0D0E16' : '#666'} />
          <Text style={[styles.mainTabText, activeTab === 'milestones' && styles.activeMainTabText]}>
            Marcos
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'rewards' && <CategoryFilter />}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'rewards' ? (
          <>
            <Text style={styles.sectionTitle}>
              {selectedCategory 
                ? `${categories.find(c => c.id === selectedCategory)?.label || 'Categoria'} (${filteredRewards.length})`
                : `Todas as recompensas (${filteredRewards.length})`
              }
            </Text>
            
            {filteredRewards.map(reward => (
              <RewardCard key={reward.id} reward={reward} />
            ))}

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                💡 Ganhe mais pontos assistindo vídeos, curtindo e completando missões!
              </Text>
            </View>
          </>
        ) : (
          <>
            <Text style={styles.sectionTitle}>
              🎯 Marcos de Pontuação ({milestonesWithStatus.filter(m => m.unlocked).length}/{milestonesWithStatus.length})
            </Text>
            <Text style={styles.sectionSubtitle}>
              Desbloqueie recompensas especiais conforme acumula pontos
            </Text>
            
            <View style={styles.milestonesContainer}>
              {milestonesWithStatus.map((milestone, index) => (
                <MilestoneItem key={index} milestone={milestone} index={index} />
              ))}
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                🏆 Continue ganhando pontos para desbloquear mais marcos!
              </Text>
            </View>
          </>
        )}
      </ScrollView>

      <PointsToast
        points={toast.points}
        message={toast.message}
        visible={toast.visible}
        onHide={() => setToast({ ...toast, visible: false })}
      />
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
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#EDEDED',
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  pointsText: {
    color: '#F59E0B',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  missionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(39, 241, 229, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(39, 241, 229, 0.2)',
    marginRight: 8,
  },
  missionsButtonText: {
    color: '#27F1E5',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  rankingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  rankingButtonText: {
    color: '#F59E0B',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  mainTabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  mainTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 20,
    marginHorizontal: 4,
    backgroundColor: 'rgba(237, 237, 237, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(39, 241, 229, 0.1)',
  },
  activeMainTab: {
    backgroundColor: '#27F1E5',
  },
  mainTabText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  activeMainTabText: {
    color: '#0D0E16',
  },
  categoryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    justifyContent: 'space-between',
  },
  categoryButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 16,
    marginHorizontal: 2,
    backgroundColor: 'rgba(237, 237, 237, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(39, 241, 229, 0.1)',
  },
  activeCategoryButton: {
    backgroundColor: '#27F1E5',
  },
  categoryText: {
    color: '#666',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  activeCategoryText: {
    color: '#0D0E16',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    color: '#27F1E5',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  sectionSubtitle: {
    color: '#666',
    fontSize: 14,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  milestonesContainer: {
    paddingHorizontal: 20,
  },
  milestoneContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  milestoneLine: {
    alignItems: 'center',
    marginRight: 16,
  },
  milestonePoint: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(102, 102, 102, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#666',
  },
  milestonePointUnlocked: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    borderColor: '#22C55E',
  },
  milestonePointNext: {
    backgroundColor: 'rgba(39, 241, 229, 0.2)',
    borderColor: '#27F1E5',
  },
  milestoneIcon: {
    fontSize: 16,
  },
  milestoneConnector: {
    width: 2,
    height: 30,
    backgroundColor: '#666',
    marginTop: 4,
  },
  milestoneConnectorUnlocked: {
    backgroundColor: '#22C55E',
  },
  milestoneCard: {
    flex: 1,
    backgroundColor: 'rgba(237, 237, 237, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(102, 102, 102, 0.2)',
  },
  milestoneCardUnlocked: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  milestoneCardNext: {
    backgroundColor: 'rgba(39, 241, 229, 0.1)',
    borderColor: 'rgba(39, 241, 229, 0.3)',
  },
  milestoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  milestonePoints: {
    color: '#666',
    fontSize: 14,
    fontWeight: 'bold',
  },
  milestonePointsUnlocked: {
    color: '#22C55E',
  },
  unlockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  unlockedText: {
    color: '#22C55E',
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4,
  },
  milestoneReward: {
    color: '#EDEDED',
    fontSize: 16,
    fontWeight: '600',
  },
  milestoneRewardUnlocked: {
    color: '#22C55E',
  },
  nextMilestoneText: {
    color: '#27F1E5',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  rewardCard: {
    backgroundColor: 'rgba(237, 237, 237, 0.05)',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(39, 241, 229, 0.1)',
  },
  rewardImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  rewardContent: {
    padding: 16,
  },
  rewardTitle: {
    color: '#EDEDED',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  rewardDescription: {
    color: '#999',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  rewardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  costContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  costText: {
    color: '#F59E0B',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  redeemButton: {
    backgroundColor: '#27F1E5',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  redeemButtonDisabled: {
    backgroundColor: 'rgba(102, 102, 102, 0.3)',
  },
  redeemButtonText: {
    color: '#0D0E16',
    fontSize: 14,
    fontWeight: 'bold',
  },
  redeemButtonTextDisabled: {
    color: '#666',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});