import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";
import React, { createContext, ReactNode, useCallback, useEffect, useState } from "react";

interface AuthContextObject {
    authSession: Session | null,
    authError: string | null,
    authLoading: boolean,
    clearError: () => void,
}

export const AuthContext = createContext<AuthContextObject | undefined>(undefined);

export const AuthContextProvider: React.FC<{children: ReactNode}> = ({ children }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        setLoading(true);
        supabase.auth.getSession()
            .then(({ data }) => {
                setSession(data.session);
            })
            .catch((error) => {
                console.log(`Failed to fetch session: ${error.message}`);
                setError(error.message);
            })
            .finally(() => {
                setLoading(false);
            })

        const {data: {subscription}} = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setError(null);
        })

        return () => subscription.unsubscribe();
    }, [])

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    const value: AuthContextObject = {
        authSession: session,
        authError: error,
        authLoading: loading,
        clearError
    }

    return (
        <AuthContext.Provider value = {value}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthContextProvider;