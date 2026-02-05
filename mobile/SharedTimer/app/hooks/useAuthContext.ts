import { useContext } from "react"
import { AuthContext } from "../context/AuthContext"
import { AuthContextObject, ResponseType } from "../types";

export const useAuthContext = (): ResponseType => {
    const context: AuthContextObject | undefined = useContext(AuthContext);

    if(context === undefined){
        return {
            data: null,
            error: new Error(`Auth context is UNDEFINED`)
        }
    }

    return {
        data: context,
        error: null
    }
}

export default useAuthContext;