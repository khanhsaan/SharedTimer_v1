// Mock supabase before any imports
jest.mock('@/lib/supabase', () => ({
    supabase: {
        auth: {
            signUp: jest.fn().mockResolvedValue({ data: null, error: null }),
            signInWithPassword: jest.fn().mockResolvedValue({ data: null, error: null }),
            signOut: jest.fn().mockResolvedValue({ error: null }),
            onAuthStateChange: jest.fn(),
        },
    },
}));

import { renderHook, waitFor, act } from '@testing-library/react';  // ✅ Built-in
import { useAuth } from '@/app/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { authHandle } from '@/app/handle/AuthHandle';

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
            });

            expect(response).toEqual({
                authSignUpData: null,
                authSignUpError: 'Email or password is empty',
            });
            expect(supabase.auth.signUp).not.toHaveBeenCalled();
        });

        it('should return error when password and confirm password are not maatch', async () => {
            const { result: hookReturn } = renderHook(() => {
                return useAuth({
                    userEmail: 'email@gmail.com',
                    userPassword: '123456',
                    userConfirmPassword: '12345',
                })
            });

            let response;
            await act(async () => {
                response = await hookReturn.current.signUpHandle();
            });
            expect(response).toEqual({
                authSignUpData: null,
                authSignUpError: 'Confirm password does not match',
            });
        })
    })
})

