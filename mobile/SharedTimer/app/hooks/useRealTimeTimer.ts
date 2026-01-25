import { appliances } from "@/components/appliances";
import { useEffect, useState } from "react"

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

    const [remaining, setRemaining] = useState<{id: string, remaining: number}[]>([]);
    const [error, setError] = useState<Error | null>(null);
    
   let finishedAt: number = 0;

    const [startHour, setStartHour] = useState<string | null>(null);
    const [finishHour, setFinishHour] = useState<string | null>(null);

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

    let intervalID: number;
    const startTimer = (id: string, startedAt: number, baseTimer: number) => {
        let applianceFound = false;
        
        // set appliance running state to TRUE
        setRunning(prev => {
            return prev.map((a) => {
                if(a.id === id) {
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

        intervalID = setInterval(() => {
            const remainingTime = calculateRemaining(startedAt, baseTimer);
            if(remainingTime === 0) {
                setRemaining(0);
                
                // set appliance running state to FALSE
                setRunning(prev => 
                    prev.map(a =>
                        a.id === id ?
                        {...a, running: false} :
                        a
                    )
                );

                return;
            };
            setRemaining(remainingTime);
        }, 60000); // update every 1 min
    }

    useEffect(() => {
        if(running) return;
        if(intervalID) clearInterval(intervalID);
    }, [running]);

    useEffect(() => {
        return () => {
            if(intervalID){
                clearInterval(intervalID);
            }
        }
    })

    const pauseTimer = () => {
        setRunning(false);
        clearInterval(intervalID);
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