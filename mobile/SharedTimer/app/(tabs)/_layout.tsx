import { Tabs } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Auth as AuthScreen} from './AuthScreen';
import HomeScreen from './index';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { ProfileGate } from './ProfileGate';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Check the for the current use session from the local storage and listen for the authentication change once on start
  useEffect(() => {
    // Retrieve the user session from the local storage, if the user has logged in or not
    supabase.auth.getSession().then(({ data: {session} }) => {
      setSession(session);
      setLoading(false);
    });
    
    // Listen to any change on Authentication then set the session respectively

    // event:
    // A string indicating the type of authentication event that occurred (e.g., 'SIGNED_IN', 'SIGNED_OUT', 'SIGNED_UP', 'PASSWORD_RECOVERY', 'USER_UPDATED', 'TOKEN_REFRESHED').

    // session:
    // An object containing the current user session information, including the user's details and access token, if a session exists. If no session is active (e.g., after a logout), the session parameter will be null.
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      console.log(`onAuthChange event: ${_event}`);
    });
  }, []);
  
  // If the current user session is null return AuthScreen
  if(!session) {
    console.log("THE USER SESSION IS NULL!");
    return (
      <AuthScreen></AuthScreen>
    )
  }
  console.log("THE USER SESSION IS NOT NULL");
  return (
    <ProfileGate></ProfileGate>
  )
}
