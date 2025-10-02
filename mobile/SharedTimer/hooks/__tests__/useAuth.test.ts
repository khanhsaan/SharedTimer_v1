import { renderHook, act } from '@testing-library/react-hooks';
import { useAuth } from '@/app/hooks/useAuth';
import { supabase } from '@/lib/supabase';

jest.mock('@/lib/supabase');

describe('useAuth', () => {
    // clear all the tests before run
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('signUpHandle', () => {
        it('should return error when email is empty', async () => {
            const { result: hookReturn } = renderHook(() =>
                useAuth({
                    userEmail: '',
                    userPassword: 'password123',
                    userConfirmPassword: 'password123',
                })
            );

            let response;
            await act(async () => {
                response = await hookReturn.current.signUpHandle();
            })

            expect(response).toEqual({
                authSignUpData: null,
                authSignUpError: 'Email or password is empty',
            });
            expect(supabase.auth.signUp).not.toHaveBeenCalled();
        })
    })
})

