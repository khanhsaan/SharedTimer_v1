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

import { renderHook, waitFor, act } from '@testing-library/react';
// useAuth will call the interfered supabase module by jest rather then to call the imported supabase module in useAuth.ts
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

        it('should return error when password and confirm password are not match', async () => {
            const { result: hookReturn } = renderHook(() => {
                return useAuth({
                    userEmail: '123@gmail.com',
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

        it('should return error when password is weak', async () => {
            // Override the mock for this specific test
            (supabase.auth.signUp as jest.Mock).mockResolvedValueOnce({
                data: null,
                error: { code: 'weak_password' }
            });

            const { result: hookReturn } = renderHook(() => {
                return useAuth({
                    userEmail: '123@gmail.com',
                    userPassword: '123',
                    userConfirmPassword: '123',
                })
            });

            let response;
            await act(async () => {
                response = await hookReturn.current.signUpHandle();
            });
            expect(response).toEqual({
                authSignUpData: null,
                authSignUpError: 'weak_password',
            });
        })

        it('should return error when email exists', async () => {
            // Override the mock for this specific test
            (supabase.auth.signUp as jest.Mock).mockResolvedValueOnce({
                data: null,
                error: { code: 'email_exists' }
            });

            const { result: hookReturn } = renderHook(() => {
                return useAuth({
                    userEmail: '123@gmail.com',
                    userPassword: '123456',
                    userConfirmPassword: '123456',
                })
            });

            let response;
            await act(async () => {
                response = await hookReturn.current.signUpHandle();
            });
            expect(response).toEqual({
                authSignUpData: null,
                authSignUpError: 'email_exists',
            });
        })
    })
})

