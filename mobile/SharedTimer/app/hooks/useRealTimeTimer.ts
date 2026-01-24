import { useState } from "react"

export const useRealTimeTimer = () => {
    const [timer, setTimer] = useState<number>(0);
    const [lockedBy, setLockedBy] = useState<string>('');
    const [running, setRunning] = useState<boolean>(false);
    
    const baseTimer: number = 0;
    let startedAt: number = 0;
    let finishedAt: number = 0;

    const [startHour, setStartHour] = useState<number>(0);
    const [finishHour, setFinishHour] = useState<number>(0);

    
}   