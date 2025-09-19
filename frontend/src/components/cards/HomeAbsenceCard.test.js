import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import '@testing-library/jest-dom';
import HomeAbsenceCard from './HomeAbsenceCard';
import fetchWithRefresh from '../../utils/fetchWithRefresh';

jest.mock('../../utils/fetchWithRefresh');

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key) => key,
    }),
}));

jest.mock('../layout/NameDisplay', () => ({ memberName }) => <span>{memberName}</span>);

describe('HomeAbsenceCard', () => {
    const leavingData = [
        { 
            member: 1, 
            member_name: 'Alice', 
            sadc_member_id: '1', 
            alt_name: '', 
            absence_type: 'vacation', 
            days_until: 0 
        },
        { 
            member: 2, 
            member_name: 'Bob', 
            sadc_member_id: '2', 
            alt_name: '', 
            absence_type: 'hospital', 
            days_until: 1 
        },
    ];

    const returningData = [
        { 
            member: 3, 
            member_name: 'Charlie', 
            sadc_member_id: '3', 
            alt_name: '', 
            absence_type: 'personal', 
            days_until: 2 
        },
    ];

    it('renders leaving and returning absences correctly with links', async () => {
        fetchWithRefresh.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ leaving: leavingData, returning: returningData }),
        });

        render(
            <MemoryRouter>
                <HomeAbsenceCard />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/home.leaving_soon/)).toBeInTheDocument();
            expect(screen.getByText(/home.returning_soon/)).toBeInTheDocument();

            // Leaving absences
            leavingData.forEach((absence) => {
                // Member name
                const link = screen.getByText(absence.member_name).closest('a');
                expect(link).toBeInTheDocument();
                expect(link).toHaveAttribute('href', `/members/${absence.member}`);

                // Absence type
                const absenceTypeEls = screen.getAllByText((content) =>
                    content.includes(`member.absences.${absence.absence_type}`)
                );
                expect(absenceTypeEls.length).toBeGreaterThan(0);

                // Days until
                const daysText =
                    absence.days_until === 0
                        ? 'home.today'
                        : absence.days_until === 1
                        ? 'home.tomorrow'
                        : 'home.days';
                expect(
                    screen.getByText((content) => content.includes(daysText))
                ).toBeInTheDocument();
            });

            // Returning absences
            returningData.forEach((absence) => {
                // Member name
                const link = screen.getByText(absence.member_name).closest('a');
                expect(link).toBeInTheDocument();
                expect(link).toHaveAttribute('href', `/members/${absence.member}`);

                // Absence type
                const absenceTypeEls = screen.getAllByText((content) =>
                    content.includes(`member.absences.${absence.absence_type}`)
                );
                expect(absenceTypeEls.length).toBeGreaterThan(0);

                // Days until
                const daysText =
                    absence.days_until === 0
                        ? 'home.today'
                        : absence.days_until === 1
                        ? 'home.tomorrow'
                        : 'home.days';
                expect(
                    screen.getByText((content) => content.includes(daysText))
                ).toBeInTheDocument();
            });
        });
    });

    it('renders empty state when no absences', async () => {
        fetchWithRefresh.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ leaving: [], returning: [] }),
        });

        render(
            <MemoryRouter>
                <HomeAbsenceCard />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/snapshots.absences/)).toBeInTheDocument();
            expect(screen.getByText(/home.no_upcoming_absences/)).toBeInTheDocument();
        });
    });

    it('handles fetch failure gracefully', async () => {
        fetchWithRefresh.mockRejectedValueOnce(new Error('Network error'));

        render(
            <MemoryRouter>
                <HomeAbsenceCard />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/snapshots.absences/)).toBeInTheDocument();
            expect(screen.getByText(/home.no_upcoming_absences/)).toBeInTheDocument();
        });
    });
});