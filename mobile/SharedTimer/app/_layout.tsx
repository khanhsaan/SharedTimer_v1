import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useSegments, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const[session, setSession] = useState<Session | null> (null);
  const[loading, setLoading] = useState(true);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(
      ({data: {session}}) => {
        setSession(session);
        setLoading(false);
      }
    );

    // listens for event: login, logout, ... then set the new session
    const{data: {subscription}} = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    // if there is still background running, return
    if (loading) return;
    const inAuth = segments[0] === '(auth)';

    if(!session && !inAuth) {
      router.replace('/(auth)/AuthScreen');
    } else if(session && inAuth) {
      router.replace('/(tabs)');
    }
  }, [segments, session]);

  if (!loaded || loading) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false}}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name='+not-found'/>
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
