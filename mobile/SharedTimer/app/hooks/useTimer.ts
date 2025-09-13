import { useCallback, useEffect, useRef, useState } from "react";
import { appliances } from "@/components/appliances";
import { store } from "expo-router/build/global-state/router-store";
export function useTimer(){
    // Initial minutes
    const[initialMinutes, setInitialMinutes] = useState<number>(0);
    // Seconds left
    const[remaining, setRemaining] = useState(initialMinutes);
    // Is it counting down?
    const[running, setRunning] = useState(false);
    const intervalRef = useRef<number | null>(null);

    // Derived values
    const minutes = Math.floor(remaining / 60);

    // Remain seconds
    const seconds = remaining % 60;

    // Store the passed appliances timer value
    
    // Initialize storeTimer to store the name of each appliance with the initial timer of 0
    const[storeTimer, setStoreTimer] = useState<{id: string, time: number}[]>(() => 
        appliances.map((a) => ({id: a.id, time: 0 }))
    );

    // Intialise storeRunning to store the running state of each appliance with the initial state of false
    const[storeRunning, setStoreRunning] = useState<{id: string, running: boolean}[]>(() =>
        appliances.map((a) => ({id: a.id, running: false}))
    );

    // Set the timer value
    const setTimerValue = (passedId: string, initialMinutes: any) => {
        // Look up the passed Id from the latest value of the array and set the initial minutes, if cannot find keep it the same
        setStoreTimer(prev => prev.map(a => a.id === passedId ? {...a, time: initialMinutes} : a))
    }

    // Set the running state
    const setRunningState = (passedId: string, passedRunning: boolean) => {
        // Look up the passed Id from the latest value of the array and set the running state, if cannot find keep it the same
        setStoreRunning(prev => prev.map(a => a.id === passedId ? {...a, running: passedRunning}: a))
    }

    // Initialise storeTimer and storeRunnig with the initial values as 0 & false
    useEffect(() => {

        // DEBUG
        console.log("storeTimer: ", storeTimer);
        console.log("storeRunning: ", storeRunning);
    }, [storeTimer, storeRunning])

    // Start the timer
    // useCallback(): Reuse the const with the latest values of remaining, running
    const start = useCallback((passedId: string) => {
        const appliance = storeTimer.find(a => a.id === passedId);

        if(appliance && appliance.time > 0 && !running){
            setRunning(true);
            setRemaining(appliance.time);
            console.log(`START button clicked! \nRunning: ${running}\nRemaining: ${remaining}`);
        } else if(!appliance){
            console.error(`Passed apppliance NOT FOUND!`);
        }
    }, [remaining, running])

    // Pause the timer
    const pause = () => {
        setRunning(false);
    }

    // Reset the initial value
    const reset = () => {
        setRunning(false);
        setRemaining(initialMinutes);
    }

    // Adjust the time (e.g +60 or -30 seconds)
    const update = ((increase: any) => {
        // Set the latest value by adding it with the increase value
        // Math.max(0, ...): Ensures the result never goes below 0 (prevents negative time)
        setRemaining((prev) => Math.max(0, prev + increase));
    });

    // ALTERNATIVE: use the dependency array to cache the latest value of remaining
    // However, can lead to stale remaining value due to rapid users' clicks, etc. 
    const update_useCallBack = useCallback((increase: any) => {
        // Set the latest value by adding it with the increase value
        // Math.max(0, ...): Ensures the result never goes below 0 (prevents negative time)
        setRemaining(Math.max(0, remaining + increase));
    }, [remaining]);

    // Counting down effect
    // Listen to the state of the timer running
    useEffect(() => {
        // If the timer is running
        if(running){
            // Using setInterval() to run setRemaining() every 1 sec
            intervalRef.current = setInterval(() => {
                setRemaining((prev) => {
                    // If the value has reached 1 or value being smaller than one
                    if(prev <= 1){
                        // clear interval
                        if(intervalRef.current) clearInterval(intervalRef.current);
                        // stop the timer
                        setRunning(false);
                        // return time of 0
                        return 0;
                    }
                    // Else, keep counting down
                    return prev - 1;
                });
            }, 1000);
        }
        
        // If the timer has stopped, clear the interval
        return () => {
            if(intervalRef.current) clearInterval(intervalRef.current);
        }
    }, [running])

    return {
        setTimerValue,
        setRunningState,
        storeTimer,
        storeRunning,
        remaining,
        minutes,
        seconds,
        running,
        start,
        pause,
        reset,
        update
    };
}