import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useStateForPath } from "@react-navigation/native";

export const useAuth = ({userEmail, userPassword, userConfirmPassword}:{userEmail: string, userPassword: string, userConfirmPassword: string}) => {
    const[authSignInError, setAuthSignInError] = useState<any>(null);
    const[authSignInData, setAuthSignInData] = useState<any>(null); // Accept any variable type

    const[authSignUpError, setAuthSignUpError] = useState<any>(null);
    const[authSignUpData, setAuthSignUpData] = useState<any>(null); // Accept any variable type

    // Sign in handling component
  const signInHandle = async() => {
    // Pass userEmail and userPassword to supabase.auth
    const {data, error} = await supabase.auth.signInWithPassword({
      email: userEmail,
      password: userPassword,
    });

    setAuthSignInData(data);
    setAuthSignInError(error);

    // Email and password must not be empty
    if(!userEmail || !userPassword ) {
        setAuthSignInError("Email or password is empty");
        console.warn(authSignInError);

        return {
            authSignInData: null,
            authSignInError
        };
    }

    // Retrieve the data and error from AuthHandle
    // If there is error, set error message and print it
    if(error){
        setAuthSignInError(error.toString());
        console.error(`Sign-in FAILED!`, authSignInError);

        return {
            authSignInData: null,
            authSignInError
        }
    } 
    // Else, the sign in process is SUCCESSFUL, reset the error message, print the data
    else{
      // Reset error message if there is any from the previous stage
      setAuthSignInError('');
      console.log(`Sign-in successfully! `, data);

      return {
        authSignInData,
        authSignInError: null
      }
    }
  };

  // Sign Up handle
  const signUpHandle = async() => {
    const{ data, error } = await supabase.auth.signUp({
        email: userEmail,
        password: userPassword
    });

    setAuthSignUpData(data);
    setAuthSignUpError(authSignUpError);

    // Email and password must not be empty
    if(!userEmail || !userPassword ) {
        setAuthSignUpError("Email or password is empty");
        console.warn(authSignUpError);
        return (
            {authSignUpData: null, authSignUpError}
        );
    }
    // Retrieve the data and error from AuthHandle
    // If there is error, set error message and print it

    if(userConfirmPassword !== userPassword){
        setAuthSignUpError("Confirm password does not match");
        console.warn(authSignUpError);
        return (
            {authSignUpData: null, authSignUpError}
        );
    }

    if(error){
        setAuthSignUpError(error.toString());
        console.error(`Sign-up FAILED!`, authSignUpError);
    } 
    // Else, the sign in process is successful, reset the error message, print the data
    else{
        // Reset error message if there is any from the previous stage
        setAuthSignUpError('');
        console.log(`Sign-up successfully! `, data);
        return (
            {authSignUpData, authSignUpError: null}
        );
    }
  }

  return {
    signInHandle,
    signUpHandle,
  };
}