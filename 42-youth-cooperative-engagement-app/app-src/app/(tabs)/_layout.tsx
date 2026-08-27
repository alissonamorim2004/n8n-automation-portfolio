import { Tabs } from 'expo-router';
import { Chrome as Home, Gift, Trophy, User, Camera, GraduationCap } from 'lucide-react-native';
import { View } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0D0E16',
          borderTopWidth: 1,
          borderTopColor: '#27F1E5',
          paddingTop: 8,
          paddingBottom: 8,
          height: 70,
        },
        tabBarActiveTintColor: '#27F1E5',
        tabBarInactiveTintColor: '#666',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Feed',
          tabBarIcon: ({ size, color }) => (
            <Home size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="rewards"
        options={{
          title: 'Recompensas',
          tabBarIcon: ({ size, color }) => (
            <Gift size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="camera"
        options={{
          title: 'Câmera',
          tabBarIcon: ({ size, color }) => (
            <View style={{
              backgroundColor: color === '#27F1E5' ? '#27F1E5' : 'transparent',
              borderRadius: 20,
              padding: 8,
              borderWidth: 2,
              borderColor: color,
            }}>
              <Camera size={size - 4} color={color === '#27F1E5' ? '#0D0E16' : color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="education"
        options={{
          title: 'Educação',
          tabBarIcon: ({ size, color }) => (
            <GraduationCap size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ size, color }) => (
            <User size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="ranking"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="missions"
        options={{
          href: null, // Hide from tab bar
        }}
      />
    </Tabs>
  );
}