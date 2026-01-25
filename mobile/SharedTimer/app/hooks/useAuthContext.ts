import { useContext } from "react"
import { AuthContext } from "../context/AuthContext"

export const useAuthContext = () => {
    const context = useContext(AuthContext);

    if(context === undefined){
        throw new Error('Context must be used with a AuthContext');
    }

    return context;
}

export default useAuthContext;