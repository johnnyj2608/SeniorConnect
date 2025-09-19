import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import '@testing-library/jest-dom';
import HomeAssessmentCard from './HomeAssessmentCard';
import fetchWithRefresh from '../../utils/fetchWithRefresh';
import { formatDate, formatTime } from '../../utils/formatUtils';

jest.mock('../../utils/fetchWithRefresh');

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key }),
}));

jest.mock('../layout/NameDisplay', () => ({ memberName }) => <span>{memberName}</span>);

describe('HomeAssessmentCard', () => {
    const assessmentsData = [
        {
            id: 1,
            member: 1,
            member_name: 'Alice',
            sadc_member_id: '1',
            alt_name: '',
            user_name: 'Dr. Smith',
            start_date: '2025-09-20',
            time: '10:00:00',
        },
        {
            id: 2,
            member: 2,
            member_name: 'Bob',
            sadc_member_id: '2',
            alt_name: '',
            user_name: 'Dr. Jones',
            start_date: '2025-09-21',
            time: '14:00:00',
        },
    ];

    it('renders upcoming assessments correctly with links', async () => {
        fetchWithRefresh.mockResolvedValueOnce({
            ok: true,
            json: async () => assessmentsData,
        });

        render(
            <MemoryRouter>
                <HomeAssessmentCard />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/home.assessments/)).toBeInTheDocument();

            assessmentsData.forEach((assessment) => {
                // Member name
                const link = screen.getByText(assessment.member_name).closest('a');
                expect(link).toBeInTheDocument();
                expect(link).toHaveAttribute('href', `/members/${assessment.member}`);

                // User name
                expect(
                    screen.getByText((content) => content.includes(assessment.user_name))
                ).toBeInTheDocument();

                // Formatted date
                expect(screen.getByText(formatDate(assessment.start_date))).toBeInTheDocument();

                // Formatted time
                expect(screen.getByText(formatTime(assessment.time))).toBeInTheDocument();
            });
        });
    });

    it('renders empty state when no assessments', async () => {
        fetchWithRefresh.mockResolvedValueOnce({
            ok: true,
            json: async () => [],
        });

        render(
            <MemoryRouter>
                <HomeAssessmentCard />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/home.no_upcoming_assessments/)).toBeInTheDocument();
        });
    });

    it('handles fetch failure gracefully', async () => {
        fetchWithRefresh.mockRejectedValueOnce(new Error('Network error'));

        render(
            <MemoryRouter>
                <HomeAssessmentCard />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/home.no_upcoming_assessments/)).toBeInTheDocument();
        });
    });
});