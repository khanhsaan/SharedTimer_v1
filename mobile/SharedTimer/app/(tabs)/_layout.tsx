import React, { useEffect, useState } from 'react';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import ProfileGate from '../(auth)/ProfileGate';
import TimerScreen from './TimerScreen';

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const[selectedProfileID, setSelectedProfileID] = useState<string>('');

  // Check the for the current use session from the local storage and listen for the authentication change once on start
  useEffect(() => {
    supabase.auth.getSession().then(({ data: {session} }) => {
      setSession(session);
      setLoading(false);
    });
    
  }, []);
  
  if(session && !loading){
    if(selectedProfileID === ''){
      return (
        <ProfileGate 
          user={session.user} 
          returnedSelectedProfileID={(profileID) => setSelectedProfileID(profileID)}>
        </ProfileGate>
      )
    }
    return (
      <TimerScreen user={session.user} selectedProfileID={selectedProfileID}></TimerScreen>
    )
  }
} 
