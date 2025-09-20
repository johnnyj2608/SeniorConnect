import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { AuthProvider, AuthContext } from './AuthContext';
import fetchWithRefresh from '../utils/fetchWithRefresh';

jest.mock('../utils/fetchWithRefresh');

describe('AuthContext', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('provides user data when fetch succeeds', async () => {
        const mockUser = { id: 1, name: 'John' };
        fetchWithRefresh.mockResolvedValue({
            ok: true,
            json: async () => mockUser,
        });

        let contextValue;
        render(
            <AuthProvider>
                <AuthContext.Consumer>
                    {value => {
                        contextValue = value;
                        return null;
                    }}
                </AuthContext.Consumer>
            </AuthProvider>
        );

        await waitFor(() => expect(contextValue.loading).toBe(false));
        expect(contextValue.user).toEqual(mockUser);
    });

    test('sets user to null if fetch fails', async () => {
        fetchWithRefresh.mockRejectedValue(new Error('Failed'));

        let contextValue;
        render(
            <AuthProvider>
                <AuthContext.Consumer>
                    {value => {
                        contextValue = value;
                        return null;
                    }}
                </AuthContext.Consumer>
            </AuthProvider>
        );

        await waitFor(() => expect(contextValue.loading).toBe(false));
        expect(contextValue.user).toBeNull();
    });
});