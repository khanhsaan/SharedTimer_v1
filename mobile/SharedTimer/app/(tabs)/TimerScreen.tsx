import { Text } from "@react-navigation/elements";
import { Modal, StyleSheet, TouchableOpacity } from "react-native";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { ProfileBar } from "@/components/ProfilesBar";
import { useProfiles } from "../hooks/useProfiles";
import { useEffect, useState } from "react";
import { useTimer } from "../hooks/useTimer";
import { washingModes } from "@/components/washingModes";
import { appliances } from "@/components/appliances";

// Create an array type to make sure the consistence
interface Profiles {
  id: string,
  name: string,
  created_at: string;
}

export function TimerScreen({user, selectedProfileID}: {user: any, selectedProfileID: string}) {

    const passedUser = {
        userEmail: "",
        userPassword: "",
        userConfirmPassword: "",
    }
    const {signOutHandle} = useAuth({userEmail: passedUser.userEmail, userPassword: passedUser.userPassword, userConfirmPassword: passedUser.userConfirmPassword});
    const {retrieveProfiles} = useProfiles();
    const[profilesArr, setProfilesArr] = useState<Profiles[]>([]);
    const[showWashingMode, setShowWashingModes] = useState<boolean>(false);
    const[expanded, setExpanded] = useState<string | null>(null);

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

    

    
  
    // useTimers hook
    const {
      remaining,
      // minutes,
      // seconds,
      running,
      start,
      pause,
      reset,
      update
    } = useTimer()

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollContainer}>
                {/* HEADER */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.title}>Household Timers</Text>
                        <Text style={styles.subtitle}>Welcome, {user.email}</Text>
                    </View>
                    {/* Sign out button */}
                    <TouchableOpacity style={styles.signOutButton}>
                        <Text style={styles.signOutText}
                        onPress={signOutHandle}>Sign Out</Text>
                    </TouchableOpacity>
                </View>
                {/* Display the information of selected profile */}
                <ProfileBar profilesArr={profilesArr} selectedProfileID={selectedProfileID}></ProfileBar>
                
                <View style={styles.grid}>
                  {appliances.map((a) => (
                    <View key={a.id} style={[styles.card, { borderLeftWidth: 4, borderLeftColor: a.color}]}>
                      {/* For every appliance, display the corresponding UI */}
                      {/* WASHING MACHINE */}
                      {a.id === 'washingMachine' && (
                          <View style={styles.cardHeader}>
                            {/* Choose mode button */}
                            {/* If the user presses on Choose mode button, show UI of washing modes*/}
                            <TouchableOpacity style={styles.purpleButton} onPress={() => setShowWashingModes(true)}>
                              <Text style={styles.buttonText}>Choose Mode</Text>
                            </TouchableOpacity>
                          </View>
                        )
                      }
                      
                      {/* TIMER SECTION */}
                      <View style={styles.timerSection}>
                        <View style={styles.timerDisplay}>
                          <Text style={styles.timerLabel}>Current Timer</Text>
                          <Text style={styles.timerValue}>00</Text>
                        </View>
                      </View>

                      {/* START AND FINISH TIME */}
                      
                      {/* START UI */}
                      <View style={styles.hoursDisplay}>
                        <View style={[
                          styles.hourItem,
                          {
                            borderColor: `${a.color}40`,
                            backgroundColor: `${a.color}15`
                          }
                        ]}>
                          <Text style={[
                            styles.hourLabel,
                            {color: a.color}
                          ]}>Started</Text>
                          <Text style={[
                            styles.hourValue,
                            {color: "#2d3748"}
                          ]}>00</Text>
                        </View>
                      </View>
                      
                      {/* FINISH UI */}
                      <View style={[
                        styles.hourItem,
                        {
                          borderColor: `${a.color}40`,
                          backgroundColor: `${a.color}15`
                        }
                      ]}>
                        <Text style={[
                          styles.hourLabel,
                          { color: a.color}
                        ]}>Finish</Text>
                        <Text style={[
                          styles.hourValue,
                          {
                            color: '#2d3748'
                          }
                        ]}>
                          00
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
                
                {/* If the user presses on washing mode button, display the UI */}
                {showWashingMode && (
                    <Modal
                      visible={true}
                      transparent={true}
                      animationType="fade"
                      onRequestClose={() => setShowWashingModes(false)}>
                      
                      <TouchableOpacity
                        style={styles.modalBg}
                        activeOpacity={1}
                        // If the use press the other part of the UI, close the UI
                        onPress={() => setShowWashingModes(false)}>

                          {/* Display the modal of washing modes */}
                          <View style={styles.modal}>
                              <View style={styles.modalHeader}>
                                {/* UI title */}
                                <Text style={styles.modalTitle}>Select Washing Mode</Text>
                                {/* Close UI button */}
                                <TouchableOpacity onPress={() => setShowWashingModes(false)}>
                                  <Text style={styles.modalClose}>Close</Text>
                                </TouchableOpacity>
                              </View>

                              {/* Scroll view of the washing modes */}
                              <ScrollView style={styles.modalScroll}>
                                {/* For every entry of the washing modes array */}
                                {Object.entries(washingModes).map(([group, options]) => (
                                  <View key={group} style={styles.modeGroup}>
                                    {/* If the user presses on a mode, expand its corresponding options, close the expand if the user presses again */}
                                    <TouchableOpacity style={styles.modeTitle}
                                      onPress={() => setExpanded(expanded === group ? null: group)}>
                                        {/* Display the title of each mode */}
                                        <Text style={styles.modeTitleText}>{group}</Text>
                                    </TouchableOpacity>

                                    {/* If user expands a mode */}
                                    {expanded === group && (
                                      <View style={styles.options}>
                                        {/* For every entry of the modes group's option */}
                                        {options.map((opt) => (
                                          <TouchableOpacity key={`${group}-${opt.label}`}
                                            style={styles.option}
                                            onPress={() => {
                                              
                                            }}>

                                          </TouchableOpacity>
                                        ))}
                                      </View>
                                    )}
                                  </View>
                                ))}
                              </ScrollView>
                          </View>
                      </TouchableOpacity>
                    </Modal>
                )}
            </ScrollView>
        </SafeAreaView>
    )

    
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#667eea', // Purple gradient background like web
    },
    loadingContainer: {
      flex: 1,
      backgroundColor: '#667eea', // Purple background for loading
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      color: 'white',
      fontSize: 16,
    },
    scrollContainer: {
      flex: 1,
      maxWidth: 1200, // Max width like web
      alignSelf: 'center',
      width: '100%',
      paddingHorizontal: 32, // Web container padding
    },
    header: {
      backgroundColor: 'rgba(255, 255, 255, 0.15)', // Glassmorphism like web
      borderRadius: 20,
      padding: 24,
      marginBottom: 32,
      marginTop: 32,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.2)',
      // Shadow effects
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.1,
      shadowRadius: 32,
      elevation: 8,
    },
    title: {
      fontSize: 30, // Matching web h2 size
      fontWeight: '700',
      color: 'white',
      textShadowColor: 'rgba(0, 0, 0, 0.1)',
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 4,
    },
    subtitle: {
      color: 'rgba(255, 255, 255, 0.8)',
      fontSize: 14,
      marginTop: 4,
      fontWeight: '400',
    },
    signOutButton: {
      backgroundColor: '#e53e3e', // Red danger button like web
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    signOutText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
    },
    profilesCard: {
      backgroundColor: 'rgba(255, 255, 255, 0.95)', // White card like web
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
    profilesHeaderCenter: {
      alignItems: 'center',
      marginBottom: 16,
    },
    profilesTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: '#2d3748',
    },
    profilesSubtitle: {
      fontSize: 14,
      color: '#718096',
    },
    activeProfileDisplay: {
      alignItems: 'center',
      paddingVertical: 8,
    },
    activeProfileBadge: {
      backgroundColor: '#48bb78', // Green for active profile
      borderRadius: 20,
      paddingHorizontal: 20,
      paddingVertical: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    activeProfileText: {
      color: 'white',
      fontSize: 18,
      fontWeight: '700',
    },
    activeProfileHint: {
      color: '#718096',
      fontSize: 12,
      marginTop: 8,
      textAlign: 'center',
      fontStyle: 'italic',
    },
    adminProfileBadge: {
      backgroundColor: '#e53e3e', // Red for admin
    },
    adminIndicator: {
      backgroundColor: 'rgba(229, 62, 62, 0.2)',
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 4,
      marginTop: 4,
      borderWidth: 1,
      borderColor: '#e53e3e',
    },
    adminIndicatorText: {
      color: '#e53e3e',
      fontSize: 10,
      fontWeight: '700',
      textAlign: 'center',
    },
  
    // Grid Layout - Fixed and Improved
    grid: {
      paddingHorizontal: 16,
      paddingBottom: 20,
    },
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
      alignItems: 'flex-end',
      marginBottom: 16,
      gap: 12,
    },
    purpleButton: {
      backgroundColor: '#9f7aea',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    buttonText: {
      color: 'white',
      fontSize: 14,
      fontWeight: '600',
    },
  
    // Appliance Info - Improved Spacing
    cardTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 24,
    },
    applianceInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      flex: 1,
    },
    icon: {
      fontSize: 32,
    },
    applianceTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: '#2d3748',
      flex: 1,
    },
    statusRow: {
      flexDirection: 'column',
      alignItems: 'flex-end',
      gap: 8,
    },
    lockStatus: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      maxWidth: 160,
    },
    lockText: {
      fontSize: 11,
      fontWeight: '600',
      textAlign: 'center',
    },
    connectionDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      alignSelf: 'center',
    },
    dotOk: {
      backgroundColor: '#48bb78',
    },
    dotBad: {
      backgroundColor: '#e53e3e',
    },
  
    // Timer Section - Improved Layout
    timerSection: {
      alignItems: 'center',
      marginBottom: 20,
    },
    timerDisplay: {
      alignItems: 'center',
      marginBottom: 20,
    },
    timerLabel: {
      fontSize: 14,
      color: '#718096',
      marginBottom: 8,
      textAlign: 'center',
    },
    timerValue: {
      fontSize: 48,
      fontWeight: '700',
      color: '#2d3748',
      fontFamily: 'monospace',
      textAlign: 'center',
    },
    hoursDisplay: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 16,
      paddingHorizontal: 16,
      gap: 12,
    },
    hourItem: {
      flex: 1,
      alignItems: 'center',
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderWidth: 1,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    hourLabel: {
      fontSize: 13,
      marginBottom: 6,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    hourValue: {
      color: '#2d3748',
      fontSize: 18,
      fontWeight: 'bold',
      fontFamily: 'monospace',
    },
    
    // Controls Section - Much Better Layout
    controlsSection: {
      width: '100%',
    },
    controlsRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 12,
      marginBottom: 12,
    },
    controlButton: {
      backgroundColor: '#667eea',
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 12,
      minWidth: 80,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    controlButtonDisabled: {
      opacity: 0.4,
      backgroundColor: '#a0aec0',
    },
    controlButtonText: {
      fontSize: 14,
      fontWeight: '600',
      textAlign: 'center',
    },
    whiteText: {
      color: 'white',
    },
    successButton: {
      backgroundColor: '#48bb78',
    },
    warnButton: {
      backgroundColor: '#ed8936',
    },
    dangerButton: {
      backgroundColor: '#e53e3e',
    },
  
    // Modal Styles - Exact Web Match
    modalBg: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    modal: {
      backgroundColor: 'rgba(255, 255, 255, 0.98)',
      borderRadius: 20,
      padding: 24,
      maxWidth: 500,
      width: '100%',
      maxHeight: '80%',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 20 },
      shadowOpacity: 0.25,
      shadowRadius: 50,
      elevation: 25,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    modalTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: '#2d3748',
    },
    modalClose: {
      color: '#667eea',
      fontSize: 16,
      fontWeight: '600',
    },
    modalScroll: {
      maxHeight: 400,
    },
    modeGroup: {
      marginBottom: 16,
    },
    modeTitle: {
      backgroundColor: '#f7fafc',
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: '#e2e8f0',
    },
    modeTitleText: {
      fontSize: 18,
      fontWeight: '600',
      color: '#2d3748',
    },
    options: {
      paddingTop: 8,
    },
    option: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      marginVertical: 2,
      backgroundColor: '#ffffff',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#e2e8f0',
    },
    optionText: {
      fontSize: 16,
      fontWeight: '500',
      color: '#2d3748',
    },
    optionTime: {
      fontSize: 14,
      color: '#718096',
    },
  
    // Selected Washing Mode Styles
    selectedModeContainer: {
      alignItems: 'flex-end',
    },
    selectedModeLabel: {
      fontSize: 12,
      color: '#718096',
      marginBottom: 4,
      fontWeight: '500',
    },
    selectedModeBadge: {
      backgroundColor: 'rgba(159, 122, 234, 0.15)',
      borderWidth: 1,
      borderColor: '#9f7aea',
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 8,
      alignItems: 'center',
    },
    selectedModeText: {
      fontSize: 14,
      fontWeight: '600',
      color: '#9f7aea',
      textAlign: 'center',
    },
    selectedModeTime: {
      fontSize: 12,
      color: '#9f7aea',
      fontWeight: '500',
      marginTop: 2,
    },
  
  });