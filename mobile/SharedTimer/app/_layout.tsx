import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useSegments, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { useEffect, useState } from 'react';
import { supabaseHealthCheck } from '@/lib/supabase';
import { Button, ColorSchemeName, Text, TouchableOpacity, View } from 'react-native';
import { useAuthContext } from './hooks/useAuthContext';
import { AuthContextProvider } from './context/AuthContext';

interface Errors{
  healthCheckError: string,
}

interface AppContentProps {
  colorScheme: ColorSchemeName,
  loaded: boolean,
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  return (
    <AuthContextProvider>
      <AppContent
        colorScheme={colorScheme}
        loaded={loaded}>
      </AppContent>
    </AuthContextProvider>
  )
}

function AppContent({ colorScheme, loaded }: AppContentProps){

  // AuthContext
  const response = useAuthContext();

  if(response.error) {
    console.log(`Error while calling useAuthContext: ${response.error.message}`);
  }
  
  const {
    authSession,
    authError,
    authLoading,
    clearError
  } = response.data;

  const[loading, setLoading] = useState(true);
  const[healthCheck, setHealthCheck] = useState<boolean>(true);
  const[error, setError] = useState<Errors | null>(null);
  const segments = useSegments();
  const router = useRouter();

  const session = authSession;

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
    setLoading(false);
  }

  const intialiseSupabase = async() => {
    await getSupabaseHealthCheck();

    if(error?.healthCheckError){
      console.error(error);
      setError(error);
      return;
    }

    setError(null);
  }

  useEffect(() => {
    intialiseSupabase(); // Connect to supabase
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

  if (!loaded || loading || authLoading) {
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
        <TouchableOpacity
          onPress={() => router.replace('/(auth)/AuthScreen')}
          style={{
            marginTop: 20,
            padding: 12,
            backgroundColor: '#007AFF',
            borderRadius: 8
          }}>
            <Text style={{color: 'white', fontWeight: '600'}}>
              Retry Login
            </Text>

        </TouchableOpacity>
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

