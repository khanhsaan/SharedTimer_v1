import { useCallback, useEffect, useRef, useState } from "react";

export function useTimer(initialSeconds = 0){
    // Seconds left
    const[remaining, setRemaining] = useState(initialSeconds);
    // Is it counting down?
    const[running, setRunning] = useState(false);
    // tick loop
    const intervalRef = useRef<number | null>(null);

    // Derived values
    const minutes = Math.floor(remaining / 60);

    // Remain seconds
    const seconds = remaining % 60;

    // Start the timer
    // useCallback(): Reuse the const with the latest values of remaining, running
    const start = useCallback(() => {
        // If there is still time remaining and it's not running, set the running state to true
        if(remaining > 0 && !running){
            setRunning(true);
        }
    }, [remaining, running]) 

    // Pause the timer
    const pause = () => {
        setRunning(false);
    }

    // Reset the initial value
    const reset = () => {
        setRunning(false);
        setRemaining(initialSeconds);
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