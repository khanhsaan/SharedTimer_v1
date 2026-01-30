import { appliances } from "@/components/appliances";
import { useEffect, useRef, useState } from "react"

export const useRealTimeTimer = () => {
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

    const [error, setError] = useState<Error | null>(null);


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

    const setTimerValue = (applianceID: string, baseTimer: number) => {
        const startedAt = Math.floor(Date.now() / 1000);

        setBaseTimerState(prev =>
            prev.map((a) => 
                applianceID === a.id ?
                {...a, baseTimerState: baseTimer} :
                a
            )
        )
        const{hour: start_hour, min: start_min} = formatHoursAndMins(startedAt);
        setStartHour(prev =>
            prev.map(a => a.id === applianceID ?
                {...a, startHour: `${start_hour}:${start_min}`}:
                a
            )
        )

        const finishedAt = startedAt + baseTimer;
        const{hour: finish_hour, min: finish_min} = formatHoursAndMins(finishedAt);
        setFinishHour(prev =>
            prev.map((a) =>
                a.id === applianceID ?
                {...a, finishHour: `${finish_hour}:${finish_min}`}:
                a
            )
        );
    }
    
    const startTimer = (applianceID: string) => {
        const startedAt = Math.floor(Date.now() / 1000);

        // check if appliance exists first
        const applianceFound = running.some(a => a.id === applianceID);

        const baseTimer = baseTimerState.find(a => a.id === applianceID)?.baseTimerState;
        
        if(!applianceFound){
            setError(new Error(`Cannot find appliance id`));
            return;
        }

        if(baseTimer === undefined || baseTimer === null){
            setError(new Error(`Base timer for appliance ${applianceID} is null`));
            return;
        }

        // set appliance running state to TRUE
        setRunning(prev => {
            return prev.map((a) => {
                if(a.id === applianceID) {
                    return {...a, running: true};
                }
                return a;
            })    
        }
        );


        let remainingTime = calculateRemaining(startedAt, baseTimer);
        setRemaining(prev =>
            prev.map((a) =>
                a.id === applianceID ?
                {...a, remaining: remainingTime}:
                a
            )
        );
        const intervalID = setInterval(() => {
            remainingTime = calculateRemaining(startedAt, baseTimer);

            setRemaining(prev =>
                prev.map((a) =>
                    a.id === applianceID ?
                    {...a, remaining: remainingTime} :
                    a
                )
            );

            if(remainingTime === 0) {
                // set appliance running state to FALSE
                setRunning(prev => 
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
    }, [])

    const pauseTimer = (applianceID: string) => {
        setRunning(prev => 
            prev.map((a) =>
                a.id === applianceID ?
                {...a, running: false}:
                a
            )
        );
        const intervalID = intervalsRef.current[applianceID];
        if(intervalID) clearInterval(intervalID); // clear interval
        delete intervalsRef.current[applianceID]; // remove interval ID
    }

    return {
        running,
        remaining,
        startHour,
        finishHour,
        startTimer,
        pauseTimer,
        setTimerValue,
        error,
    }
}

export default useRealTimeTimer;