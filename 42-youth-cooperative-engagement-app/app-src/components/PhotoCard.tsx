import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Heart, MessageCircle, Share, Bookmark } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';

interface PhotoCardProps {
  photo: any;
  onPointsGained: (points: number, message: string) => void;
}

const { width } = Dimensions.get('window');

export function PhotoCard({ photo, onPointsGained }: PhotoCardProps) {
  const { likeVideo } = useApp();
  const [isLiked, setIsLiked] = useState(false);

  const handleLike = async () => {
    if (!isLiked) {
      setIsLiked(true);
      await likeVideo(photo.id);
      onPointsGained(1, 'Curtiu foto');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={{ uri: photo.author.avatar }} style={styles.avatar} />
        <View style={styles.userInfo}>
          <Text style={styles.username}>{photo.author.name}</Text>
          <Text style={styles.handle}>@{photo.author.handle}</Text>
        </View>
        <TouchableOpacity style={styles.followButton}>
          <Text style={styles.followText}>Seguir</Text>
        </TouchableOpacity>
      </View>

      <Image source={{ uri: photo.image }} style={styles.photo} />

      <View style={styles.actions}>
        <View style={styles.leftActions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
            <Heart size={24} color={isLiked ? '#FF3D7F' : '#EDEDED'} fill={isLiked ? '#FF3D7F' : 'none'} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <MessageCircle size={24} color="#EDEDED" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Share size={24} color="#EDEDED" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.actionButton}>
          <Bookmark size={24} color="#EDEDED" />
        </TouchableOpacity>
      </View>

      <View style={styles.info}>
        <Text style={styles.likes}>{photo.likes} curtidas</Text>
        <Text style={styles.caption}>
          <Text style={styles.captionUsername}>{photo.author.handle}</Text> {photo.caption}
        </Text>
        <View style={styles.tags}>
          {photo.tags.map((tag: string, index: number) => (
            <Text key={index} style={styles.tag}>#{tag}</Text>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0D0E16',
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    color: '#EDEDED',
    fontSize: 14,
    fontWeight: 'bold',
  },
  handle: {
    color: '#666',
    fontSize: 12,
  },
  followButton: {
    backgroundColor: '#27F1E5',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  followText: {
    color: '#0D0E16',
    fontSize: 12,
    fontWeight: 'bold',
  },
  photo: {
    width: width,
    height: width,
    resizeMode: 'cover',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  leftActions: {
    flexDirection: 'row',
  },
  actionButton: {
    marginRight: 16,
  },
  info: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  likes: {
    color: '#EDEDED',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  caption: {
    color: '#EDEDED',
    fontSize: 14,
    lineHeight: 18,
    marginBottom: 8,
  },
  captionUsername: {
    fontWeight: 'bold',
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    color: '#27F1E5',
    fontSize: 14,
    marginRight: 8,
    fontWeight: '500',
  },
});