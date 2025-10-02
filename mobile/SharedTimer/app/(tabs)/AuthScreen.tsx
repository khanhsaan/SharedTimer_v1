import React, { use, useEffect, useState } from 'react'
import { Alert, Button, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView, SafeAreaView } from 'react-native'
import { supabase } from '../../lib/supabase'
import { authHandle } from '@/app/handle/AuthHandle'
import { configRegExp } from 'expo-router/build/fork/getStateFromPath-forks'
import { useAuth } from '../hooks/useAuth'

// Custom hook
export function Auth() {
  const [userEmail, setUserEmail] = useState('')
  const [userPassword, setUserPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const[errorMsg, setErrorMsg] = useState('');
  // Check if the user wants to Sign in or Sign up
  const[isSignIn, setIsSignIn] = useState(false);

  const{ signInHandle, signUpHandle } = useAuth({userEmail, userPassword, userConfirmPassword: confirmPassword});

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.auth}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        
        <ScrollView
          contentContainerStyle={styles.authScrollContainer}
          showsVerticalScrollIndicator={false}>
            <Text style={styles.authTitle}>SharedTimer</Text>

            <View style={styles.authCard}>
              {/* Email input field */}
              <TextInput
                style={styles.authInput}
                placeholder='Email'
                value={userEmail}
                onChangeText={(newText) => setUserEmail(newText)}
                keyboardType='email-address'
                autoCapitalize='none'
                autoCorrect={false}
                placeholderTextColor={"rgba(45, 55, 72, 0.5)"}  
              />
              
              {/* Password input field */}
              <TextInput
                style={styles.authInput}
                placeholder='Password'
                value={userPassword}
                onChangeText={(newText) => setUserPassword(newText)}
                secureTextEntry
                placeholderTextColor={"rgba(45, 55, 72, 0.5)"}
              />

              {/* Extra input field appears to confirm password when in Sign Up mode */}
              {!isSignIn && (
                <TextInput
                  style={styles.authInput}
                  placeholder='Confirm password'
                  value={confirmPassword}
                  onChangeText={(newText) => setConfirmPassword(newText)}
                  secureTextEntry
                  placeholderTextColor="rgba(45, 55, 72, 0.5)"
                />
              )}

              {/* Banner appears when an email already exists */}
              {errorMsg && errorMsg.includes('user_already_exists') && (
                <View
                  style={styles.banner}>
                  <Text
                    style={styles.bannerText}>
                      Email already exists, sign in instead!
                  </Text>    
                </View>
              )} 

              {/* Banner appears when wrong credentials */}
              {errorMsg && errorMsg.includes('invalid_credentials') && (
                <View
                  style={styles.banner}>
                  <Text
                    style={styles.bannerText}>
                      Wrong email or password, please try again.
                  </Text>    
                </View>
              )}              

              {/* Sign In / Sign Up button */}
              <TouchableOpacity
                style={[styles.authButton, loading && styles.authButtonDisabled]}
                onPress={async() => {
                  // Signing In
                  if(isSignIn === true){
                    const success = await signInHandle();
                    if(success?.authSignInError){
                      const error = success.authSignInError;
                      console.error(`authSignInError: ${error}`)
                      setErrorMsg(error);
                    } else {
                      console.error(`No authSignInError`);
                      setErrorMsg('');
                    }
                  // Signing Up
                  } else {
                    const success = await signUpHandle();
                    // If there is no error from the sign up state, move to the sign in page
                    if(success?.signUpError === null){
                      console.log(`NO signUpError\nsignUpData: ${success.signUpData}`);
                      setIsSignIn(true);
                      setErrorMsg('');
                    } 
                    
                    else if(success.signUpError){
                      const error = success.signUpError;
                      console.log(`signUpError: ${error}`);
                      setErrorMsg(error);
                      setIsSignIn(false);
                    }
                  }
                }}
                disabled={loading}
                activeOpacity={0.8}>

                  <Text
                    style={styles.authButtonText}>
                      {loading ? 'Please wait...' : (isSignIn ? 'Sign in' : 'Sign Up')}
                  </Text>
              </TouchableOpacity>

              {/* Switch between Sign in / Sign Up */}
              <TouchableOpacity
                style={styles.linkButton}
                onPress={() => {
                  setIsSignIn(!isSignIn);
                }}
                disabled={loading}
                activeOpacity={0.8}>
                  <Text
                    style={styles.linkButtonText}>
                      {isSignIn ? 'Create account' : 'Already have an account? Sign in' }
                  </Text>
              </TouchableOpacity>
            </View>
        </ScrollView>

      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  // STATIC LAYOUT - NO ADAPTIVE FEATURES - CONSISTENT ACROSS ALL DEVICES
  container: {
    flex: 1,
    backgroundColor: '#667eea', // Ensure background covers entire screen
  },
  auth: {
    flex: 1,
    // backgroundColor: '#667eea',
    paddingHorizontal: 32,
  },
  authScrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  authTitle: {
    color: 'white',
    fontSize: 42, // FIXED SIZE - NO RESPONSIVE
    fontWeight: '700',
    marginBottom: 32,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 8,
  },
  authCard: {
    width: 350, // FIXED WIDTH - NO PERCENTAGE OR MAX/MIN
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 40,
    elevation: 10,
  },
  authInput: {
    width: 302, // FIXED WIDTH (350 - 48 padding)
    height: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
    color: '#2d3748',
    borderWidth: 1,
    borderColor: 'rgba(102, 126, 234, 0.2)',
  },
  banner: {
    backgroundColor: '#fed7d7',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#fca5a5',
  },
  bannerText: {
    color: '#c53030',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  authButton: {
    width: 302, // FIXED WIDTH - SAME AS INPUT
    height: 48,
    backgroundColor: '#667eea',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  authButtonDisabled: {
    opacity: 0.6,
  },
  authButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  linkButton: {
    width: 302, // FIXED WIDTH - SAME AS INPUT
    height: 48,
    backgroundColor: 'transparent',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#667eea',
  },
  linkButtonText: {
    color: '#667eea',
    fontSize: 16,
    fontWeight: '600',
  },
});