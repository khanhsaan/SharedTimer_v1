import { Session } from "@supabase/supabase-js";

export interface ResponseType {
    data: any,
    error: Error | null,
}

export interface AuthContextObject {
    authSession: Session | null,
    authError: string | null,
    authLoading: boolean,
    clearError: () => void,
}