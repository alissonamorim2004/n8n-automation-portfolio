import React from 'react';
import { View, Text, ScrollView, Image, StyleSheet } from 'react-native';
import { Trophy, Medal, Award, Crown, TrendingUp, Star } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';

// Mock ranking data with realistic names and points
const mockRankingData = [
  { id: '1', name: 'Ana Silva', handle: 'anasilva', avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?w=200', region: 'São Paulo', weeklyPoints: 1250 },
  { id: '2', name: 'João Santos', handle: 'joaosantos', avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?w=200', region: 'Rio de Janeiro', weeklyPoints: 1180 },
  { id: '3', name: 'Maria Costa', handle: 'mariacosta', avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?w=200', region: 'Minas Gerais', weeklyPoints: 1050 },
  { id: '4', name: 'Pedro Lima', handle: 'pedrolima', avatar: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?w=200', region: 'Paraná', weeklyPoints: 980 },
  { id: '5', name: 'Carla Oliveira', handle: 'carlaoliveira', avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?w=200', region: 'Bahia', weeklyPoints: 920 },
  { id: '6', name: 'Lucas Ferreira', handle: 'lucasferreira', avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?w=200', region: 'Ceará', weeklyPoints: 850 },
  { id: '7', name: 'Juliana Rocha', handle: 'julianarocha', avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?w=200', region: 'Goiás', weeklyPoints: 780 },
  { id: '8', name: 'Rafael Alves', handle: 'rafaelalves', avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?w=200', region: 'Santa Catarina', weeklyPoints: 720 },
  { id: '9', name: 'Camila Souza', handle: 'camilasouza', avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?w=200', region: 'Pernambuco', weeklyPoints: 680 },
  { id: '10', name: 'Bruno Martins', handle: 'brunomartins', avatar: 'https://images.pexels.com/photos/1024311/pexels-photo-1024311.jpeg?w=200', region: 'Rio Grande do Sul', weeklyPoints: 620 },
  { id: '11', name: 'Fernanda Castro', handle: 'fernandacastro', avatar: 'https://images.pexels.com/photos/1181424/pexels-photo-1181424.jpeg?w=200', region: 'Distrito Federal', weeklyPoints: 580 },
  { id: '12', name: 'Diego Pereira', handle: 'diegopereira', avatar: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?w=200', region: 'Espírito Santo', weeklyPoints: 540 },
];

export default function RankingScreen() {
  const { user, points } = useApp();

  // Create ranking with user's current position
  const createRankingWithUser = () => {
    let rankingData = [...mockRankingData];
    
    if (user && user.handle) {
      // Remove user if already in mock data
      rankingData = rankingData.filter(item => item.handle !== user.handle);
      
      // Add current user with their points
      const userRankingData = {
        id: user.id,
        name: user.name,
        handle: user.handle,
        avatar: user.avatar,
        region: user.region,
        weeklyPoints: points,
      };
      
      rankingData.push(userRankingData);
    }
    
    // Sort by points and add positions
    rankingData.sort((a, b) => b.weeklyPoints - a.weeklyPoints);
    return rankingData.map((item, index) => ({
      ...item,
      position: index + 1,
    }));
  };

  const ranking = createRankingWithUser();

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1: return <Crown size={24} color="#F59E0B" />;
      case 2: return <Medal size={20} color="#E5E7EB" />;
      case 3: return <Award size={20} color="#CD7C2F" />;
      default: return null;
    }
  };

  const getRankColor = (position: number) => {
    switch (position) {
      case 1: return '#F59E0B';
      case 2: return '#E5E7EB';
      case 3: return '#CD7C2F';
      default: return '#666';
    }
  };

  const userPosition = ranking.find(r => r.handle === user?.handle);

  const TopThree = () => (
    <View style={styles.topThreeContainer}>
      {/* 2nd place */}
      <View style={styles.secondPlace}>
        <Image 
          source={{ uri: ranking[1]?.avatar }} 
          style={styles.topThreeAvatar} 
        />
        <Medal size={20} color="#E5E7EB" />
        <Text style={styles.topThreeName}>{ranking[1]?.name}</Text>
        <Text style={styles.topThreePoints}>{ranking[1]?.weeklyPoints} pts</Text>
      </View>

      {/* 1st place */}
      <View style={styles.firstPlace}>
        <Image 
          source={{ uri: ranking[0]?.avatar }} 
          style={[styles.topThreeAvatar, styles.firstPlaceAvatar]} 
        />
        <Crown size={28} color="#F59E0B" />
        <Text style={[styles.topThreeName, styles.firstPlaceName]}>
          {ranking[0]?.name}
        </Text>
        <Text style={[styles.topThreePoints, styles.firstPlacePoints]}>
          {ranking[0]?.weeklyPoints} pts
        </Text>
      </View>

      {/* 3rd place */}
      <View style={styles.thirdPlace}>
        <Image 
          source={{ uri: ranking[2]?.avatar }} 
          style={styles.topThreeAvatar} 
        />
        <Award size={20} color="#CD7C2F" />
        <Text style={styles.topThreeName}>{ranking[2]?.name}</Text>
        <Text style={styles.topThreePoints}>{ranking[2]?.weeklyPoints} pts</Text>
      </View>
    </View>
  );

  const RankingItem = ({ item, index }: { item: any, index: number }) => {
    const isCurrentUser = item.handle === user?.handle;
    
    return (
      <View style={[
        styles.rankingItem,
        isCurrentUser && styles.currentUserItem,
      ]}>
        <View style={styles.rankingLeft}>
          <View style={[
            styles.positionContainer,
            { backgroundColor: getRankColor(item.position) + '20' }
          ]}>
            {getRankIcon(item.position) || (
              <Text style={[styles.position, { color: getRankColor(item.position) }]}>
                {item.position}
              </Text>
            )}
          </View>
          
          <Image source={{ uri: item.avatar }} style={styles.avatar} />
          
          <View style={styles.userInfo}>
            <Text style={[styles.userName, isCurrentUser && styles.currentUserName]}>
              {item.name}
            </Text>
            <Text style={styles.userHandle}>@{item.handle}</Text>
            <Text style={styles.userRegion}>{item.region}</Text>
          </View>
        </View>
        
        <Text style={[styles.points, isCurrentUser && styles.currentUserPoints]}>
          {item.weeklyPoints} pts
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Trophy size={24} color="#27F1E5" />
        <Text style={styles.headerTitle}>Ranking Semanal</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.weekInfo}>
          <Text style={styles.weekTitle}>🏆 Top da Semana</Text>
          <Text style={styles.weekSubtitle}>
            Ranking baseado em engajamento e pontos ganhos
          </Text>
        </View>

        {ranking.length >= 3 && <TopThree />}

        <View style={styles.fullRankingContainer}>
          <Text style={styles.fullRankingTitle}>Classificação Completa</Text>
          
          {ranking.slice(0, 10).map((item, index) => (
            <RankingItem key={item.id} item={item} index={index} />
          ))}
        </View>

        {/* Weekly Stats */}
        <View style={styles.weeklyStatsContainer}>
          <Text style={styles.weeklyStatsTitle}>📊 Estatísticas da Semana</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <TrendingUp size={24} color="#27F1E5" />
              <Text style={styles.statNumber}>12.8K</Text>
              <Text style={styles.statLabel}>Total de Views</Text>
            </View>
            <View style={styles.statCard}>
              <Star size={24} color="#F59E0B" />
              <Text style={styles.statNumber}>3.2K</Text>
              <Text style={styles.statLabel}>Total de Likes</Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            🔄 O ranking reinicia toda segunda-feira
          </Text>
          <Text style={styles.footerSubtext}>
            Seja mais ativo para subir no ranking!
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
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitle: {
    color: '#EDEDED',
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  content: {
    flex: 1,
  },
  weekInfo: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  weekTitle: {
    color: '#27F1E5',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  weekSubtitle: {
    color: '#666',
    fontSize: 14,
  },
  topThreeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'end',
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  firstPlace: {
    alignItems: 'center',
    marginHorizontal: 16,
  },
  secondPlace: {
    alignItems: 'center',
    marginTop: 24,
  },
  thirdPlace: {
    alignItems: 'center',
    marginTop: 32,
  },
  topThreeAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#27F1E5',
  },
  firstPlaceAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderColor: '#F59E0B',
    borderWidth: 3,
  },
  topThreeName: {
    color: '#EDEDED',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  firstPlaceName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  topThreePoints: {
    color: '#666',
    fontSize: 12,
    marginTop: 2,
  },
  firstPlacePoints: {
    color: '#F59E0B',
    fontSize: 14,
    fontWeight: 'bold',
  },
  fullRankingContainer: {
    paddingHorizontal: 20,
  },
  fullRankingTitle: {
    color: '#EDEDED',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  rankingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(237, 237, 237, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
  },
  currentUserItem: {
    backgroundColor: 'rgba(39, 241, 229, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(39, 241, 229, 0.3)',
  },
  rankingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  positionContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  position: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: '#EDEDED',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  currentUserName: {
    color: '#27F1E5',
  },
  userHandle: {
    color: '#666',
    fontSize: 14,
    marginBottom: 2,
  },
  userRegion: {
    color: '#666',
    fontSize: 12,
  },
  points: {
    color: '#EDEDED',
    fontSize: 16,
    fontWeight: 'bold',
  },
  currentUserPoints: {
    color: '#27F1E5',
  },
  separator: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  separatorText: {
    color: '#666',
    fontSize: 16,
  },
  weeklyStatsContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  weeklyStatsTitle: {
    color: '#EDEDED',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: 'rgba(237, 237, 237, 0.05)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: 'rgba(39, 241, 229, 0.1)',
  },
  statNumber: {
    color: '#EDEDED',
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  statLabel: {
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    color: '#666',
    fontSize: 14,
    marginBottom: 4,
  },
  footerSubtext: {
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
  },
});