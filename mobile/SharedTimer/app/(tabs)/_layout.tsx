import React, { useEffect, useState } from 'react';
import ProfileGate from '../(auth)/ProfileGate';
import TimerScreen from './TimerScreen';
import useAuthContext from '../hooks/useAuthContext';
import { AuthContextObject } from '../types';
import { router, Stack } from 'expo-router';
import { Text, View } from 'react-native';

export default function RootLayout() {
    const[selectedProfileID, setSelectedProfileID] = useState<string>('');

    const {data, error} = useAuthContext();

    if(error){
      console.error(`Error while calling useAuthContext: ${error.message}`);
      // redirect to login screen
      router.replace('/(auth)/AuthScreen');
      return;
    }

    const context: AuthContextObject = data;
    const session = context.authSession;
    const authLoading = context.authLoading;

    if(authLoading){
      return (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Text>Loading...</Text>
        </View>
      )
    }

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
        <TimerScreen selectedProfileID={selectedProfileID}></TimerScreen>
      )
    }

    return (
      <Stack screenOptions={{headerShown: false}}>
        <Stack.Screen name='TimerScreen'></Stack.Screen>
      </Stack>
    )
}

