import { Button, Text } from "@react-navigation/elements";
import { Modal, StyleSheet, TouchableOpacity } from "react-native";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../hooks/useAuth";
import { ProfileBar } from "@/components/ProfilesBar";
import { useProfiles } from "../hooks/useProfiles";
import { useEffect, useState } from "react";
import { washingModes } from "@/components/washingModes";
import { appliances } from "@/components/appliances";
import useRealTimeTimer from "../hooks/useRealTimeTimer";
import styles from "./TimerScreen.styles";

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

    // Format timer
    const formatTimer= (seconds: number) => {
      let h = Math.floor(seconds / (60 * 60));
      let m = Math.floor(seconds % (60 * 60) / 60);
      let s = Math.floor(seconds % 60);

      if (h > 0){
        return `${h}h ${m}m`;
      }
      return `${m}m ${s}`;
    }

    const {
      setTimerValue,
      running: storeRunning,
      remaining: storeRemaining,
      startTimer,
      pauseTimer,
      startHour,
      finishHour,
    } = useRealTimeTimer();

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

                      {/* APPLIANCE ICONS & NAMES */}
                      <View style={styles.cardTop}>
                        <View style={styles.applianceInfo}>
                          <Text style={styles.icon}>{a.icon}</Text>
                          <Text style={styles.applianceTitle}>{a.name}</Text>
                        </View>
                      </View>
                      
                      {/* TIMER SECTION */}
                      <View style={styles.timerSection}>
                        <View style={styles.timerDisplay}>
                          <Text style={styles.timerLabel}>Current Timer</Text>
                          <View style={styles.timerControlRow}>
                            <Button style={styles.timerControlButton}>
                              -
                            </Button>
                            <Text style={styles.timerValue}>
                              {/* Display the corresponding current timer */}
                              {formatTimer(storeRemaining.find(timer => timer.id === a.id)?.remaining || 0)}
                            </Text>
                            <Button>
                              +
                            </Button>
                          </View>
                          
                        </View>
                      </View>
                     

                      {/* START AND FINISH TIME */}
                      <View style={styles.hoursDisplay}>
                        {/* START UI */}
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
                          ]}>
                            {startHour.find(h => h.id === a.id)?.startHour || `--`}
                            </Text>
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
                            {finishHour.find(h => h.id === a.id)?.finishHour || `--`}
                          </Text>
                        </View>
                      </View>

                        {/* START & RESET BUTTONS */}
                      <View style={styles.controlsRow}>
                        {/* Display START / PAUSE buttons depend on appliance running state */}
                        {storeRunning.find(o => o.id === a.id)?.running ? (
                          <TouchableOpacity style={[styles.controlButton, styles.warnButton]}
                            onPress={() => pauseTimer(a.id)}>
                              <Text style={[styles.controlButtonText, styles.whiteText]}>Pause</Text>
                          </TouchableOpacity>
                        ) : (
                          <TouchableOpacity style={[styles.controlButton , styles.successButton]}
                            onPress={() => startTimer(a.id)}>
                              <Text style={[styles.controlButtonText, styles.whiteText]}>Start</Text>
                          </TouchableOpacity>
                        )}
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
                                              // Pass the timer value to useTimers hook
                                              setTimerValue('washingMachine', opt.minutes);
                                              // Close the washing mode window
                                              setShowWashingModes(false);
                                            }}>
                                              <Text style={styles.optionText}>{opt.label}</Text>
                                              <Text style={styles.optionTime}>{opt.minutes} mins</Text>
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

export default TimerScreen;