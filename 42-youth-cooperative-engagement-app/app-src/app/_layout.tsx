import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AppProvider, useApp } from '@/contexts/AppContext';
import { LoadingScreen } from '@/components/LoadingScreen';

function RootContent() {
  const { user, isLoading } = useApp();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Show splash screen for at least 4 seconds
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);
  
  if (isLoading || showSplash) {
    return <LoadingScreen />;
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="login" />
        ) : (
          <>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="chat" options={{ presentation: 'modal' }} />
            <Stack.Screen name="wallet" options={{ presentation: 'modal' }} />
          </>
        )}
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="light" />
    </>
  );
}

export default function RootLayout() {
  useFrameworkReady();

  return (
    <AppProvider>
      <RootContent />
    </AppProvider>
  );
}