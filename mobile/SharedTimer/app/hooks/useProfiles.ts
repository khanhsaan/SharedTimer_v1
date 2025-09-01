import { supabase } from "@/lib/supabase";
import { useCallback, useEffect, useState } from "react";

// Create an array type to make sure the consistence
interface Profiles {
    id: string,
    name: string,
    created_at: string;
}
export const useProfiles = () => {
    // Create array to store the created profiles which have any type of value
    const[profilesArr, setProfilesArr] = useState<Profiles[]>([]);
    

    // Create a method that listens for if the logged in user is change
    const refresh = async(user: any) => {
        const{ data, error } = await supabase
            .from('profiles')
            .select('id, name, created_at')
            .eq('user_id', user.id)
            .order('created_at', {ascending: true})

        // If there is error while retrieving the profiles
        if(error){
            console.error('Error while retrieving profiles, ', error?.message.toString());
            return {
                data: null,
                error
            }
        }
        // If there is no error and there is data
        if(!error && data) {
            console.log('Retrieve profiles SUCCESSFULLY! ');
            console.log('Profiles length: ', data.length);
            // Add the new created profile to the array

            console.log('Profiles type: ', data);
            

            return {
                // Force the returned data have the type Profiles
                data: data as Profiles[],
                error: null
            }
        }
    };

    const createProfiles = async(newProfileName: string, user: any) => {
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
            data: data,
            error: null
        }
    }

    return {
        createProfiles,
        refresh
    }   
}