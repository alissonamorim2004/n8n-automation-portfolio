import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Heart, MessageCircle, Share, Bookmark, Play } from 'lucide-react-native';
import { Video } from '@/types';
import { useApp } from '@/contexts/AppContext';

interface VideoCardProps {
  video: Video;
  isActive: boolean;
  onPointsGained: (points: number, message: string) => void;
}

const { height, width } = Dimensions.get('window');

export function VideoCard({ video, isActive, onPointsGained }: VideoCardProps) {
  const { watchVideo, likeVideo } = useApp();
  const [hasWatched, setHasWatched] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleWatch = async () => {
    if (!hasWatched && isActive) {
      setHasWatched(true);
      setIsPlaying(true);
      
      // Simulate 5 second watch
      setTimeout(async () => {
        await watchVideo(video.id);
        onPointsGained(2, 'Assistiu vídeo');
      }, 5000);
    }
  };

  const handleLike = async () => {
    if (!isLiked) {
      setIsLiked(true);
      await likeVideo(video.id);
      onPointsGained(1, 'Curtiu vídeo');
    }
  };

  React.useEffect(() => {
    if (isActive) {
      handleWatch();
    }
  }, [isActive]);

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.videoContainer} onPress={() => setIsPlaying(!isPlaying)}>
        <Image source={{ uri: video.thumbnail }} style={styles.video} />
        {!isPlaying && (
          <View style={styles.playOverlay}>
            <Play size={60} color="#27F1E5" />
          </View>
        )}
        {isPlaying && (
          <View style={styles.playingIndicator}>
            <View style={styles.pulse} />
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.sidebar}>
        <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
          <Heart size={28} color={isLiked ? '#FF3D7F' : '#EDEDED'} fill={isLiked ? '#FF3D7F' : 'none'} />
          <Text style={styles.actionText}>{video.likes}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <MessageCircle size={28} color="#EDEDED" />
          <Text style={styles.actionText}>42</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Share size={28} color="#EDEDED" />
          <Text style={styles.actionText}>12</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Bookmark size={28} color="#EDEDED" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.avatar}>
          <Image source={{ uri: video.author.avatar }} style={styles.avatarImage} />
        </TouchableOpacity>
      </View>

      <View style={styles.info}>
        <Text style={styles.handle}>@{video.author.handle}</Text>
        <Text style={styles.title}>{video.title}</Text>
        <View style={styles.tags}>
          {video.tags.map((tag, index) => (
            <Text key={index} style={styles.tag}>#{tag}</Text>
          ))}
        </View>
        <Text style={styles.stats}>{video.views} visualizações</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width,
    height: height - 140,
    backgroundColor: '#0D0E16',
  },
  videoContainer: {
    flex: 1,
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  playOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  playingIndicator: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  pulse: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#27F1E5',
  },
  sidebar: {
    position: 'absolute',
    right: 12,
    bottom: 80,
    alignItems: 'center',
  },
  actionButton: {
    alignItems: 'center',
    marginBottom: 20,
  },
  actionText: {
    color: '#EDEDED',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
  },
  avatar: {
    marginTop: 20,
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#27F1E5',
  },
  info: {
    position: 'absolute',
    left: 12,
    bottom: 20,
    right: 80,
  },
  handle: {
    color: '#EDEDED',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  title: {
    color: '#EDEDED',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    lineHeight: 22,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  tag: {
    color: '#27F1E5',
    fontSize: 14,
    marginRight: 8,
    fontWeight: '500',
  },
  stats: {
    color: '#999',
    fontSize: 12,
  },
});