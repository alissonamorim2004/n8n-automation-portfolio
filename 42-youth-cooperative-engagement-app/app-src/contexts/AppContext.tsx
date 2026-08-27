import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { mockUsers, mockVideos, mockMissions, mockRewards } from '@/data/mockData';
import { User, Video, Mission, Reward, PointTransaction, UserRedemption } from '@/types';

// Mock photos data
const mockPhotos = [
  {
    id: 'p1',
    image: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?w=400',
    caption: 'Aprendendo sobre cooperativismo na prática! 📚✨',
    likes: 124,
    author: mockUsers[0],
    tags: ['cooperativismo', 'educação', 'aprendizado'],
  },
  {
    id: 'p2',
    image: 'https://images.pexels.com/photos/259027/pexels-photo-259027.jpeg?w=400',
    caption: 'Organizando minhas finanças com as dicas da cooperativa 💰',
    likes: 89,
    author: mockUsers[1],
    tags: ['finanças', 'organização', 'dicas'],
  },
  {
    id: 'p3',
    image: 'https://images.pexels.com/photos/3760069/pexels-photo-3760069.jpeg?w=400',
    caption: 'Cada ponto conta para conquistar meus objetivos! 🎯',
    likes: 156,
    author: mockUsers[2],
    tags: ['gamificação', 'objetivos', 'conquistas'],
  },
  {
    id: 'p4',
    image: 'https://images.pexels.com/photos/974314/pexels-photo-974314.jpeg?w=400',
    caption: 'Sustentabilidade e cooperação andam juntas 🌱',
    likes: 78,
    author: mockUsers[3],
    tags: ['sustentabilidade', 'cooperação', 'natureza'],
  },
  {
    id: 'p5',
    image: 'https://images.pexels.com/photos/1181676/pexels-photo-1181676.jpeg?w=400',
    caption: 'Primeiro emprego conquistado com ajuda da cooperativa! 🎉',
    likes: 203,
    author: mockUsers[4],
    tags: ['trabalho', 'conquista', 'primeiro emprego'],
  },
];

interface AppContextType {
  user: User | null;
  points: number;
  videos: Video[];
  photos: any[];
  missions: Mission[];
  rewards: Reward[];
  transactions: PointTransaction[];
  redemptions: UserRedemption[];
  ranking: Array<{ user: User; weeklyPoints: number; position: number }>;
  isLoading: boolean;
  
  // Auth
  login: (userData: Omit<User, 'id' | 'createdAt' | 'totalPoints' | 'weeklyPoints'>) => Promise<void>;
  logout: () => Promise<void>;
  
  // Points
  addPoints: (amount: number, reason: string, videoId?: string) => Promise<void>;
  spendPoints: (amount: number, reason: string, rewardId?: string) => Promise<void>;
  
  // Videos
  watchVideo: (videoId: string) => Promise<void>;
  likeVideo: (videoId: string) => Promise<void>;
  
  // Missions
  completeMission: (missionId: string) => Promise<void>;
  
  // Rewards
  redeemReward: (rewardId: string) => Promise<void>;
  
  // Data
  clearData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [points, setPoints] = useState(0);
  const [videos, setVideos] = useState<Video[]>(mockVideos);
  const [photos] = useState(mockPhotos);
  const [missions, setMissions] = useState<Mission[]>(mockMissions);
  const [rewards] = useState<Reward[]>(mockRewards);
  const [transactions, setTransactions] = useState<PointTransaction[]>([]);
  const [redemptions, setRedemptions] = useState<UserRedemption[]>([]);
  const [ranking, setRanking] = useState<Array<{ user: User; weeklyPoints: number; position: number }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (user) {
      generateRanking();
    }
  }, [user, points]);

  const loadData = async () => {
    try {
      const userData = await AsyncStorage.getItem('cooptok_user');
      const pointsData = await AsyncStorage.getItem('cooptok_points');
      const transactionsData = await AsyncStorage.getItem('cooptok_transactions');
      const redemptionsData = await AsyncStorage.getItem('cooptok_redemptions');
      const missionsData = await AsyncStorage.getItem('cooptok_missions');
      const videosData = await AsyncStorage.getItem('cooptok_videos');

      if (userData) setUser(JSON.parse(userData));
      if (pointsData) setPoints(parseInt(pointsData));
      if (transactionsData) setTransactions(JSON.parse(transactionsData));
      if (redemptionsData) setRedemptions(JSON.parse(redemptionsData));
      if (missionsData) setMissions(JSON.parse(missionsData));
      if (videosData) setVideos(JSON.parse(videosData));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveData = async (key: string, data: any) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error saving ${key}:`, error);
    }
  };

  const generateRanking = () => {
    const rankingData = mockUsers.map((mockUser, index) => ({
      user: mockUser,
      weeklyPoints: user?.handle === mockUser.handle ? points : Math.floor(Math.random() * 500) + 100,
      position: 0,
    }));

    rankingData.sort((a, b) => b.weeklyPoints - a.weeklyPoints);
    rankingData.forEach((item, index) => {
      item.position = index + 1;
    });

    setRanking(rankingData);
  };

  const login = async (userData: Omit<User, 'id' | 'createdAt' | 'totalPoints' | 'weeklyPoints'>) => {
    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      totalPoints: 0,
      weeklyPoints: 0,
    };

    setUser(newUser);
    setPoints(0);
    await saveData('cooptok_user', newUser);
    await saveData('cooptok_points', 0);
  };

  const logout = async () => {
    setUser(null);
    setPoints(0);
    setTransactions([]);
    setRedemptions([]);
    await clearData();
  };

  const addPoints = async (amount: number, reason: string, videoId?: string) => {
    const newPoints = points + amount;
    setPoints(newPoints);
    
    const transaction: PointTransaction = {
      id: Date.now().toString(),
      amount,
      type: 'earned',
      reason,
      timestamp: new Date().toISOString(),
      videoId,
    };
    
    const newTransactions = [transaction, ...transactions];
    setTransactions(newTransactions);
    
    await saveData('cooptok_points', newPoints);
    await saveData('cooptok_transactions', newTransactions);
  };

  const spendPoints = async (amount: number, reason: string, rewardId?: string) => {
    if (points < amount) throw new Error('Pontos insuficientes');
    
    const newPoints = points - amount;
    setPoints(newPoints);
    
    const transaction: PointTransaction = {
      id: Date.now().toString(),
      amount: -amount,
      type: 'spent',
      reason,
      timestamp: new Date().toISOString(),
      rewardId,
    };
    
    const newTransactions = [transaction, ...transactions];
    setTransactions(newTransactions);
    
    await saveData('cooptok_points', newPoints);
    await saveData('cooptok_transactions', newTransactions);
  };

  const watchVideo = async (videoId: string) => {
    const video = videos.find(v => v.id === videoId);
    if (!video || !user) return;

    const today = new Date().toDateString();
    const alreadyWatched = transactions.some(t => 
      t.videoId === videoId && 
      t.reason === 'Assistiu vídeo' &&
      new Date(t.timestamp).toDateString() === today
    );

    if (!alreadyWatched) {
      await addPoints(2, 'Assistiu vídeo', videoId);
      
      // Update video views
      const updatedVideos = videos.map(v => 
        v.id === videoId ? { ...v, views: v.views + 1 } : v
      );
      setVideos(updatedVideos);
      await saveData('cooptok_videos', updatedVideos);
    }
  };

  const likeVideo = async (videoId: string) => {
    const video = videos.find(v => v.id === videoId);
    if (!video || !user) return;

    const today = new Date().toDateString();
    const likesToday = transactions.filter(t => 
      t.reason === 'Curtiu vídeo' &&
      new Date(t.timestamp).toDateString() === today
    ).length;

    if (likesToday < 20) {
      await addPoints(1, 'Curtiu vídeo', videoId);
      
      // Update video likes
      const updatedVideos = videos.map(v => 
        v.id === videoId ? { ...v, likes: v.likes + 1 } : v
      );
      setVideos(updatedVideos);
      await saveData('cooptok_videos', updatedVideos);
    }
  };

  const completeMission = async (missionId: string) => {
    const mission = missions.find(m => m.id === missionId);
    if (!mission || mission.completed) return;

    await addPoints(mission.points, `Missão: ${mission.title}`);
    
    const updatedMissions = missions.map(m => 
      m.id === missionId ? { ...m, completed: true } : m
    );
    setMissions(updatedMissions);
    await saveData('cooptok_missions', updatedMissions);
  };

  const redeemReward = async (rewardId: string) => {
    const reward = rewards.find(r => r.id === rewardId);
    if (!reward) return;

    await spendPoints(reward.cost, `Resgate: ${reward.title}`, rewardId);
    
    const redemption: UserRedemption = {
      id: Date.now().toString(),
      rewardId,
      userId: user!.id,
      status: 'pending',
      redeemedAt: new Date().toISOString(),
    };
    
    const newRedemptions = [redemption, ...redemptions];
    setRedemptions(newRedemptions);
    await saveData('cooptok_redemptions', newRedemptions);
  };

  const clearData = async () => {
    await AsyncStorage.multiRemove([
      'cooptok_user',
      'cooptok_points',
      'cooptok_transactions',
      'cooptok_redemptions',
      'cooptok_missions',
      'cooptok_videos',
    ]);
    
    setUser(null);
    setPoints(0);
    setTransactions([]);
    setRedemptions([]);
    setMissions(mockMissions);
    setVideos(mockVideos);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        points,
        videos,
        photos,
        missions,
        rewards,
        transactions,
        redemptions,
        ranking,
        isLoading,
        login,
        logout,
        addPoints,
        spendPoints,
        watchVideo,
        likeVideo,
        completeMission,
        redeemReward,
        clearData,
      }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};