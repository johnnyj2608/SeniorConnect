import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import '@testing-library/jest-dom';
import HomeStatsCard, { StatsItem } from './HomeStatsCard';
import fetchWithRefresh from '../../utils/fetchWithRefresh';
import { colorStats } from '../../utils/colorUtils';

jest.mock('../../utils/fetchWithRefresh');
jest.mock('../../utils/colorUtils', () => ({
    colorStats: jest.fn((count, change) => `colorStats(${count},${change})`),
}));

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key }),
}));

jest.mock('../buttons/DropdownButton', () => ({ showDetails, toggleDetails }) => (
    <button onClick={toggleDetails}>Toggle Details</button>
));

describe('HomeStatsCard', () => {
    const statsData = {
        active_count: 10,
        mltc_count: [
            { name: 'Group A', count: 5 },
            { name: 'Group B', count: 3 },
        ],
    };

    const changeData = {
        Overall: 2,
        'Group A': 1,
        'Group B': -1,
    };

    beforeEach(() => {
        fetchWithRefresh.mockReset();
        colorStats.mockClear();
    });

    it('renders empty state when stats not loaded', async () => {
        fetchWithRefresh.mockResolvedValueOnce({ ok: false });

        render(
            <MemoryRouter>
                <HomeStatsCard />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/home.no_available_stats/)).toBeInTheDocument();
        });
    });

    it('renders stats counts and change', async () => {
        fetchWithRefresh
            .mockResolvedValueOnce({ ok: true, json: async () => statsData })
            .mockResolvedValueOnce({ ok: true, json: async () => changeData });

        render(
            <MemoryRouter>
                <HomeStatsCard />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(statsData.active_count.toString())).toBeInTheDocument();
            expect(colorStats).toHaveBeenCalledWith(statsData.active_count, changeData.Overall);
            // Dropdown button should exist
            expect(screen.getByText('Toggle Details')).toBeInTheDocument();
        });
    });

    it('toggles details and renders StatsItem', async () => {
        fetchWithRefresh
            .mockResolvedValueOnce({ ok: true, json: async () => statsData })
            .mockResolvedValueOnce({ ok: true, json: async () => changeData });

        render(
            <MemoryRouter>
                <HomeStatsCard />
            </MemoryRouter>
        );

        // Wait for counts to load
        await waitFor(() => {
            expect(screen.getByText(statsData.active_count.toString())).toBeInTheDocument();
        });

        // Details not visible initially
        statsData.mltc_count.forEach(item => {
            expect(screen.queryByText(item.name)).not.toBeInTheDocument();
        });

        // Click dropdown
        fireEvent.click(screen.getByText('Toggle Details'));

        // Details visible
        await waitFor(() => {
            statsData.mltc_count.forEach(item => {
                expect(screen.getByText(item.name)).toBeInTheDocument();
                expect(screen.getByText(item.count.toString())).toBeInTheDocument();
                expect(colorStats).toHaveBeenCalledWith(item.count, changeData[item.name]);
            });
        });
    });

    it('handles fetch failures gracefully', async () => {
        fetchWithRefresh.mockRejectedValueOnce(new Error('Network error'));
        fetchWithRefresh.mockRejectedValueOnce(new Error('Network error'));

        render(
            <MemoryRouter>
                <HomeStatsCard />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/home.no_available_stats/)).toBeInTheDocument();
        });
    });
});