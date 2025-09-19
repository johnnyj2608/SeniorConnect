import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import '@testing-library/jest-dom';
import HomeEnrollmentCard from './HomeEnrollmentCard';
import fetchWithRefresh from '../../utils/fetchWithRefresh';

jest.mock('../../utils/fetchWithRefresh');

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key) => key,
    }),
}));

jest.mock('../layout/NameDisplay', () => ({ memberName }) => <span>{memberName}</span>);

describe('HomeEnrollmentCard', () => {
    const enrollmentsData = [
        {
            id: 1,
            member_id: 1,
            sadc_member_id: '1',
            member_name: 'Alice Smith',
            member_alt_name: '',
            change_date: '2025-09-19',
            change_type: 'added',
            old_mltc: null,
            new_mltc: 'MLTC A',
        },
        {
            id: 2,
            member_id: 2,
            sadc_member_id: '2',
            member_name: 'Bob Jones',
            member_alt_name: '',
            change_date: '2025-09-18',
            change_type: 'updated',
            old_mltc: 'MLTC B',
            new_mltc: 'MLTC C',
        },
    ];

    it('renders enrollments correctly with member links', async () => {
        fetchWithRefresh.mockResolvedValueOnce({
            ok: true,
            json: async () => enrollmentsData,
        });

        render(
            <MemoryRouter>
                <HomeEnrollmentCard />
            </MemoryRouter>
        );

        await waitFor(() => {
            // Card title
            expect(screen.getByText(/snapshots.enrollments/)).toBeInTheDocument();

            enrollmentsData.forEach((enrollment) => {
                // Member name
                const nameEl = screen.getByText((content) => content.includes(enrollment.member_name));
                expect(nameEl).toBeInTheDocument();

                // Check that member name is wrapped in a link
                const link = nameEl.closest('a');
                expect(link).toBeInTheDocument();
                expect(link).toHaveAttribute('href', `/members/${enrollment.member_id}`);

                // Change date (ignore exact formatting)
                expect(
                    screen.getAllByText((content) => content.includes('2025')).length
                ).toBeGreaterThan(0);

                // Change type
                expect(
                    screen.getByText(`registry.enrollments.${enrollment.change_type}`)
                ).toBeInTheDocument();

                // MLTC message
                const message = enrollment.old_mltc && enrollment.new_mltc
                    ? `${enrollment.old_mltc} → ${enrollment.new_mltc}`
                    : enrollment.new_mltc || enrollment.old_mltc;
                expect(
                    screen.getByText((content) => content.includes(message))
                ).toBeInTheDocument();
            });
        });
    });

    it('renders empty state when no enrollments', async () => {
        fetchWithRefresh.mockResolvedValueOnce({
            ok: true,
            json: async () => [],
        });

        render(
            <MemoryRouter>
                <HomeEnrollmentCard />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/home.no_recent_enrollments/)).toBeInTheDocument();
        });
    });

    it('handles fetch failure gracefully', async () => {
        fetchWithRefresh.mockRejectedValueOnce(new Error('Network error'));

        render(
            <MemoryRouter>
                <HomeEnrollmentCard />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/home.no_recent_enrollments/)).toBeInTheDocument();
        });
    });
});