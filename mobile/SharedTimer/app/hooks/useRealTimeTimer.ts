import { appliances } from "@/components/appliances";
import { useEffect, useRef, useState } from "react"

export const useRealTimeTimer = () => {
    const [timer, setTimer] = useState<number>(0);
    const [lockedBy, setLockedBy] = useState<string>('');

    // intialise running state to be all false
    const [running, setRunning] = useState<{id: string, running: boolean}[]>(
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
    const [error, setError] = useState<Error | null>(null);
    
   let finishedAt: number = 0;

    const [startHour, setStartHour] = useState<string | null>(null);
    const [finishHour, setFinishHour] = useState<string | null>(null);

    const intervalsRef = useRef<Record<string, number>>({});

    const calculateRemaining = (startedAt: number, baseTimer: number) => {
        const now = Date.now();

        const elapse = ((now / 1000) - startedAt);

        const remaining = Math.max(baseTimer - elapse, 0);

        return remaining;
    }

    const formatHoursAndMins = (totalSeconds: number) => {
        const hour = Math.floor(totalSeconds / 3600);
        const remaining_sec = totalSeconds % 3600;
        const min = Math.floor(remaining_sec / 60);

        return {
            hour,
            min
        }
    }
    
    const startTimer = (applianceID: string, startedAt: number, baseTimer: number) => {
        let applianceFound = false;

        // set appliance running state to TRUE
        setRunning(prev => {
            return prev.map((a) => {
                if(a.id === applianceID) {
                    applianceFound = true;
                    return {...a, running: true};
                } else {
                    applianceFound = false;
                    setError(new Error(`Cannot find appliance id`));
                    return a;
                }
            })    
        }
        );

        if(!applianceFound) return;

        const{hour: start_hour, min: start_min} = formatHoursAndMins(startedAt);
        setStartHour(`${start_hour}:${start_min}`);
        
        const finishedAt = startedAt + baseTimer;
        const{hour: finish_hour, min: finish_min} = formatHoursAndMins(finishedAt);
        setFinishHour(`${finish_hour}:${finish_min}`);

        const intervalID = setInterval(() => {
            const remainingTime = calculateRemaining(startedAt, baseTimer);
            if(remainingTime === 0) {
                setRemaining(prev =>
                    prev.map((a) =>
                        a.id === applianceID ?
                        {...a, remaining: 0} :
                        a
                    )
                );
                
                // set appliance running state to FALSE
                setRunning(prev => 
                    prev.map(a =>
                        a.id === applianceID ?
                        {...a, running: false} :
                        a
                    )
                );

                return;
            };
            setRemaining(prev =>
                prev.map((a) =>
                    a.id === applianceID ?
                    {...a, remaining: remainingTime} :
                    a
                )
            );
        }, 60000); // update every 1 min

        intervalsRef.current[applianceID] = intervalID; // store interval ID
    }

    useEffect(() => {
        return () => {
            // clear all intervals
            Object.values(intervalsRef.current).forEach(intervalID => clearInterval(intervalID));
            // reset intervalsRef
            intervalsRef.current = {};
        }
    })

    const pauseTimer = (applianceID: string) => {
        setRunning(prev => 
            prev.map((a) =>
                a.id === applianceID ?
                {...a, running: false}:
                a
            )
        );
        const intervalID = intervalsRef.current[applianceID];
        if(intervalID) clearInterval(intervalID);
    }

    return {
        startHour,
        finishHour,
        startTimer,
        pauseTimer,
        setRunning,
        calculateRemaining
    }
}

export default useRealTimeTimer;