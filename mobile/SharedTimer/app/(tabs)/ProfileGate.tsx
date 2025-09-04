import { useEffect, useState } from "react";
import { StyleSheet, Dimensions, Text, TextInput, TouchableOpacity, Animated } from "react-native";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useProfiles } from "../hooks/useProfiles";

// Create an array type to make sure the consistence
interface Profiles {
    id: string,
    name: string,
    created_at: string;
}

export function ProfileGate({user, returnedSelectedProfileID}:{user: any, returnedSelectedProfileID: (profileID: string) => void}) {
    const[isHighlighted, setIsHighLighted] = useState<boolean>(false);
    const[selectedProfileID, setSelectedProfileID] = useState<string>('');
    const[newProfileName, setNewProfileName] = useState<string>('');

    const {createProfiles, retrieveProfiles, handleDeleteProfile} = useProfiles();
    const[profilesArr, setProfilesArr] = useState<Profiles[]>([]);

    const [isNewProfile, setIsNewProfile] = useState<boolean>(false);

    const[buttonAnimation] = useState(new Animated.Value(0));

    // Listen for the user session changed, run refresh() to retrieve the corresponding profiles
    useEffect(() => {
        if(user?.id){
            retrieveProfiles(user)
                .then(response => {
                    if(response?.data){
                        setProfilesArr(response.data);
                    }
                })
        }
    }, [user?.id])

    // Retrieve all of the profiles once on initiation
    useEffect(() => {
        if(user?.id){
            retrieveProfiles(user)
                .then(response => {
                    if(response?.data){
                        setProfilesArr(response.data);
                    }
                })
        }
    }, [])


    return (
        <SafeAreaView
            style={styles.container}>
                <ScrollView
                    contentContainerStyle={styles.scrollContent}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View>
                            <Text style={styles.title}>Shared Timers</Text>
                            <Text style={styles.subtitle}>Welcome to Shared Timer</Text>
                        </View>
                    </View>

                    {/* Profile Gate card */}
                    <View style={styles.profileCard}>
                        <Text style={styles.profileCardTitle}>Choose Your Profile</Text>
                    </View>

                    {/* Profiles management card */}
                    <View style={styles.card}>
                        {/* HEADER */}
                        <View style={styles.cardHeader}>
                            <Text style={styles.cardTitle}>Your Profiles</Text>

                            <View style={styles.createRow}>
                                {/* Input field to create a new profile */}
                                <TextInput style={styles.input}
                                    placeholder="Enter new profile name"
                                    value={newProfileName}
                                    onChangeText={(newText) => setNewProfileName(newText)}
                                    placeholderTextColor={"rgba(45, 55, 72, 0.5)"}>
                                </TextInput>
                                
                                {/* Create new profile button */}
                                <TouchableOpacity style={styles.createButton}
                                    onPress={async() => { 
                                        const response = await createProfiles(newProfileName, user)
                                        // If there is no error and there is data once the profile has been created
                                        if(!response?.error && response?.data){
                                            const response = await retrieveProfiles(user);
                                            // If there is no error and there is data once all of the profiles has been retrieved
                                            if(!response?.error && response?.data){
                                                setProfilesArr(response.data);
                                            }
                                        }
                                        setNewProfileName('');
                                    }}>
                                    <Text style={styles.createButtonText}>Create</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* PROFILES */}

                        {/* If there is no profile, display emtpy UI */}
                        {profilesArr?.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyIcon}>🎭</Text>
                                <Text style={styles.emptyText}>No profiles yet. Create your first profile above!</Text>
                            </View>
                        // Else, display profiles UI
                        ) : (
                            <View style={styles.profilesGrid}>
                                {/*  Profile Card */}
                                {profilesArr?.map((p: Profiles) => (
                                    <TouchableOpacity
                                        key={p.id}
                                        style={[
                                            styles.profileItem,
                                        ]}
                                        // When a profile is pressed
                                        onPress={() => {
                                            setSelectedProfileID(p.id);
                                            setIsHighLighted(true);
                                            returnedSelectedProfileID(selectedProfileID);
                                            console.log("Selected profile ID: ", selectedProfileID);
                                            console.log("Is highlighted ", isHighlighted);
                                        }}>
                                           <Text style={styles.profileName}>
                                                {p.name}
                                            </Text>

                                            {/* Delete profile button */}
                                            <TouchableOpacity style={styles.deleteButton}
                                                onPress={async() => {
                                                    // Waiting the response from deleting profile
                                                    const response = await handleDeleteProfile(p.id, p.name, user.id)
                                                    
                                                    // If there is error
                                                    if(response.error){
                                                        console.error(response.error.toString());
                                                
                                                    }
                                                    // If there is no error 
                                                    else if (!response.error) {
                                                        console.log(`Delete profile SUCCESSFULLY`, response.data);

                                                        // Waiting for the response from retrieving profiles
                                                        const response2 = await retrieveProfiles(user);
                                                        
                                                        // If there is no error and there is data once all of the profiles has been retrieved
                                                        if(!response2?.error && response2?.data){
                                                            setProfilesArr(response2.data);
                                                        }
                                                    }
                                                    
                                                }}>
                                                    <Text style={styles.deleteButtonText}>
                                                        Delete
                                                    </Text>

                                            </TouchableOpacity>
                                    </TouchableOpacity>

                                ))}

                            </View>
                        )}
                    </View>
                    
                    {/* NEXT button */}
                    <Animated.View  
                        style={[
                            styles.nextButtonContainer,
                            {
                            backgroundColor: buttonAnimation.interpolate({
                                inputRange: [0, 1],
                                outputRange: ['#9ca3af', '#10b981'], // grey to green
                            }),
                            transform: [{
                                scale: buttonAnimation.interpolate({
                                inputRange: [0, 1],
                                outputRange: [1, 1.05],
                                })
                            }]
                            }
                        ]}
                        pointerEvents="box-none"
                        >
                        <TouchableOpacity 
                            style={styles.nextButton}
                            // onPress={handleNext}
                            disabled={!isHighlighted}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.nextButtonText}>NEXT</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </ScrollView>
        </SafeAreaView>
    )
}

// Handle when create a new profile
const handleCreateProfile = () => {

}
const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#667eea', // Matching web gradient
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        flexGrow: 1,
        maxWidth: 720,
        alignSelf: 'center',
        width: '100%',
        paddingHorizontal: 32,
        paddingVertical: 32,
    },
    loadingText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '500',
    },

    // Header - Exact Web Match
    header: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 20,
        padding: 24,
        marginBottom: 32,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 32,
        elevation: 8,
    },
    title: {
        fontSize: 30, // 1.875rem in web
        fontWeight: '700',
        color: 'white',
        textShadowColor: 'rgba(0, 0, 0, 0.1)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    subtitle: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 14, // 0.875rem in web
        marginTop: 4,
        fontWeight: '400',
    },

    // Profile Gate Card - Exact Web Match
    profileCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 20,
        padding: 32,
        marginBottom: 32,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 40,
        elevation: 10,
        alignItems: 'center',
    },
    profileCardTitle: {
        fontSize: 40, // 2.5rem in web
        fontWeight: '700',
        color: '#2d3748',
        marginBottom: 8,
        textAlign: 'center',
    },

    // Main Card - Exact Web Match
    card: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 20,
        padding: 24,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 40,
        elevation: 10,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        flexWrap: 'wrap',
        gap: 12,
    },
    cardTitle: {
        fontSize: 20, // 1.25rem in web
        fontWeight: '600',
        color: '#2d3748',
    },
    createRow: {
        flexDirection: 'row',
        gap: 12,
        alignItems: 'center',
    },
    input: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        fontSize: 14,
        color: '#2d3748',
        borderWidth: 1,
        borderColor: 'rgba(102, 126, 234, 0.2)',
        minWidth: 120,
        flex: 1,
    },
    createButton: {
        backgroundColor: '#48bb78',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    createButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },

    // Error Banner - Exact Web Match
    banner: {
        backgroundColor: '#fed7d7',
        borderRadius: 8,
        padding: 12,
        marginTop: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#fca5a5',
    },
    bannerText: {
        color: '#c53030',
        fontSize: 14,
        fontWeight: '500',
        textAlign: 'center',
    },

    // Empty State - Exact Web Match
    emptyState: {
        alignItems: 'center',
        paddingVertical: 32,
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: 16,
    },
    emptyText: {
        color: '#a0aec0',
        fontSize: 16,
        textAlign: 'center',
    },

    // Profiles Grid - Exact Web Match
    profilesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 16,
        marginTop: 16,
    },
    profileItem: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 40,
        elevation: 10,
        width: width > 400 ? '48%' : '100%',
        minWidth: 200,
        minHeight: 200,
    },
    profileItemHighlighted: {
        borderColor: '#667eea',
        borderWidth: 3,
        backgroundColor: 'rgba(102, 126, 234, 0.2)',
        transform: [{ translateY: -4 }, { scale: 1.02 }],
        shadowColor: '#667eea',
        shadowOpacity: 0.3,
    },
    profileIcon: {
        fontSize: 32,
        marginBottom: 8,
    },
    profileName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2d3748',
        marginBottom: 8,
        textAlign: 'center',
    },
    profileNameHighlighted: {
        color: '#667eea',
    },

    deleteButton: {
        backgroundColor: '#e53e3e',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 8,
    },
    deleteButtonText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
    },

    // Next Button - Simple and Clean
    nextButtonContainer: {
        borderRadius: 16,
        marginTop: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 8,
    },
    nextButton: {
        paddingVertical: 16,
        paddingHorizontal: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    nextButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '700',
        letterSpacing: 1,
    },

    // Admin Profile Styles
    adminProfileItem: {
        borderColor: '#e53e3e', // Red border for admin
        backgroundColor: 'rgba(229, 62, 62, 0.1)',
    },
    adminProfileName: {
        color: '#e53e3e',
        fontWeight: '700',
    },
    adminBadge: {
        backgroundColor: '#e53e3e',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    adminBadgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: '700',
        textAlign: 'center',
    },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 24,
        margin: 32,
        maxWidth: 400,
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 20,
    },
    modalHeader: {
        alignItems: 'center',
        marginBottom: 20,
    },
    modalIcon: {
        fontSize: 48,
        marginBottom: 8,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#2d3748',
        textAlign: 'center',
    },
    modalMessage: {
        fontSize: 16,
        color: '#4a5568',
        textAlign: 'center',
        marginBottom: 8,
        lineHeight: 24,
    },
    modalSubMessage: {
        fontSize: 14,
        color: '#718096',
        textAlign: 'center',
        marginBottom: 24,
        fontStyle: 'italic',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    modalCancelButton: {
        flex: 1,
        backgroundColor: '#e2e8f0',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
        alignItems: 'center',
    },
    modalCancelText: {
        color: '#4a5568',
        fontSize: 16,
        fontWeight: '600',
    },
    modalDeleteButton: {
        flex: 1,
        backgroundColor: '#e53e3e',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
        alignItems: 'center',
    },
    modalDeleteText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    });



