import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import '@testing-library/jest-dom';
import HomeBirthdayCard from './HomeBirthdayCard';
import fetchWithRefresh from '../../utils/fetchWithRefresh';

jest.mock('../../utils/fetchWithRefresh');

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key, options) => {
            if (key === 'home.days') return `${options.count} days`;
            if (key === 'home.turning_years_old') return `${options.count} years old`;
            return key;
        },
    }),
}));

jest.mock('../layout/NameDisplay', () => ({ memberName }) => <span>{memberName}</span>);

describe('HomeBirthdayCard', () => {
    const birthdaysData = [
        {
            id: 1,
            sadc_member_id: '1',
            first_name: 'Alice',
            last_name: 'Smith',
            alt_name: '',
            age_turning: 30,
            days_until: 0, // today
        },
        {
            id: 2,
            sadc_member_id: '2',
            first_name: 'Bob',
            last_name: 'Jones',
            alt_name: '',
            age_turning: 25,
            days_until: 1, // tomorrow
        },
        {
            id: 3,
            sadc_member_id: '3',
            first_name: 'Charlie',
            last_name: 'Brown',
            alt_name: '',
            age_turning: 40,
            days_until: 5, // future
        },
    ];

    it('renders birthdays correctly with member links', async () => {
        fetchWithRefresh.mockResolvedValueOnce({
            ok: true,
            json: async () => birthdaysData,
        });

        render(
            <MemoryRouter>
                <HomeBirthdayCard />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/snapshots.birthdays/)).toBeInTheDocument();

            birthdaysData.forEach((bday) => {
                // Member name
                const fullName = `${bday.last_name}, ${bday.first_name}`;
                const nameEl = screen.getByText((content) => content.includes(fullName));
                expect(nameEl).toBeInTheDocument();

                // Check that member name is wrapped in a link
                const link = nameEl.closest('a');
                expect(link).toBeInTheDocument();
                expect(link).toHaveAttribute('href', `/members/${bday.id}`);

                // Age turning (flexible matcher to ignore dash)
                expect(
                    screen.getByText((content) => content.includes(`${bday.age_turning} years old`))
                ).toBeInTheDocument();

                // Birthday message
                let message;
                if (bday.days_until === 0) message = 'home.today!';
                else if (bday.days_until === 1) message = 'home.tomorrow';
                else message = `${bday.days_until} days`;

                expect(
                    screen.getByText((content) => content.includes(message))
                ).toBeInTheDocument();
            });
        });
    });

    it('renders empty state when no birthdays', async () => {
        fetchWithRefresh.mockResolvedValueOnce({
            ok: true,
            json: async () => [],
        });

        render(
            <MemoryRouter>
                <HomeBirthdayCard />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/home.no_upcoming_birthdays/)).toBeInTheDocument();
        });
    });

    it('handles fetch failure gracefully', async () => {
        fetchWithRefresh.mockRejectedValueOnce(new Error('Network error'));

        render(
            <MemoryRouter>
                <HomeBirthdayCard />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/home.no_upcoming_birthdays/)).toBeInTheDocument();
        });
    });
});