import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  type: 'citizen' | 'school' | 'semed';
  name: string;
  profile?: CitizenProfile | SchoolProfile;
}

interface CitizenProfile {
  cpf: string;
  phone: string;
  address: string;
  district: string;
  cep: string;
  familyIncome: number;
  hasBolsaFamilia: boolean;
  children: {
    name: string;
    birthDate: string;
    hasSpecialNeeds: boolean;
    specialNeedsDescription?: string;
  }[];
}

interface SchoolProfile {
  cnpj: string;
  phone: string;
  address: string;
  district: string;
  cep: string;
  principalName: string;
  capacity: number;
  levels: string[];
  infrastructure: string[];
  requiredDocuments: string[];
  description: string;
  images: string[];
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; redirectTo?: string }>;
  register: (userData: any) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar se há usuário logado no localStorage
    const savedUser = localStorage.getItem('portaledu_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Erro ao carregar usuário salvo:', error);
        localStorage.removeItem('portaledu_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; redirectTo?: string }> => {
    try {
      // Mock authentication - em produção seria uma API real
      const mockUsers = [
        {
          id: '1',
          email: 'usuario@exemplo.com',
          password: '123456',
          type: 'citizen' as const,
          name: 'Maria Silva Santos',
          profile: {
            cpf: '000.000.000-00',
            phone: '(69) 99999-9999',
            address: 'Rua das Palmeiras, 456',
            district: 'Vila Nova',
            cep: '76980-000',
            familyIncome: 2500,
            hasBolsaFamilia: true,
            children: [
              {
                name: 'Ana Silva Santos',
                birthDate: '2015-03-15',
                hasSpecialNeeds: false
              }
            ]
          }
        },
        {
          id: '2',
          email: 'escola.vilanova@vilhena.ro.gov.br',
          password: '123456',
          type: 'school' as const,
          name: 'Escola Municipal Vila Nova',
          profile: {
            cnpj: '12.345.678/0001-90',
            phone: '(69) 3321-8765',
            address: 'Rua das Palmeiras, 456',
            district: 'Vila Nova',
            cep: '76980-000',
            principalName: 'Profª. Maria Fernanda',
            capacity: 250,
            levels: ['Fundamental I', 'Fundamental II', 'Ensino Médio'],
            infrastructure: ['Biblioteca', 'Laboratório de Informática', 'Quadra Esportiva', 'Refeitório'],
            requiredDocuments: [
              'Certidão de Nascimento (original e cópia)',
              'Comprovante de Residência (atual)',
              'Cartão de Vacinação (atualizado)',
              'CPF do Responsável',
              'RG do Responsável',
              'Histórico Escolar (se houver)'
            ],
            description: 'Escola municipal com foco na formação integral do aluno, oferecendo ensino de qualidade do 1º ano do Fundamental ao Ensino Médio.',
            images: [
              'https://images.pexels.com/photos/207692/pexels-photo-207692.jpeg',
              'https://images.pexels.com/photos/256541/pexels-photo-256541.jpeg'
            ]
          }
        },
        {
          id: '3',
          email: 'semed@vilhena.ro.gov.br',
          password: '123456',
          type: 'semed' as const,
          name: 'João Carlos Silva',
        }
      ];

      const foundUser = mockUsers.find(u => u.email === email && u.password === password);
      
      if (foundUser) {
        const { password: _, ...userWithoutPassword } = foundUser;
        setUser(userWithoutPassword);
        localStorage.setItem('portaledu_user', JSON.stringify(userWithoutPassword));
        
        // Definir rota de redirecionamento baseada no tipo de usuário
        const redirectRoutes = {
          citizen: '/cidadao',
          school: '/escola',
          semed: '/semed'
        };
        
        return { 
          success: true, 
          redirectTo: redirectRoutes[foundUser.type] 
        };
      }
      
      return { success: false };
    } catch (error) {
      console.error('Erro no login:', error);
      return { success: false };
    }
  };

  const register = async (userData: any): Promise<boolean> => {
    try {
      // Mock registration - em produção seria uma API real
      const newUser: User = {
        id: Date.now().toString(),
        email: userData.email,
        type: userData.type,
        name: userData.name,
        profile: userData.profile
      };

      setUser(newUser);
      localStorage.setItem('portaledu_user', JSON.stringify(newUser));
      return true;
    } catch (error) {
      console.error('Erro no cadastro:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('portaledu_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};