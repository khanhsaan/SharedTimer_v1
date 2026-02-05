import React, { useEffect, useState } from 'react';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import ProfileGate from '../(auth)/ProfileGate';
import TimerScreen from './TimerScreen';
import useAuthContext from '../hooks/useAuthContext';
import { AuthContextObject } from '../types';

export default function RootLayout() {
    const[selectedProfileID, setSelectedProfileID] = useState<string>('');

    const {data, error} = useAuthContext();
    if(error){
      console.error(`Error while calling useAuthContext: ${error.message}`);
      // redirect to login screen
    }
    const context: AuthContextObject = data;
    const session = context.authSession;
    const currentUser = session?.user;

    const authLoading = context.authLoading;
    
    if(session && !authLoading){
      if(selectedProfileID === ''){
        return (
          <ProfileGate 
            user={session.user} 
            returnedSelectedProfileID={(profileID) => setSelectedProfileID(profileID)}>
          </ProfileGate>
        )
      }
      return (
        <TimerScreen user={currentUser} selectedProfileID={selectedProfileID}></TimerScreen>
      )
    }
  } 

