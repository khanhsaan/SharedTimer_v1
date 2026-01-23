import { getSession, supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";
import React, { createContext, ReactNode, useCallback, useEffect, useState } from "react";

interface AuthContextObject {
    session: Session,
}

const AuthContext = createContext<AuthContextObject | undefined>;

export const AuthContextProvider: React.FC<{children: ReactNode}> = ({ children }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        try{ 
            const session = getSession();
            setSession(session);
        } catch(err){
            if(err instanceof Error){
                console.log(`Failed to get session: ${err.message}`);
                setError(`Failed to get session: ${err.message}`);
            } else {
                console.log(`Failed to get session: Unknown error`);
                setError(`Failed to get session: Unknown error`);
            }
        } 
    }, []);

    const clearError = useCallback(() => {
        setError('');
    }, []);

    if(session){
        
    }
}