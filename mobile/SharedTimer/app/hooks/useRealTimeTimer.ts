import { appliances } from "@/components/appliances";
import { supabase } from "@/lib/supabase";
import { useCallback, useEffect, useRef, useState } from "react"
import useProfiles from "./useProfiles";

interface Response {
    data: any,
    error: any,
}

export const useRealTimeTimer = (profileID: string, userID: string) => {
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if(profileID === null || userID === null){
            setError(new Error(`profileID & userID must NOT be NULL`));
        } else {
            clearError();
        }
    }, [profileID, userID]);

    const {
        getProfileName
    } = useProfiles();
    
    // intialise running state to be all false
    const [runningState, setRunningState] = useState<{id: string, running: boolean}[]>(
        appliances.map((a) => ({
            id: a.id,
            running: false,
        }))
    );

    // intialise running remaining time to be all 0
    const [remaining, setRemaining] = useState<{id: string, remaining: number}[]>(
        appliances.map((a) => ({
            id: a.id,
            remaining: 0,
        }))
    );

    // intialise start hour to be all 0
    const [startHour, setStartHour] = useState<{id: string, startHour: string}[]>(
        appliances.map((a) => ({
            id: a.id,
            startHour: '',
        }))
    );

    // intialise finish hour to be all 0
    const [finishHour, setFinishHour] = useState<{id: string, finishHour: string}[]>(
        appliances.map((a) => ({
            id: a.id,
            finishHour: ''
        }))
    );

    const [baseTimerState, setBaseTimerState] = useState<{id: string, baseTimerState: number}[]>(
        appliances.map((a) => ({
            id: a.id,
            baseTimerState: 0
        }))
    )

    
    const intervalsRef = useRef<Record<string, number>>({});

    const clearError = useCallback(() => {
        setError(null);
    }, [])

    const calculateRemaining = (startedAt: number, baseTimer: number) => {
        const now = Date.now();

        const elapse = ((now / 1000) - startedAt);

        const remaining = Math.max(baseTimer - elapse, 0);

        return remaining;
    }
    
    const setTimerValue = useCallback((applianceID: string, value: number) => {
        const now = new Date();

        setRemaining(prev =>
            prev.map(a =>
                a.id === applianceID?
                {...a, remaining: value}:
                a
            )
        );

        setBaseTimerState(prev =>
            prev.map((a) => 
                applianceID === a.id ?
                {...a, baseTimerState: value} :
                a
            )
        );

        const start_hour = now.getHours();
        const start_min = now.getMinutes();

        setStartHour(prev =>
            prev.map(a => a.id === applianceID ?
                {...a, startHour: `${start_hour}:${start_min}`}:
                a
            )
        )

        const finishedAt = new Date(now.getTime() + value * 60 * 1000);
        const finish_hour = finishedAt.getHours();
        const finish_min = finishedAt.getMinutes();
        
        setFinishHour(prev =>
            prev.map((a) =>
                a.id === applianceID ?
                {...a, finishHour: `${finish_hour}:${finish_min}`}:
                a
            )
        );
    }, []);

    const lockTimerByProfileName = async(profileName: string, profileID: string, userID: string): Promise<Response> => {
        if(!profileName){
            return {
                data: null,
                error: 'Profile name is required'
            }
        }
        const {data, error} = await supabase
            .from('appliances')
            .update({'locked_by': profileName})
            .eq('user_id', userID)
            .eq('id', profileID)
            .select();

        if(error){
            return {
                data: null,
                error: `Failed to lock appliance: ${error.message}`
            }
        }

        if(!data){
            return {
                data: null,
                error: `Returned data is null`
            }
        }

        return {
            data: data,
            error: null,
        }
    }
    
    const startTimer = useCallback(async(applianceID: string) => {        
        // check if appliance exists first
        const applianceFound = runningState.some(a => a.id === applianceID);

        const baseTimer = baseTimerState.find(a => a.id === applianceID)?.baseTimerState;
        
        if(!applianceFound){
            setError(new Error(`Cannot find appliance id`));
            return;
        }

        if(baseTimer === undefined || baseTimer === null){
            setError(new Error(`Base timer for appliance ${applianceID} is null`));
            return;
        }

        const response = await getProfileName(profileID, userID);

        if(response.data && response.error){
            setError(new Error(`Error while fetching profile name: ${response.error}`));
            return;
        }

        const profileName = response.data;

        lockTimerByProfileName(profileName, profileID, userID);
        
        // set dappliance running state to TRUE
        setRunningState(prev => {
            return prev.map((a) => {
                if(a.id === applianceID) {
                    return {...a, running: true};
                }
                return a;
            })    
        }
        );
        const startedAtSec = Date.now() / 1000;

        const intervalID = setInterval(() => {
            let remainingTime = calculateRemaining(startedAtSec, baseTimer);
            console.log('Remaining: ', remainingTime);

            setRemaining(prev =>
                prev.map((a) =>
                    a.id === applianceID ?
                    {...a, remaining: Math.round(remainingTime)} :
                    a
                )
            );

            if(remainingTime === 0) {
                // set appliance running state to FALSE
                setRunningState(prev => 
                    prev.map(a =>
                        a.id === applianceID ?
                        {...a, running: false} :
                        a
                    )
                );

                const intervalID = intervalsRef.current[applianceID];
                clearInterval(intervalID); // clear interval
                delete intervalsRef.current[applianceID]; // delete interval id

                return;
            };
        }, 1000); // update every 1 sec

        intervalsRef.current[applianceID] = intervalID; // store interval ID
    }, [runningState, baseTimerState]);


    // clear all intervals on mount
    useEffect(() => {
        return () => {
            // clear all intervals
            Object.values(intervalsRef.current).forEach(intervalID => clearInterval(intervalID));
            // reset intervalsRef
            intervalsRef.current = {};
        }
    }, []);

    const pauseTimer = useCallback((applianceID: string) => {
        setRunningState(prev => 
            prev.map((a) =>
                a.id === applianceID ?
                {...a, running: false}:
                a
            )
        );
        const intervalID = intervalsRef.current[applianceID];
        if(intervalID) clearInterval(intervalID); // clear interval
        delete intervalsRef.current[applianceID]; // remove interval ID
    }, []);
    
    const incrementTimer = useCallback((applianceID: string, value: number) => {
        // if appliance is running set to stop
        const isRunning = runningState.find(a => a.id === applianceID)?.running;
        if(isRunning){
            pauseTimer(applianceID);
        }

        setBaseTimerState(prev =>
            prev.map(a =>
                a.id === applianceID?
                {...a, baseTimerState: Math.max(a.baseTimerState + value, 0)}:
                a
            )
        );

        // Update to UI
        setRemaining(prev =>
            prev.map(a =>
                a.id === applianceID?
                {...a, remaining: a.remaining + value}:
                a
            )
        );
    }, [runningState]);

    const decrementTimer = useCallback((applianceID: string, value: number) => {
        // if appliance is running set to stop
        const isRunning = runningState.find(a => a.id === applianceID)?.running;
        if(isRunning){
            pauseTimer(applianceID);
        }

        setBaseTimerState(prev =>
            prev.map(a =>
                a.id === applianceID?
                {...a, baseTimerState: Math.max(a.baseTimerState - value, 0)}:
                a
            )
        );

        // Update to UI
        setRemaining(prev =>
            prev.map(a =>
                a.id === applianceID?
                {...a, remaining: Math.max(a.remaining - value, 0)}:
                a
            )
        );
    }, [runningState]);

    return {
        running: runningState,
        remaining,
        startHour,
        finishHour,
        startTimer,
        pauseTimer,
        setTimerValue,
        incrementTimer,
        decrementTimer,
        error,
    }
}

export default useRealTimeTimer;