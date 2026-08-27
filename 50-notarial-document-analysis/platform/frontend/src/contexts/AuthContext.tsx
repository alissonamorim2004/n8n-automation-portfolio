import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Profile } from '../types/database';
import { api, authApi } from '../lib/api';

interface AuthContextType {
  user: any | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MOCK_MODE = true;

const mockProfile: Profile = {
  id: 'mock-user-123',
  email: 'admin@exemplo.com',
  full_name: 'Administrador',
  role: 'admin',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    if (MOCK_MODE) {
      const mockToken = localStorage.getItem('mock_token');
      if (mockToken === 'mock-jwt-token') {
        setUser({ id: mockProfile.id, email: mockProfile.email });
        setProfile(mockProfile);
      }
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('access_token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await authApi.getProfile();
      if (response.data) {
        setUser({ id: response.data.id, email: response.data.email });
        setProfile(response.data);
      } else {
        localStorage.removeItem('access_token');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      localStorage.removeItem('access_token');
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 800));
      localStorage.setItem('mock_token', 'mock-jwt-token');
      setUser({ id: mockProfile.id, email: mockProfile.email });
      setProfile(mockProfile);
      return;
    }

    const response = await authApi.login(email, password);

    if (response.error) {
      throw new Error(response.error);
    }

    if (response.data?.access_token) {
      api.setToken(response.data.access_token);
      await loadProfile();
    } else {
      throw new Error('Token não recebido do servidor');
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 800));
      localStorage.setItem('mock_token', 'mock-jwt-token');
      setUser({ id: mockProfile.id, email: mockProfile.email });
      setProfile(mockProfile);
      return;
    }

    const response = await authApi.register(email, password, fullName);

    if (response.error) {
      throw new Error(response.error);
    }

    if (response.data?.access_token) {
      api.setToken(response.data.access_token);
      await loadProfile();
    } else {
      throw new Error('Token não recebido do servidor');
    }
  };

  const signOut = async () => {
    if (MOCK_MODE) {
      localStorage.removeItem('mock_token');
      setUser(null);
      setProfile(null);
      return;
    }

    api.setToken(null);
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
