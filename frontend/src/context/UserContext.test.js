import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { UserProvider, UserContext } from './UserContext';
import fetchWithRefresh from '../utils/fetchWithRefresh';

jest.mock('../utils/fetchWithRefresh');

describe('UserContext', () => {
    afterEach(() => jest.clearAllMocks());

    test('fetches users and updates state', async () => {
        const mockUsers = [{ id: 1, name: 'User1' }];
        fetchWithRefresh.mockResolvedValue({
            ok: true,
            json: async () => mockUsers,
        });

        let contextValue;
        render(
            <UserProvider>
                <UserContext.Consumer>
                    {value => {
                        contextValue = value;
                        return null;
                    }}
                </UserContext.Consumer>
            </UserProvider>
        );

        await waitFor(async () => {
            const data = await contextValue.refreshUser();
            expect(contextValue.users).toEqual(mockUsers);
            expect(data).toEqual(mockUsers);
        });
    });
});