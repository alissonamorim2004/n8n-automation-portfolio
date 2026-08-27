import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { CircleCheck as CheckCircle, Clock, Target } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { PointsToast } from '@/components/PointsToast';

export default function MissionsScreen() {
  const { missions, completeMission, transactions } = useApp();
  const [toast, setToast] = useState<{ visible: boolean; points: number; message: string }>({
    visible: false,
    points: 0,
    message: '',
  });

  const [missionProgress, setMissionProgress] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    // Calculate mission progress based on transactions
    const today = new Date().toDateString();
    const thisWeekStart = new Date();
    thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());

    const progress: { [key: string]: number } = {};

    missions.forEach(mission => {
      let count = 0;
      
      if (mission.id === '1') { // Watch 5 videos today
        count = transactions.filter(t => 
          t.reason === 'Assistiu vídeo' && 
          new Date(t.timestamp).toDateString() === today
        ).length;
      } else if (mission.id === '2') { // Like 10 videos today
        count = transactions.filter(t => 
          t.reason === 'Curtiu vídeo' && 
          new Date(t.timestamp).toDateString() === today
        ).length;
      } else if (mission.id === '3') { // Post 1 video today
        count = transactions.filter(t => 
          t.reason === 'Postou vídeo' && 
          new Date(t.timestamp).toDateString() === today
        ).length;
      } else if (mission.id === '4') { // Like 50 videos this week
        count = transactions.filter(t => 
          t.reason === 'Curtiu vídeo' && 
          new Date(t.timestamp) >= thisWeekStart
        ).length;
      } else if (mission.id === '5') { // Watch 25 videos this week
        count = transactions.filter(t => 
          t.reason === 'Assistiu vídeo' && 
          new Date(t.timestamp) >= thisWeekStart
        ).length;
      } else if (mission.id === '6') { // Post 3 finance videos
        count = transactions.filter(t => 
          t.reason === 'Postou vídeo' && 
          new Date(t.timestamp) >= thisWeekStart
        ).length;
      }
      
      progress[mission.id] = Math.min(count, mission.target);
    });

    setMissionProgress(progress);
  }, [transactions, missions]);

  const dailyMissions = missions.filter(m => m.type === 'daily');
  const weeklyMissions = missions.filter(m => m.type === 'weekly');

  const handleCompleteMission = async (missionId: string) => {
    const mission = missions.find(m => m.id === missionId);
    if (!mission) return;

    await completeMission(missionId);
    setToast({
      visible: true,
      points: mission.points,
      message: `Missão concluída!`,
    });
  };

  const canComplete = (mission: any) => {
    const progress = missionProgress[mission.id] || 0;
    return progress >= mission.target && !mission.completed;
  };

  const MissionCard = ({ mission }: { mission: any }) => {
    const progress = missionProgress[mission.id] || 0;
    const progressPercentage = (progress / mission.target) * 100;

    return (
      <View style={styles.missionCard}>
        <View style={styles.missionHeader}>
          <Text style={styles.missionIcon}>{mission.icon}</Text>
          <View style={styles.missionInfo}>
            <Text style={styles.missionTitle}>{mission.title}</Text>
            <Text style={styles.missionDescription}>{mission.description}</Text>
          </View>
          <Text style={styles.missionPoints}>+{mission.points} pts</Text>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${Math.min(progressPercentage, 100)}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {progress}/{mission.target}
          </Text>
        </View>

        {mission.completed ? (
          <View style={styles.completedButton}>
            <CheckCircle size={20} color="#22C55E" />
            <Text style={styles.completedText}>Concluída</Text>
          </View>
        ) : canComplete(mission) ? (
          <TouchableOpacity
            style={styles.completeButton}
            onPress={() => handleCompleteMission(mission.id)}>
            <Text style={styles.completeButtonText}>Concluir</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.pendingButton}>
            <Clock size={16} color="#666" />
            <Text style={styles.pendingText}>Em andamento</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Target size={24} color="#27F1E5" />
        <Text style={styles.headerTitle}>Missões</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🌅 Missões Diárias</Text>
          <Text style={styles.sectionSubtitle}>Reiniciam todo dia às 00:00</Text>
          {dailyMissions.map(mission => (
            <MissionCard key={mission.id} mission={mission} />
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📅 Missões Semanais</Text>
          <Text style={styles.sectionSubtitle}>Reiniciam toda segunda-feira</Text>
          {weeklyMissions.map(mission => (
            <MissionCard key={mission.id} mission={mission} />
          ))}
        </View>
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
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    color: '#27F1E5',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  sectionSubtitle: {
    color: '#666',
    fontSize: 14,
    marginBottom: 16,
  },
  missionCard: {
    backgroundColor: 'rgba(237, 237, 237, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(39, 241, 229, 0.1)',
  },
  missionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  missionIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  missionInfo: {
    flex: 1,
  },
  missionTitle: {
    color: '#EDEDED',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  missionDescription: {
    color: '#999',
    fontSize: 14,
    lineHeight: 20,
  },
  missionPoints: {
    color: '#27F1E5',
    fontSize: 14,
    fontWeight: 'bold',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#27F1E5',
    borderRadius: 4,
  },
  progressText: {
    color: '#666',
    fontSize: 12,
    fontWeight: '600',
    minWidth: 40,
    textAlign: 'right',
  },
  completeButton: {
    backgroundColor: '#27F1E5',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
  },
  completeButtonText: {
    color: '#0D0E16',
    fontSize: 14,
    fontWeight: 'bold',
  },
  completedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  completedText: {
    color: '#22C55E',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  pendingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  pendingText: {
    color: '#666',
    fontSize: 14,
    marginLeft: 6,
  },
});