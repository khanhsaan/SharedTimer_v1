import {supabase} from '../../lib/supabase';

export const authHandle = async({user_email, user_password}: {user_email: string, user_password: string}) => {
    const {data, error} = await supabase.auth.signInWithPassword({
        email: user_email,
        password: user_password,
    }) 

    return {data, error};
}

export default authHandle;