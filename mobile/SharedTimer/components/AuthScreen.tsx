import React, { useState } from 'react'
import { Alert, Button, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { supabase } from '../lib/supabase'
import { authHandle } from '@/app/handle/AuthHandle'
import { ScrollView } from 'react-native-reanimated/lib/typescript/Animated'

// Custom hook
export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const[errorMsg, setErrorMsg] = useState('');
  // Check if the user wants to Sign in or Sign up
  const[isSignIn, setIsSignIn] = useState(false);

  // Sign in handling component
  const signInHandle = async() => {
    // Email and password must not be empty
    if(!email || !password ) {
      setErrorMsg("Email or password is empty");
      console.warn(errorMsg);
      return;
    }
    // Retrieve the data and error from AuthHandle
    let {data, error} = await authHandle({user_email: email, user_password: password});
    // If there is error, set error message and print it
    if(error){
      setErrorMsg(error.message);
      console.error(`Sign-in FAILED!`, errorMsg);
    } 
    // Else, the sign in process is successful, reset the error message, print the data
    else{
      setErrorMsg('');
      console.log(`Sign-in successfully! `, data);
    }
  }

  async function signInWithEmail() {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    })

    if (error) Alert.alert(error.message)
    setLoading(false)
  }

  async function signUpWithEmail() {
    setLoading(true)
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email: email,
      password: password,
    })

    if (error) Alert.alert(error.message)
    if (!session) Alert.alert('Please check your inbox for email verification!')
    setLoading(false)
  }

  // Provided supabase's sign in UI
  return (
    <KeyboardAvoidingView
      style = {styles.auth}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

        <ScrollView
          contentContainerStyle={styles.authScrollContainer}>
            <Text style={styles.authTitle}>SharedTimer</Text>
        </ScrollView>

    </KeyboardAvoidingView>
  )
  // return (
  //   <View style={styles.container}>
  //     <View style={[styles.verticallySpaced, styles.mt20]}>
  //       <Text>Email</Text>
  //       <TextInput
  //         onChangeText={(text: string) => setEmail(text)}
  //         value={email}
  //         placeholder="email@address.com"
  //         autoCapitalize={'none'}
  //         style={styles.textInput}
  //       />
  //     </View>
  //     <View style={styles.verticallySpaced}>
  //       <Text>Password</Text>
  //       <TextInput
  //         onChangeText={(text: string) => setPassword(text)}
  //         value={password}
  //         secureTextEntry={true}
  //         placeholder="Password"
  //         autoCapitalize={'none'}
  //         style={styles.textInput}
  //       />
  //     </View>
  //     <View style={[styles.verticallySpaced, styles.mt20]}>
  //       <Button title="Sign in" disabled={loading} onPress={() => signInHandle()} />
  //     </View>
  //     <View style={styles.verticallySpaced}>
  //       <Button title="Sign up" disabled={loading} onPress={() => signInHandle()} />
  //     </View>
  //   </View>
  // )
}

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    padding: 12,
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: 'stretch',
  },
  mt20: {
    marginTop: 20,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginTop: 5,
    color: 'white',
  },
  auth: {
    flex: 1,
    backgroundColor: '#667eea',
    paddingHorizontal: 32,
    justifyContent: 'center',
    alignItems: 'center',
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
})