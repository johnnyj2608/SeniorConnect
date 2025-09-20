import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { SadcProvider, SadcContext } from './SadcContext';
import fetchWithRefresh from '../utils/fetchWithRefresh';

jest.mock('../utils/fetchWithRefresh');

describe('SadcContext', () => {
    afterEach(() => jest.clearAllMocks());

    test('fetches sadcs and updates state', async () => {
        const mockSadc = [{ id: 1, name: 'SADC1' }];
        fetchWithRefresh.mockResolvedValue({
            ok: true,
            json: async () => mockSadc,
        });

        let contextValue;
        render(
            <SadcProvider>
                <SadcContext.Consumer>
                    {value => {
                        contextValue = value;
                        return null;
                    }}
                </SadcContext.Consumer>
            </SadcProvider>
        );

        await waitFor(async () => {
            const data = await contextValue.refreshSadc();
            expect(contextValue.sadc).toEqual(mockSadc);
            expect(data).toEqual(mockSadc);
        });
    });
});