import useRealTimeTimer from "../hooks/useRealTimeTimer"

const setTimerValue = useRealTimeTimer();

describe('setTimerValue', () => {
    it('should set timer remaining, base time, start hour & finish hour with corresponding passed value in sec', () => {
        const applianceID = 'washingMachine';
        const value = 3000;
        const result = setTimerValue(applianceID, value);

        expect(result).toBe(0);
    })
})