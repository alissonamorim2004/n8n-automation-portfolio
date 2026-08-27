import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { GraduationCap, Play, Award, MessageCircle, CircleCheck as CheckCircle, Star, BookOpen, Users, Lightbulb } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { PointsToast } from '@/components/PointsToast';

const educationalContent = {
  whatIsCoop: [
    {
      id: '1',
      title: 'O que é uma Cooperativa?',
      thumbnail: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?w=400',
      duration: 45,
      points: 10,
      watched: false,
    },
    {
      id: '2',
      title: 'Cooperativa vs Banco: Qual a diferença?',
      thumbnail: 'https://images.pexels.com/photos/259200/pexels-photo-259200.jpeg?w=400',
      duration: 60,
      points: 15,
      watched: false,
    },
    {
      id: '3',
      title: 'Como funciona a democracia cooperativa',
      thumbnail: 'https://images.pexels.com/photos/1181396/pexels-photo-1181396.jpeg?w=400',
      duration: 30,
      points: 10,
      watched: false,
    },
  ],
  benefits: [
    {
      title: 'Crédito Estudantil',
      description: 'Taxas até 40% menores que bancos tradicionais',
      icon: '🎓',
      personalizedText: 'Com seus interesses em finanças, você poderia economizar R$ 2.400 em um financiamento de R$ 20.000',
    },
    {
      title: 'Apoio ao Empreendedor',
      description: 'Microcrédito e consultoria gratuita',
      icon: '🚀',
      personalizedText: 'Para jovens empreendedores, oferecemos crédito de até R$ 50.000 com juros especiais',
    },
    {
      title: 'Educação Financeira',
      description: 'Cursos gratuitos e certificados',
      icon: '💡',
      personalizedText: 'Baseado no seu perfil, recomendamos o curso "Investimentos para Jovens"',
    },
  ],
  tracks: [
    {
      id: '1',
      title: 'Educação Financeira Básica',
      description: 'Aprenda a organizar suas finanças',
      modules: 5,
      completed: 0,
      points: 200,
      icon: '💰',
      color: '#22C55E',
    },
    {
      id: '2',
      title: 'Cooperativismo na Prática',
      description: 'Entenda como funciona uma cooperativa',
      modules: 4,
      completed: 0,
      points: 150,
      icon: '🤝',
      color: '#27F1E5',
    },
    {
      id: '3',
      title: 'Empreendedorismo Jovem',
      description: 'Transforme ideias em negócios',
      modules: 6,
      completed: 0,
      points: 300,
      icon: '🚀',
      color: '#FF3D7F',
    },
  ],
  stories: [
    {
      id: '1',
      title: 'Ana abriu sua loja com crédito cooperativo',
      author: 'Ana Silva, 23 anos',
      thumbnail: 'https://images.pexels.com/photos/1181676/pexels-photo-1181676.jpeg?w=400',
      category: 'Empreendedorismo',
    },
    {
      id: '2',
      title: 'João financiou a faculdade com taxa especial',
      author: 'João Santos, 20 anos',
      thumbnail: 'https://images.pexels.com/photos/159844/cellular-education-classroom-159844.jpeg?w=400',
      category: 'Educação',
    },
    {
      id: '3',
      title: 'Maria investiu seus primeiros R$ 100',
      author: 'Maria Costa, 19 anos',
      thumbnail: 'https://images.pexels.com/photos/3943716/pexels-photo-3943716.jpeg?w=400',
      category: 'Investimentos',
    },
  ],
  educationalMissions: [
    {
      id: 'edu1',
      title: 'Assista 3 vídeos sobre cooperativismo',
      description: 'Aprenda o básico sobre cooperativas',
      points: 50,
      progress: 0,
      target: 3,
      completed: false,
      icon: '📺',
    },
    {
      id: 'edu2',
      title: 'Complete o quiz "Mitos e Verdades"',
      description: 'Teste seus conhecimentos',
      points: 100,
      progress: 0,
      target: 1,
      completed: false,
      icon: '🧠',
    },
    {
      id: 'edu3',
      title: 'Conclua uma trilha educacional',
      description: 'Finalize qualquer trilha de aprendizado',
      points: 200,
      progress: 0,
      target: 1,
      completed: false,
      icon: '🏆',
    },
  ],
};

export default function EducationScreen() {
  const { addPoints } = useApp();
  const [activeSection, setActiveSection] = useState<'overview' | 'whatIsCoop' | 'benefits' | 'tracks' | 'stories' | 'missions'>('overview');
  const [toast, setToast] = useState<{ visible: boolean; points: number; message: string }>({
    visible: false,
    points: 0,
    message: '',
  });

  const handleWatchVideo = async (video: any) => {
    await addPoints(video.points, `Assistiu: ${video.title}`);
    setToast({
      visible: true,
      points: video.points,
      message: 'Vídeo educativo assistido!',
    });
  };

  const handleCompleteMission = async (mission: any) => {
    await addPoints(mission.points, `Missão educacional: ${mission.title}`);
    setToast({
      visible: true,
      points: mission.points,
      message: 'Missão educacional concluída!',
    });
  };

  const SectionHeader = ({ title, subtitle }: { title: string; subtitle: string }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionSubtitle}>{subtitle}</Text>
    </View>
  );

  const VideoCard = ({ video }: { video: any }) => (
    <TouchableOpacity style={styles.videoCard} onPress={() => handleWatchVideo(video)}>
      <Image source={{ uri: video.thumbnail }} style={styles.videoThumbnail} />
      <View style={styles.videoOverlay}>
        <Play size={24} color="#EDEDED" />
      </View>
      <View style={styles.videoInfo}>
        <Text style={styles.videoTitle}>{video.title}</Text>
        <View style={styles.videoMeta}>
          <Text style={styles.videoDuration}>{video.duration}s</Text>
          <Text style={styles.videoPoints}>+{video.points} pts</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const BenefitCard = ({ benefit }: { benefit: any }) => (
    <View style={styles.benefitCard}>
      <Text style={styles.benefitIcon}>{benefit.icon}</Text>
      <Text style={styles.benefitTitle}>{benefit.title}</Text>
      <Text style={styles.benefitDescription}>{benefit.description}</Text>
      <View style={styles.personalizedBox}>
        <Text style={styles.personalizedText}>{benefit.personalizedText}</Text>
      </View>
    </View>
  );

  const TrackCard = ({ track }: { track: any }) => (
    <View style={[styles.trackCard, { borderLeftColor: track.color }]}>
      <View style={styles.trackHeader}>
        <Text style={styles.trackIcon}>{track.icon}</Text>
        <View style={styles.trackInfo}>
          <Text style={styles.trackTitle}>{track.title}</Text>
          <Text style={styles.trackDescription}>{track.description}</Text>
        </View>
        <Text style={styles.trackPoints}>+{track.points} pts</Text>
      </View>
      <View style={styles.trackProgress}>
        <Text style={styles.trackModules}>{track.completed}/{track.modules} módulos</Text>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${(track.completed / track.modules) * 100}%`, backgroundColor: track.color }
            ]} 
          />
        </View>
      </View>
      <TouchableOpacity style={[styles.startTrackButton, { backgroundColor: track.color }]}>
        <Text style={styles.startTrackText}>
          {track.completed === 0 ? 'Começar' : 'Continuar'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const StoryCard = ({ story }: { story: any }) => (
    <TouchableOpacity style={styles.storyCard}>
      <Image source={{ uri: story.thumbnail }} style={styles.storyThumbnail} />
      <View style={styles.storyContent}>
        <Text style={styles.storyTitle}>{story.title}</Text>
        <Text style={styles.storyAuthor}>{story.author}</Text>
        <View style={styles.storyCategory}>
          <Text style={styles.storyCategoryText}>{story.category}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const MissionCard = ({ mission }: { mission: any }) => (
    <View style={styles.missionCard}>
      <View style={styles.missionHeader}>
        <Text style={styles.missionIcon}>{mission.icon}</Text>
        <View style={styles.missionInfo}>
          <Text style={styles.missionTitle}>{mission.title}</Text>
          <Text style={styles.missionDescription}>{mission.description}</Text>
        </View>
        <Text style={styles.missionPoints}>+{mission.points} pts</Text>
      </View>
      <View style={styles.missionProgress}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${(mission.progress / mission.target) * 100}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>{mission.progress}/{mission.target}</Text>
      </View>
      {!mission.completed && (
        <TouchableOpacity 
          style={styles.completeMissionButton}
          onPress={() => handleCompleteMission(mission)}>
          <Text style={styles.completeMissionText}>Simular Conclusão</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const OverviewSection = () => (
    <ScrollView style={styles.overviewContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.welcomeCard}>
        <Text style={styles.welcomeEmoji}>🎓</Text>
        <Text style={styles.welcomeTitle}>Descubra o Cooperativismo</Text>
        <Text style={styles.welcomeSubtitle}>
          Aprenda de forma divertida e ganhe pontos enquanto descobre como as cooperativas podem transformar sua vida financeira!
        </Text>
      </View>

      <View style={styles.quickActions}>
        <TouchableOpacity 
          style={styles.quickAction}
          onPress={() => setActiveSection('whatIsCoop')}>
          <BookOpen size={24} color="#27F1E5" />
          <Text style={styles.quickActionText}>O que é Coop?</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickAction}
          onPress={() => setActiveSection('benefits')}>
          <Star size={24} color="#F59E0B" />
          <Text style={styles.quickActionText}>Benefícios</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickAction}
          onPress={() => setActiveSection('tracks')}>
          <Award size={24} color="#FF3D7F" />
          <Text style={styles.quickActionText}>Trilhas</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickAction}
          onPress={() => setActiveSection('stories')}>
          <Users size={24} color="#22C55E" />
          <Text style={styles.quickActionText}>Histórias</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsCard}>
        <Text style={styles.statsTitle}>📊 Seu Progresso Educacional</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Vídeos Assistidos</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Trilhas Concluídas</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Pontos Educacionais</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'whatIsCoop':
        return (
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <SectionHeader 
              title="🏛️ O que é uma Cooperativa?" 
              subtitle="Vídeos curtos para entender o básico"
            />
            {educationalContent.whatIsCoop.map(video => (
              <VideoCard key={video.id} video={video} />
            ))}
          </ScrollView>
        );
      
      case 'benefits':
        return (
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <SectionHeader 
              title="✨ Benefícios para Você" 
              subtitle="Vantagens personalizadas baseadas no seu perfil"
            />
            {educationalContent.benefits.map((benefit, index) => (
              <BenefitCard key={index} benefit={benefit} />
            ))}
          </ScrollView>
        );
      
      case 'tracks':
        return (
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <SectionHeader 
              title="🎯 Trilhas Gamificadas" 
              subtitle="Aprenda no seu ritmo e ganhe pontos"
            />
            {educationalContent.tracks.map(track => (
              <TrackCard key={track.id} track={track} />
            ))}
          </ScrollView>
        );
      
      case 'stories':
        return (
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <SectionHeader 
              title="💫 Histórias que Inspiram" 
              subtitle="Cases reais de jovens cooperados"
            />
            {educationalContent.stories.map(story => (
              <StoryCard key={story.id} story={story} />
            ))}
          </ScrollView>
        );
      
      case 'missions':
        return (
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <SectionHeader 
              title="🎯 Missões Educacionais" 
              subtitle="Aprenda e ganhe pontos extras"
            />
            {educationalContent.educationalMissions.map(mission => (
              <MissionCard key={mission.id} mission={mission} />
            ))}
          </ScrollView>
        );
      
      default:
        return <OverviewSection />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <GraduationCap size={24} color="#27F1E5" />
        <Text style={styles.headerTitle}>Educação</Text>
      </View>

      <View style={styles.tabsContainer}>
        {[
          { key: 'overview', label: 'Início' },
          { key: 'whatIsCoop', label: 'O que é?' },
          { key: 'benefits', label: 'Benefícios' },
          { key: 'tracks', label: 'Trilhas' },
          { key: 'stories', label: 'Histórias' },
          { key: 'missions', label: 'Missões' },
        ].map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeSection === tab.key && styles.activeTab]}
            onPress={() => setActiveSection(tab.key as any)}>
            <Text style={[styles.tabText, activeSection === tab.key && styles.activeTabText]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {renderContent()}

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
    paddingBottom: 16,
  },
  headerTitle: {
    color: '#EDEDED',
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tab: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: 'rgba(237, 237, 237, 0.05)',
  },
  activeTab: {
    backgroundColor: 'rgba(39, 241, 229, 0.2)',
  },
  tabText: {
    color: '#666',
    fontSize: 12,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#27F1E5',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  overviewContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  welcomeCard: {
    backgroundColor: 'rgba(39, 241, 229, 0.1)',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(39, 241, 229, 0.2)',
  },
  welcomeEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  welcomeTitle: {
    color: '#EDEDED',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  quickAction: {
    width: '48%',
    backgroundColor: 'rgba(237, 237, 237, 0.05)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(39, 241, 229, 0.1)',
  },
  quickActionText: {
    color: '#EDEDED',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  statsCard: {
    backgroundColor: 'rgba(237, 237, 237, 0.05)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(39, 241, 229, 0.1)',
  },
  statsTitle: {
    color: '#EDEDED',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    color: '#27F1E5',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
  },
  sectionHeader: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#27F1E5',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  sectionSubtitle: {
    color: '#666',
    fontSize: 14,
  },
  videoCard: {
    backgroundColor: 'rgba(237, 237, 237, 0.05)',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(39, 241, 229, 0.1)',
  },
  videoThumbnail: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 120,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  videoInfo: {
    padding: 16,
  },
  videoTitle: {
    color: '#EDEDED',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  videoMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  videoDuration: {
    color: '#666',
    fontSize: 14,
  },
  videoPoints: {
    color: '#27F1E5',
    fontSize: 14,
    fontWeight: 'bold',
  },
  benefitCard: {
    backgroundColor: 'rgba(237, 237, 237, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(39, 241, 229, 0.1)',
  },
  benefitIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  benefitTitle: {
    color: '#EDEDED',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  benefitDescription: {
    color: '#666',
    fontSize: 14,
    marginBottom: 16,
  },
  personalizedBox: {
    backgroundColor: 'rgba(39, 241, 229, 0.1)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(39, 241, 229, 0.2)',
  },
  personalizedText: {
    color: '#27F1E5',
    fontSize: 14,
    fontWeight: '500',
  },
  trackCard: {
    backgroundColor: 'rgba(237, 237, 237, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: 'rgba(39, 241, 229, 0.1)',
  },
  trackHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  trackIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  trackInfo: {
    flex: 1,
  },
  trackTitle: {
    color: '#EDEDED',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  trackDescription: {
    color: '#666',
    fontSize: 14,
  },
  trackPoints: {
    color: '#27F1E5',
    fontSize: 14,
    fontWeight: 'bold',
  },
  trackProgress: {
    marginBottom: 16,
  },
  trackModules: {
    color: '#666',
    fontSize: 12,
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#27F1E5',
    borderRadius: 3,
  },
  startTrackButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
  },
  startTrackText: {
    color: '#0D0E16',
    fontSize: 14,
    fontWeight: 'bold',
  },
  storyCard: {
    backgroundColor: 'rgba(237, 237, 237, 0.05)',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(39, 241, 229, 0.1)',
  },
  storyThumbnail: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  storyContent: {
    padding: 16,
  },
  storyTitle: {
    color: '#EDEDED',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  storyAuthor: {
    color: '#666',
    fontSize: 14,
    marginBottom: 12,
  },
  storyCategory: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(39, 241, 229, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  storyCategoryText: {
    color: '#27F1E5',
    fontSize: 12,
    fontWeight: '600',
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
  missionProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressText: {
    color: '#666',
    fontSize: 12,
    fontWeight: '600',
    minWidth: 40,
    textAlign: 'right',
    marginLeft: 12,
  },
  completeMissionButton: {
    backgroundColor: '#27F1E5',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
  },
  completeMissionText: {
    color: '#0D0E16',
    fontSize: 14,
    fontWeight: 'bold',
  },
});