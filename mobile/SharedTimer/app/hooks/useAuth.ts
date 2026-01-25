import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useStateForPath } from "@react-navigation/native";

export const useAuth = ({ userEmail, userPassword, userConfirmPassword }: { userEmail: string, userPassword: string, userConfirmPassword?: string }) => {
  const [authSignInError, setAuthSignInError] = useState<any>(null);
  const [authSignInData, setAuthSignInData] = useState<any>(null); // Accept any variable type
  // store and set the current signed in user
  const [user, setUser] = useState<any>(null);

  const [authSignUpError, setAuthSignUpError] = useState<any>(null);
  const [authSignUpData, setAuthSignUpData] = useState<any>(null); // Accept any variable type

  // Sign in handling component
  const signInHandle = async () => {
    // Email and password must not be empty
    if (!userEmail || !userPassword) {
      const error = "Email or password is empty";
      setAuthSignInError("Email or password is empty");
      console.warn(error);

      return {
        authSignInData: null,
        authSignInError: error
      };
    }

    // Pass userEmail and userPassword to supabase.auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email: userEmail,
      password: userPassword,
    });

    // Retrieve the data and error from AuthHandle
    // If there is error, set error message and print it
    if (error) {
      const code = error.code;
      setAuthSignInError(code);
      console.error(`Sign-in FAILED!`, code);

      return {
        authSignInData: null,
        authSignInError: authSignInError
      }
    }
    // Else, the sign in process is SUCCESSFUL, reset the error message, print the data
    else {
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
  const signOutHandle = async () => {
    const { error } = await supabase.auth.signOut();

    return {
      error,
    }
  };

  // Sign Up handle
  const signUpHandle = async () => {
    // Email and password must not be empty
    if (!userEmail || !userPassword) {
      setAuthSignUpError("Email or password is empty");
      console.warn(authSignUpError);
      return (
        {
          authSignUpData: null,
          authSignUpError: "Email or password is empty",
        }
      );
    }

    // Password and confirm Password must match
    if (userConfirmPassword !== userPassword) {
      setAuthSignUpError("Confirm password does not match");
      console.warn(authSignUpError);
      return (
        {
          authSignUpData: null,
          authSignUpError: "Confirm password does not match",
        }
      );
    }

    const { data, error } = await supabase.auth.signUp({
      email: userEmail,
      password: userPassword
    });

    // Retrieve the data and error from AuthHandle
    // If there is error, set error message and print it

    if (error) {
      const code = error.code;
      // DEBUG
      console.error(`Sign-up FAILED!`, code);
      setAuthSignUpError(code);
      setAuthSignUpData(null);
      return (
        {
          authSignUpData: null,
          authSignUpError: code
        }
      )
    }
    // Else, the sign in process is successful, reset the error message, print the data
    else {
      // Reset error message if there is any from the previous stage
      setAuthSignUpError(null);
      setAuthSignUpData(data);
      console.log(`Sign-up successfully! `, data);
      return (
        {
          authSignUpData: data,
          authSignUpError: null
        }
      );
    }
  }

  const mapErrorMessage = (error: any) => {
    const message = (error?.message || error?.error_description || "").toLowerCase();
    const code = (error?.code || error?.error_code).toLowerCase();
    const status = error?.status;

    let error_message = "";

    if (code === "weak_password") {
      return error_message = "Password must contain atleast 6 characters."
    }

    if (message.includes("already registered") || message.includes("already exists") || code == "user_already_exists" || status === 422) {
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

export default useAuth;