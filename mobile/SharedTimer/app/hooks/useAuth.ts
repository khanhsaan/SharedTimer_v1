import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useStateForPath } from "@react-navigation/native";

export const useAuth = ({userEmail, userPassword, userConfirmPassword}:{userEmail: string, userPassword: string, userConfirmPassword: string}) => {
    const[authSignInError, setAuthSignInError] = useState<any>(null);
    const[authSignInData, setAuthSignInData] = useState<any>(null); // Accept any variable type
    // store and set the current signed in user
    const[user, setUser] = useState<any>(null);

    const[authSignUpError, setAuthSignUpError] = useState<any>(null);
    const[authSignUpData, setAuthSignUpData] = useState<any>(null); // Accept any variable type

    // Sign in handling component
  const signInHandle = async() => {
    // Pass userEmail and userPassword to supabase.auth
    const {data, error} = await supabase.auth.signInWithPassword({
      email: userEmail,
      password: userPassword,
    });

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
        const code = error.code;
        setAuthSignUpError(code);
        console.error(`Sign-in FAILED!`, authSignInError);

        return {
            authSignInData: null,
            authSignInError: authSignInError
        }
    } 
    // Else, the sign in process is SUCCESSFUL, reset the error message, print the data
    else{
      // Reset error message if there is any from the previous stage
      setAuthSignInError('');
      console.log(`Sign-in successfully! `, data);
      setUser(data.user)
      
      return {
        authSignInData: data,
        authSignInError: null
      }
    }
  };

  // Sign out handling component
  const signOutHandle = async() => {
    const{error} = await supabase.auth.signOut();

    return {
      error,
    }
  };

  // Sign Up handle
  const signUpHandle = async() => {
    const{ data, error } = await supabase.auth.signUp({
        email: userEmail,
        password: userPassword
    });

    setAuthSignUpData(data);
    setAuthSignUpError(authSignInError);

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
        const code = error.code;
        const name = error.name;
        // DEBUG
        console.error(`Sign-up FAILED!`, code);
        return (
          {
            signUpData: null,
            signUpError: code
          }
        )
    } 
    // Else, the sign in process is successful, reset the error message, print the data
    else{
        // Reset error message if there is any from the previous stage
        setAuthSignUpError('');
        console.log(`Sign-up successfully! `, data);
        return (
            {
              signUpData: authSignUpData, 
              signUpError: null
            }
        );
    }
  }

  const mapErrorMessage = (error: any) => {
      const message = (error?.message || error?.error_description || "").toLowerCase();
      const code  = (error?.code || error?.error_code).toLowerCase();
      const status = error?.status;

      let error_message = "";

      if(code === "weak_password") {
        return error_message = "Password must contain atleast 6 characters."
      }

      if(message.includes("already registered") || message.includes("already exists") || code == "user_already_exists" || status === 422){
        return error_message = "Account has been registered!";
      } else {
        return error_message = message;
      }
  }

  return {
    signInHandle,
    signUpHandle,
    signOutHandle
  };
}