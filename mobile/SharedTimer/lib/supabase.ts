import { AppState, Platform } from 'react-native'
import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient, processLock } from '@supabase/supabase-js'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_KEY!;

interface HealthCheck {
  isConnected: boolean,
  error?: string,
}

export async function supabaseHealthCheck(): Promise<{health: HealthCheck}>
{
  try{
    if(!supabaseUrl || !supabaseKey){
      const health: HealthCheck = {
        isConnected: false,
        error: 'Missing Supabase credentials'
      }
      return {
        health
      }
    }

    const {data, error} = await supabase
    .from('profiles')
    .select('count')
    .limit(1)

    if(error) {
      const health: HealthCheck = {
        isConnected: false,
        error: error.message,
      }
      return {
        health
      }
    }

    const{error: authError} = await supabase.auth.getSession();

    if(authError){
      return {
        health: {
          isConnected: false,
          error: `Supabase Auth Service error: ${authError.message}`
        }
      }
    }

    return {
      health: {
        isConnected: true,
      }
    }
  } catch (error) {
    return {
      health: {
        isConnected: false,
        error: error instanceof Error ? error.message : 'Unknow error',
      }
    }
  } 
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    ...(Platform.OS !== "web" ? { storage: AsyncStorage } : {}),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    lock: processLock,
  },
  realtime: {
    params: {
      eventPerSeconds: 10,
    }
  }
})

if (Platform.OS !== "web") {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      supabase.auth.startAutoRefresh()
    } else {
      supabase.auth.stopAutoRefresh()
    }
  })
}