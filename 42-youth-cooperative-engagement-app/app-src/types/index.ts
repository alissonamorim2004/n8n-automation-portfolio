export interface User {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  region: string;
  interests: string[];
  totalPoints: number;
  weeklyPoints: number;
  createdAt: string;
}

export interface Video {
  id: string;
  title: string;
  author: User;
  thumbnail: string;
  views: number;
  likes: number;
  tags: string[];
  category: string;
  duration: number;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  points: number;
  type: 'daily' | 'weekly';
  target: number;
  progress: number;
  completed: boolean;
  icon: string;
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  cost: number;
  category: 'credit' | 'education' | 'events';
  available: boolean;
  image: string;
}

export interface PointTransaction {
  id: string;
  amount: number;
  type: 'earned' | 'spent';
  reason: string;
  timestamp: string;
  videoId?: string;
  rewardId?: string;
}

export interface UserRedemption {
  id: string;
  rewardId: string;
  userId: string;
  status: 'pending' | 'approved' | 'delivered';
  redeemedAt: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: string;
}