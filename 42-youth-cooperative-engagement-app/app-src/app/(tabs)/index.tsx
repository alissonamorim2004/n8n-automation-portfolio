import React, { useState, useRef } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Dimensions, Text } from 'react-native';
import { TrendingUp, Sparkles, Image as ImageIcon } from 'lucide-react-native';
import { VideoCard } from '@/components/VideoCard';
import { PhotoCard } from '@/components/PhotoCard';
import { PointsToast } from '@/components/PointsToast';
import { useApp } from '@/contexts/AppContext';

const { height } = Dimensions.get('window');

export default function FeedScreen() {
  const { videos, user, points, photos } = useApp();
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [feedType, setFeedType] = useState<'foryou' | 'trending' | 'photos'>('foryou');
  const [toast, setToast] = useState<{ visible: boolean; points: number; message: string }>({
    visible: false,
    points: 0,
    message: '',
  });
  const flatListRef = useRef<FlatList>(null);

  const getFilteredContent = () => {
    if (feedType === 'photos') {
      return photos || [];
    }
    
    if (feedType === 'foryou') {
      // Se o usuário tem interesses, filtra por eles, senão mostra todos os vídeos
      if (user?.interests && user.interests.length > 0) {
        const filteredVideos = videos.filter(v => 
          user.interests.some(interest => 
            v.tags.includes(interest) || v.category === interest
          )
        );
        // Se não encontrou vídeos com os interesses, mostra todos
        return filteredVideos.length > 0 
          ? filteredVideos.sort((a, b) => new Date(b.id).getTime() - new Date(a.id).getTime())
          : videos.sort((a, b) => new Date(b.id).getTime() - new Date(a.id).getTime());
      }
      // Se não tem usuário ou interesses, mostra todos os vídeos
      return videos.sort((a, b) => new Date(b.id).getTime() - new Date(a.id).getTime());
    }
    
    // Feed "Em alta" - ordenado por engajamento
    return videos.sort((a, b) => (b.likes + b.views) - (a.likes + a.views));
  };

  const displayContent = getFilteredContent();

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setActiveVideoIndex(viewableItems[0].index || 0);
    }
  }).current;

  const handlePointsGained = (pointsGained: number, message: string) => {
    setToast({
      visible: true,
      points: pointsGained,
      message,
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, feedType === 'foryou' && styles.activeTab]}
            onPress={() => setFeedType('foryou')}>
            <Sparkles size={16} color={feedType === 'foryou' ? '#27F1E5' : '#666'} />
            <Text style={[styles.tabText, feedType === 'foryou' && styles.activeTabText]}>
              Para você
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, feedType === 'trending' && styles.activeTab]}
            onPress={() => setFeedType('trending')}>
            <TrendingUp size={16} color={feedType === 'trending' ? '#27F1E5' : '#666'} />
            <Text style={[styles.tabText, feedType === 'trending' && styles.activeTabText]}>
              Em alta
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, feedType === 'photos' && styles.activeTab]}
            onPress={() => setFeedType('photos')}>
            <ImageIcon size={16} color={feedType === 'photos' ? '#27F1E5' : '#666'} />
            <Text style={[styles.tabText, feedType === 'photos' && styles.activeTabText]}>
              Fotos
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.pointsContainer}>
          <Text style={styles.points}>{points} pts</Text>
        </View>
      </View>

      {/* Video Feed */}
      <FlatList
        ref={flatListRef}
        data={displayContent}
        renderItem={({ item, index }) => (
          feedType === 'photos' ? (
            <PhotoCard
              photo={item}
              onPointsGained={handlePointsGained}
            />
          ) : (
            <VideoCard
              video={item}
              isActive={index === activeVideoIndex}
              onPointsGained={handlePointsGained}
            />
          )
        )}
        pagingEnabled={feedType !== 'photos'}
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{
          itemVisiblePercentThreshold: 50,
        }}
        getItemLayout={(_, index) => ({
          length: height - 140,
          offset: feedType === 'photos' ? 0 : (height - 140) * index,
          index,
        })}
        keyExtractor={(item) => item.id}
      />

      {/* Points Toast */}
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
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: '#0D0E16',
  },
  tabContainer: {
    flexDirection: 'row',
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  activeTab: {
    backgroundColor: 'rgba(39, 241, 229, 0.1)',
  },
  tabText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  activeTabText: {
    color: '#27F1E5',
  },
  pointsContainer: {
    backgroundColor: 'rgba(39, 241, 229, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  points: {
    color: '#27F1E5',
    fontSize: 14,
    fontWeight: 'bold',
  },
  postButton: {
    position: 'absolute',
    right: 16,
    bottom: 100,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#27F1E5',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#27F1E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});