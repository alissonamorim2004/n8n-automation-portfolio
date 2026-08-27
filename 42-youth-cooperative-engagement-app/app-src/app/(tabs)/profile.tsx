import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, StyleSheet, Alert, Dimensions } from 'react-native';
import { User, Settings, MessageCircle, Wallet, LogOut, Play, Heart, Users, Share, Bookmark, MoveHorizontal as MoreHorizontal, Plus } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

// Mock user videos baseado no exemplo
const mockUserVideos = [
  {
    id: '1',
    thumbnail: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?w=300',
    views: 198,
    isVideo: true,
  },
  {
    id: '2',
    thumbnail: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?w=300',
    views: 231,
    isVideo: true,
  },
  {
    id: '3',
    thumbnail: 'https://images.pexels.com/photos/1024311/pexels-photo-1024311.jpeg?w=300',
    views: 199,
    isVideo: true,
  },
  {
    id: '4',
    thumbnail: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?w=300',
    views: 206,
    isVideo: true,
  },
  {
    id: '5',
    thumbnail: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?w=300',
    views: 143,
    isVideo: true,
  },
  {
    id: '6',
    thumbnail: 'https://images.pexels.com/photos/974314/pexels-photo-974314.jpeg?w=300',
    views: 116,
    isVideo: true,
  },
];

export default function ProfileScreen() {
  const { user, points, clearData, logout } = useApp();
  const [activeTab, setActiveTab] = useState<'posts' | 'private' | 'liked'>('posts');

  const handleLogout = () => {
    Alert.alert(
      'Sair da conta',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sair', onPress: logout },
      ]
    );
  };

  const handleClearData = () => {
    Alert.alert(
      'Limpar todos os dados',
      'Esta ação irá remover todos os seus dados e não pode ser desfeita. Tem certeza?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Limpar', style: 'destructive', onPress: clearData },
      ]
    );
  };

  const openChat = () => {
    router.push('/chat');
  };

  const openWallet = () => {
    router.push('/wallet');
  };

  const VideoItem = ({ video }: { video: any }) => (
    <TouchableOpacity style={styles.videoItem}>
      <Image source={{ uri: video.thumbnail }} style={styles.videoThumbnail} />
      <View style={styles.videoOverlay}>
        <Play size={16} color="#EDEDED" fill="#EDEDED" />
      </View>
      <View style={styles.videoViews}>
        <Play size={10} color="#EDEDED" />
        <Text style={styles.videoViewsText}>{video.views}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton}>
            <User size={20} color="#EDEDED" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>@{user?.handle || 'usuario'}</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.headerButton}>
              <Share size={20} color="#EDEDED" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton} onPress={() => {}}>
              <MoreHorizontal size={20} color="#EDEDED" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Profile Info */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: user?.avatar || 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?w=200' }} style={styles.avatar} />
            <TouchableOpacity style={styles.addButton}>
              <Plus size={16} color="#0D0E16" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.name}>{user?.name || 'Nome do Usuário'}</Text>
          <Text style={styles.handle}>@{user?.handle || 'usuario'}</Text>

          <View style={styles.statsContainer}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>24</Text>
              <Text style={styles.statLabel}>Seguindo</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>46</Text>
              <Text style={styles.statLabel}>Seguidores</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>248</Text>
              <Text style={styles.statLabel}>Curtidas</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.addBioButton}>
            <Plus size={16} color="#666" />
            <Text style={styles.addBioText}>Add biografia</Text>
          </TouchableOpacity>

          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.studioButton}>
              <Text style={styles.studioIcon}>🎬</Text>
              <Text style={styles.studioText}>CoopTok Studio</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.ordersButton} onPress={openWallet}>
              <Text style={styles.ordersIcon}>🛍️</Text>
              <Text style={styles.ordersText}>Seus pedidos</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Content Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.contentTab, activeTab === 'posts' && styles.activeContentTab]}
            onPress={() => setActiveTab('posts')}>
            <View style={styles.tabIcon}>
              <View style={[styles.gridIcon, activeTab === 'posts' && styles.activeGridIcon]} />
              <View style={[styles.gridIcon, activeTab === 'posts' && styles.activeGridIcon]} />
              <View style={[styles.gridIcon, activeTab === 'posts' && styles.activeGridIcon]} />
              <View style={[styles.gridIcon, activeTab === 'posts' && styles.activeGridIcon]} />
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.contentTab, activeTab === 'private' && styles.activeContentTab]}
            onPress={() => setActiveTab('private')}>
            <Users size={20} color={activeTab === 'private' ? '#EDEDED' : '#666'} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.contentTab, activeTab === 'liked' && styles.activeContentTab]}
            onPress={() => setActiveTab('liked')}>
            <Heart size={20} color={activeTab === 'liked' ? '#EDEDED' : '#666'} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.contentTab}>
            <Bookmark size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Videos Grid */}
        <View style={styles.videosGrid}>
          {mockUserVideos.map((video) => (
            <VideoItem key={video.id} video={video} />
          ))}
        </View>

        {/* Actions */}
        <View style={styles.actionsSection}>
          <TouchableOpacity style={styles.actionItem} onPress={handleClearData}>
            <Text style={styles.actionText}>🗑️ Limpar dados do protótipo</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionItem} onPress={handleLogout}>
            <LogOut size={20} color="#EF4444" />
            <Text style={[styles.actionText, { color: '#EF4444' }]}>Sair da conta</Text>
          </TouchableOpacity>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#666',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    color: '#EDEDED',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerRight: {
    flexDirection: 'row',
  },
  profileSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#27F1E5',
  },
  addButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#27F1E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    color: '#EDEDED',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  handle: {
    color: '#666',
    fontSize: 16,
    marginBottom: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
    width: '100%',
  },
  stat: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    color: '#EDEDED',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    color: '#666',
    fontSize: 14,
  },
  addBioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(102, 102, 102, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 24,
  },
  addBioText: {
    color: '#666',
    fontSize: 14,
    marginLeft: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  studioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(237, 237, 237, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    flex: 1,
    marginRight: 8,
    justifyContent: 'center',
  },
  studioIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  studioText: {
    color: '#EDEDED',
    fontSize: 14,
    fontWeight: '600',
  },
  ordersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(237, 237, 237, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    flex: 1,
    marginLeft: 8,
    justifyContent: 'center',
  },
  ordersIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  ordersText: {
    color: '#EDEDED',
    fontSize: 14,
    fontWeight: '600',
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(102, 102, 102, 0.3)',
    marginTop: 20,
  },
  contentTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeContentTab: {
    borderBottomColor: '#EDEDED',
  },
  tabIcon: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 16,
    height: 16,
  },
  gridIcon: {
    width: 6,
    height: 6,
    backgroundColor: '#666',
    margin: 1,
  },
  activeGridIcon: {
    backgroundColor: '#EDEDED',
  },
  videosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 2,
    paddingTop: 2,
  },
  videoItem: {
    width: (width - 4) / 3,
    aspectRatio: 9/16,
    marginBottom: 2,
    marginHorizontal: 1,
    position: 'relative',
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  videoOverlay: {
    position: 'absolute',
    bottom: 8,
    left: 8,
  },
  videoViews: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  videoViewsText: {
    color: '#EDEDED',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  actionsSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(39, 241, 229, 0.1)',
    marginTop: 20,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  actionText: {
    color: '#EDEDED',
    fontSize: 16,
    marginLeft: 12,
  },
});