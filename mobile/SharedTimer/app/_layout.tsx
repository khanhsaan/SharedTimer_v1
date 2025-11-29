import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useSegments, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase, supabaseHealthCheck } from '@/lib/supabase';
import { Text, View } from 'react-native';

export default function RootLayout() {
  interface Errors{
    healthCheckError: string,
  }

  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const[session, setSession] = useState<Session | null> (null);
  const[loading, setLoading] = useState(true);
  const[healthCheck, setHealthCheck] = useState<boolean>(true);
  const[error, setError] = useState<Errors | null>(null);
  const segments = useSegments();
  const router = useRouter();

  const getSupabaseHealthCheck = async() => {
    const healthRes = await supabaseHealthCheck();
    // If there is no health check response
    if(!healthRes) {
      console.error("There is no health response from supabaseHealthCheck()");
      setError({healthCheckError: 'There is no health response from supabaseHealthCheck()'});
      setHealthCheck(false);
      setLoading(false);
      return;
    }
    // If there is health check error
    if(healthRes.health.error || !healthRes.health.isConnected) {
      setError(
        {healthCheckError: healthRes.health.error || 'Unknown connection error'}
      )
      setHealthCheck(false);
      setLoading(false);
      return;
    }
    console.log('Supabase can be connected!')
    setHealthCheck(true);
    setError(null);
  }

  const intialiseSupabase = async() => {
    await getSupabaseHealthCheck();

    if(error?.healthCheckError){
      console.error(error);
      return;
    }

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
  }

  useEffect(() => {
    intialiseSupabase();
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
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text>Loading...</Text>
      </View>
    )
  }

  if(error?.healthCheckError && !healthCheck) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text>Unable to connect to Supabase</Text>
        <Text>{error.healthCheckError}</Text>
      </View>
    )
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
