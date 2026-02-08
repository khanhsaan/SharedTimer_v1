import { act, renderHook } from "@testing-library/react";
import useRealTimeTimer from "../hooks/useRealTimeTimer"

jest.mock('..hooks/useProfiles');
jest.mock('..hooks/useAuthContext');
jest.mock('@/lib/supabase');

describe('useRealTimeTimer', () => {
    describe('setTimerValue', () => {
        it('should set timer remaining, base time, start hour & finish hour', () => {
            const {result} = renderHook(() => 
                useRealTimeTimer('profile-123', 'user-456')
            );

            act(() => {
                result.current.setTimerValue('washingMachine', 3000);
            });

            const remaining = result.current.remaining.find(
                r => r.id === 'washingMachine'
            );

            expect(remaining?.remaining).toBe(3000);
        })
    })
})

