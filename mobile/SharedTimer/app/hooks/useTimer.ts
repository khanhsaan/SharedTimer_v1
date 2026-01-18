import { useCallback, useEffect, useRef, useState } from "react";
import { appliances } from "@/components/appliances";
import { store } from "expo-router/build/global-state/router-store";
import { prefetch } from "expo-router/build/global-state/routing";
export function useTimer(){
    // Initial minutes
    const[initialMinutes, setInitialMinutes] = useState<number>(0);
    // Seconds left
    const[remaining, setRemaining] = useState<number>(initialMinutes);
    // Is it counting down?
    const[running, setRunning] = useState<boolean>(false);
    const intervalRef = useRef<number | null>(null);

    // Derived values
    const minutes = Math.floor(remaining / 60);

    // Remain seconds
    const seconds = remaining % 60;

    // Store the passed appliances timer value

    // Intialise storeRunning to store the running state of each appliance with the initial state of false
    const[storeRunning, setStoreRunning] = useState<{id: string, running: boolean}[]>(() =>
        appliances.map((a) => ({id: a.id, running: false}))
    );

    const[storeRemaining, setStoreRemaining] = useState<{id: string, remaining: number}[]>(() => 
        appliances.map(a => ({id: a.id, remaining: 0}))
    );

    // Set the timer value
    const setTimerValue = (passedId: string, initialMinutes: number) => {
        // Look up the passed Id from the latest value of the array and set the initial minutes, if cannot find keep it the same
        setStoreRemaining(prev => prev.map(a => a.id === passedId ? {...a, remaining: initialMinutes * 60} : a));
    }

    // Set the running state
    const setRunningState = (passedId: string, passedRunning: boolean) => {
        // Look up the passed Id from the latest value of the array and set the running state, if cannot find keep it the same
        setStoreRunning(prev => prev.map(a => a.id === passedId ? {...a, running: passedRunning}: a))
    }

    // Store the started moment of appliance
    const [storeStartedAt, setStoreStartedAt] = useState<{id: string, startedAt: number | null}[]>(
        () => appliances.map(a => ({id: a.id, startedAt: null}))
    );

    // Initialise storeTimer and storeRunnig with the initial values as 0 & false
    useEffect(() => {
        // DEBUG
        console.log("storeTimer: ", storeRemaining);
        console.log("storeRunning: ", storeRunning);
    }, [storeRemaining, storeRunning])

    // Start the timer
    // useCallback(): Reuse the const with the latest values of remaining, running
    const startTimer = useCallback((passedId: string) => {
        console.log("----- startTimer receieved PASSED ID: ", passedId);

        const applianceTime = storeRemaining.find(a => a.id === passedId)?.remaining ?? 0;
        const applianceRunning = storeRunning.find(a => a.id === passedId)?.running ?? false;

        // If the appliance timer > 0 and appliance timer is not running
        if(applianceTime && applianceTime > 0 && !applianceRunning){
            // Set that appliance timer state -> true
            setStoreRunning(prev => prev.map(a => a.id === passedId ? {...a, running: true}: a));
            // Log the started time
            setStoreStartedAt(prev => prev.map(a => a.id === passedId ? {...a, startedAt: Date.now()}: a));

            console.log(`------\nSTART button clicked! \nRunning: ${applianceRunning}\nRemaining: ${applianceTime}\n------`);
        } else if(applianceTime == 0) {
            console.error(`Appliance timer = 0`);
        } else {
            console.log(`CANNOT find passed ID`);
        }
    }, [storeRunning, storeRemaining])

    // Pause the timer
    const pauseTimer = useCallback((passedId: string) => {
        const applianceRunning = storeRunning.find(a => a.id == passedId)?.running;

        if(applianceRunning){
            // Set that appliance timer state -> false
            setStoreRunning(prev => prev.map(a => a.id === passedId ? {...a, running: false}: a));
        }
        
    },[storeRunning])

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
        // Check if there's any appliance running
        const isAnyRunning = storeRunning.some(a => a.running);
        
        if(!isAnyRunning){
            console.log("----- There is NO appliance running");
            return;
        } 
        
        const t = setInterval(() => {
            setStoreRemaining(prev => prev.map(a => {
                // If the appliance is not running return it
                if(!storeRunning.find(r => r.id === a.id)?.running) return a;

                // Calculate the remaining time
                const base = storeRemaining.find(t => t.id === a.id)?.remaining ?? 0;
                // DEBUG
                console.log(`----- BASE: ${base / 60}`)
                const started = storeStartedAt.find(s => s.id === a.id)?.startedAt ?? 0;
                
                // DEBUG
                console.log(`----- STARTED: ${started}`)
                const elapsed = Math.max(0, (Date.now() - started) / 1000);

                const remaining = Math.max(0, (base - elapsed));
                // DEBUG
                console.log(`----- REMAINING: ${remaining}`)
                
                // Once the remaining hit 0 its corresponding running -> false
                if(remaining === 0){
                    setStoreRunning(prev => prev.map(r => r.id === a.id ? {...r, running: false}: r));
                }

                return {...a, remaining: remaining};
            }))
        }, 1000);

        return () => clearInterval(t);
    }, [storeRunning])

    return {
        setTimerValue,
        setRunningState,
        storeRunning,
        storeRemaining,
        remaining,
        minutes,
        seconds,
        running,
        startTimer,
        pauseTimer,
        reset,
        update
    };
}