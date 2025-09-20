import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { GiftProvider, GiftContext } from './GiftContext';
import fetchWithRefresh from '../utils/fetchWithRefresh';

jest.mock('../utils/fetchWithRefresh');

describe('GiftContext', () => {
    afterEach(() => jest.clearAllMocks());

    test('fetches gifts and updates state', async () => {
        const mockGifts = [{ id: 1, name: 'Gift1' }];
        fetchWithRefresh.mockResolvedValue({
            ok: true,
            json: async () => mockGifts,
        });

        let contextValue;
        render(
            <GiftProvider>
                <GiftContext.Consumer>
                    {value => {
                        contextValue = value;
                        return null;
                    }}
                </GiftContext.Consumer>
            </GiftProvider>
        );

        await waitFor(async () => {
            const data = await contextValue.refreshGift();
            expect(contextValue.gifts).toEqual(mockGifts);
            expect(data).toEqual(mockGifts);
        });
    });
});
