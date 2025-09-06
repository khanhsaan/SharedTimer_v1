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
    const start = useCallback(() => {
        // If there is still time remaining and it's not running, set the running state to true
        if(remaining > 0 && !running){
            setRunning(true);
        }
    }, [remaining, running]) 

    // Pause the timer
    const pause = useCallback(() => {
        setRunning(false);
    }, [])

    // Reset the initial value
    const reset = useCallback(() => {
        setRunning(false);
        setRemaining(initialSeconds);
    }, [initialSeconds])

    // Adjust the time (e.g +60 or -30 seconds)
    const update = useCallback((increase: any) => {
        setRemaining((prev) => Math.max(0, prev + increase));
    }, []);

    // Ticking effect
    useEffect(() => {
        if(running){
            intervalRef.current = setInterval(() => {
                setRemaining((prev) => {
                    if(prev <= 1){
                        if(intervalRef.current) clearInterval(intervalRef.current);
                        setRunning(false);
                        return 0;
                    }

                    return prev - 1;
                });
            }, 1000);
        }

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