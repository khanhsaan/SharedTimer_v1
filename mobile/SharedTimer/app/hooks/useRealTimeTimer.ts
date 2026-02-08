import { appliances } from "@/components/appliances";
import { supabase } from "@/lib/supabase";
import { useCallback, useEffect, useRef, useState } from "react"
import useProfiles from "./useProfiles";
import { ResponseType } from "../types";
import useAuthContext from "./useAuthContext";

export const useRealTimeTimer = (profileID: string, userID: string) => {
    const [error, setError] = useState<Error | null>(null);

    const {
        getProfileName
    } = useProfiles();
    
    // intialise running state to be all false
    const [runningState, setRunningState] = useState<{id: string, name: string, running: boolean}[]>(
        appliances.map((a) => ({
            id: a.id,
            name: a.name,
            running: false,
        }))
    );

    // intialise running remaining time to be all 0
    const [remainingState, setRemainingState] = useState<{id: string, remaining: number}[]>(
        /**
         * - Set and store remaining time in seconds
         */
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

    const [baseTimerState, setBaseTimerState] = useState<{id: string, baseTimer: number}[]>(
        appliances.map((a) => ({
            id: a.id,
            baseTimer: 0
        }))
    )

    
    const intervalsRef = useRef<Record<string, number>>({});

    const clearError = useCallback(() => {
        setError(null);
    }, [])

    const calculateRemaining = (startedAt: number, baseTimer: number) => {
        /** - Recieves start and base time in seconds
         * - Calculate the remaining time in seconds and return
        */
        const now = Date.now();

        const elapse = ((now / 1000) - startedAt);

        const remaining = Math.max(baseTimer - elapse, 0);

        return remaining;
    }
    
    const setTimerValue = useCallback((applianceID: string, valueSec: number) => {
        const now = new Date();

        setRemainingState(prev =>
            prev.map(a =>
                a.id === applianceID?
                {...a, remaining: valueSec}:
                a
            )
        );

        setBaseTimerState(prev =>
            prev.map((a) => 
                applianceID === a.id ?
                {...a, baseTimer: valueSec} :
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

        const finishedAt = new Date(now.getTime() + valueSec * 1000);
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

    const setStartFinishHourTimer = async(userID: string, applianceName: string, startHour: string, finishHour: string): Promise<ResponseType> => {

        const response = await supabase
            .from('appliances')
            .update({'start_hour': startHour, 'finish_hour': finishHour})
            .eq('user_id', userID)
            .eq('name', applianceName)
            .select();

        if(response.error){
            return {
                data: null,
                error: new Error(`Error while trying to set start & finish hour: ${error?.message}`)
            }
        }

        if(!response.data){
            console.log(`Returned data is UNAVAILABLE`);
            return {
                data: null,
                error: new Error(`Returned data is UNAVAILABLE`)
            }
        }

        return {
            data: response.data,
            error: null
        }

    }

    const lockTimerByProfileName = async(profileName: string, applianceName: string, userID: string): Promise<ResponseType> => {
        if(!profileName){
            return {
                data: null,
                error: new Error('Profile name is required')
            }
        }

        const {data, error} = await supabase
            .from('appliances')
            .update({'locked_by': profileName})
            .eq('user_id', userID)
            .eq('name', applianceName)
            .select();


        if(error){
            console.log(`Failed to lock appliance: ${error.message}`);
            return {
                data: null,
                error: new Error(`Failed to lock appliance: ${error.message}`)
            }
        }

        if(!data){
            console.log(`Returned data is UNAVAILABLE`);
            return {
                data: null,
                error: new Error(`Returned data is UNAVAILABLE`)
            }
        }

        return {
            data: data,
            error: null,
        }
    }
    
    const startTimer = useCallback(async(applianceID: string) => {        
        // check if appliance exists first
        const applianceFound = runningState.find(a => a.id === applianceID);

        const baseTimer = baseTimerState.find(a => a.id === applianceID)?.baseTimer;
        
        if(!applianceFound){
            setError(new Error(`Cannot find appliance id`));
            return;
        }

        if(baseTimer === undefined || baseTimer === null){
            setError(new Error(`Base timer for appliance ${applianceID} is null`));
            return;
        }
        const applianceName = applianceFound.name;

        const response = await getProfileName(profileID, userID);

        if(response.data && response.error){
            setError(new Error(`Error while fetching profile name: ${response.error}`));
        return;
        }

        const profileName = response.data;

        const{data, error} = await lockTimerByProfileName(profileName, applianceName, userID);

        if(error){
            setError(error);
            return;
        }
        if(!data){
            setError(new Error(`Returned data is UNAVAILABLE`));
            return;
        }

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

            setRemainingState(prev =>
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

        clearError();
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
    
    const incrementTimer = useCallback((applianceID: string, valueSec: number) => {
        // if appliance is running set to stop
        const isRunning = runningState.find(a => a.id === applianceID)?.running;

        if(isRunning){
            pauseTimer(applianceID);
        }

        const currentRemaining = remainingState.find(a => a.id === applianceID)?.remaining;

        if(currentRemaining == null || currentRemaining === undefined){
            setError(new Error(`CANNOT find remaining time for appliance: ${applianceID}`));
            console.error(`CANNOT find remaining time for appliance: ${applianceID}`);
            return;
        }

        const newRemaining = Math.max(currentRemaining + valueSec, 0);

        setBaseTimerState(prev =>
            prev.map(a =>
                a.id === applianceID?
                {...a, baseTimer: Math.max(a.baseTimer + (valueSec), 0)}:
                a
            )
        );

        // Update to UI
        setRemainingState(prev =>
            prev.map(a =>
                a.id === applianceID?
                {...a, remaining: newRemaining}:
                a
            )
        );


        const now = new Date();

        const start_hour = now.getHours();
        const start_min = now.getMinutes();

        setStartHour(prev =>
            prev.map(a => a.id === applianceID ?
                {...a, startHour: `${start_hour}:${start_min}`}:
                a
            )
        )

        const finishedAt = new Date(now.getTime() + newRemaining * 1000);
        const finish_hour = finishedAt.getHours();
        const finish_min = finishedAt.getMinutes();
        
        setFinishHour(prev =>
            prev.map((a) =>
                a.id === applianceID ?
                {...a, finishHour: `${finish_hour}:${finish_min}`}:
                a
            )
        );
    }, [runningState, remainingState, baseTimerState, startHour, finishHour]);

    const decrementTimer = useCallback((applianceID: string, valueSec: number) => {
        // if appliance is running set to stop
        const isRunning = runningState.find(a => a.id === applianceID)?.running;

        if(isRunning){
            pauseTimer(applianceID);
        }

        const currentRemaining = remainingState.find(a => a.id === applianceID)?.remaining;

        if(currentRemaining == null || currentRemaining === undefined){
            setError(new Error(`CANNOT find remaining time for appliance: ${applianceID}`));
            console.error(`CANNOT find remaining time for appliance: ${applianceID}`);
            return;
        }

        const newRemaining = Math.max(currentRemaining - valueSec, 0);

        setBaseTimerState(prev =>
            prev.map(a =>
                a.id === applianceID?
                {...a, baseTimer: Math.max(a.baseTimer - valueSec, 0)}:
                a
            )
        );

        // Update to UI
        setRemainingState(prev =>
            prev.map(a =>
                a.id === applianceID?
                {...a, remaining: newRemaining}:
                a
            )
        );

        const now = new Date();

        const start_hour = now.getHours();
        const start_min = now.getMinutes();

        setStartHour(prev =>
            prev.map(a => a.id === applianceID ?
                {...a, startHour: `${start_hour}:${start_min}`}:
                a
            )
        )

        const finishedAt = new Date(now.getTime() + newRemaining * 1000);
        const finish_hour = finishedAt.getHours();
        const finish_min = finishedAt.getMinutes();
        
        setFinishHour(prev =>
            prev.map((a) =>
                a.id === applianceID ?
                {...a, finishHour: `${finish_hour}:${finish_min}`}:
                a
            )
        );
    }, [runningState, baseTimerState, remainingState]);

    return {
        running: runningState,
        remaining: remainingState,
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