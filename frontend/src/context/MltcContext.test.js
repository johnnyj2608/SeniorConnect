import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { MltcProvider, MltcContext } from './MltcContext';
import fetchWithRefresh from '../utils/fetchWithRefresh';

jest.mock('../utils/fetchWithRefresh');

describe('MltcContext', () => {
    afterEach(() => jest.clearAllMocks());

    test('fetches mltcs and updates state', async () => {
        const mockMltcs = [{ id: 1, name: 'MLTC1' }];
        fetchWithRefresh.mockResolvedValue({
            ok: true,
            json: async () => mockMltcs,
        });

        let contextValue;
        render(
            <MltcProvider>
                <MltcContext.Consumer>
                    {value => {
                        contextValue = value;
                        return null;
                    }}
                </MltcContext.Consumer>
            </MltcProvider>
        );

        await waitFor(async () => {
            const data = await contextValue.refreshMltc();
            expect(contextValue.mltcs).toEqual(mockMltcs);
            expect(data).toEqual(mockMltcs);
        });
    });
});
