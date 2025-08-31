import { supabase } from "@/lib/supabase";

export const useProfiles = ({user, newProfileName}: {user: any, newProfileName: string}) => {
    
    const createProfiles = async() => {
        if(!user){
            return {
                data: null,
                error: 'Missing user'
            }
        }
        if(!newProfileName){
            return {
                data: null,
                error: 'Missing name'
            }
        }
        // Insert the new profile to supabase
        const { data, error: err } = await supabase
            .from('profiles')
            .insert({user_id: user.id, name: newProfileName})
            .select('id, name, created_at')
            .single();
        
        if(err){
            console.error('Failed to create new profile: ', err.message.toString());
            
            return {
                data: null,
                error: err
            }
        }
        console.log('Create profile SUCCESSFULLY!')
        return {
            data,
            error: null
        }
    }

    return (
        createProfiles
    )
}