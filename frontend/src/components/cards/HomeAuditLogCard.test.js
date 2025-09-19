import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import '@testing-library/jest-dom';
import HomeAuditLogCard from './HomeAuditLogCard';
import fetchWithRefresh from '../../utils/fetchWithRefresh';
import { formatDate } from '../../utils/formatUtils';

jest.mock('../../utils/fetchWithRefresh');

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key }),
}));

jest.mock('../layout/NameDisplay', () => ({ memberName }) => <span>{memberName}</span>);

describe('HomeAuditLogCard', () => {
    const auditData = [
        {
            date: '2025-09-19',
            audits: [
                {
                    id: 1,
                    member_id: 1,
                    member_name: 'Alice',
                    sadc_member_id: '1',
                    alt_name: '',
                    user_name: 'Dr. Smith',
                    action_type: 'login',
                    model_name: 'user',
                },
                {
                    id: 2,
                    member_id: 2,
                    member_name: 'Bob',
                    sadc_member_id: '2',
                    alt_name: '',
                    user_name: 'Dr. Jones',
                    action_type: 'update',
                    model_name: 'profile',
                },
            ],
        },
        {
            date: '2025-09-18',
            audits: [
                {
                    id: 3,
                    member_id: 3,
                    member_name: 'Charlie',
                    sadc_member_id: '3',
                    alt_name: '',
                    user_name: 'Dr. Adams',
                    action_type: 'delete',
                    model_name: 'record',
                },
            ],
        },
    ];

    it('renders audit logs correctly', async () => {
        fetchWithRefresh.mockResolvedValueOnce({
            ok: true,
            json: async () => auditData,
        });

        render(
            <MemoryRouter>
                <HomeAuditLogCard />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/home.audit_log/)).toBeInTheDocument();

            auditData.forEach(group => {
                expect(screen.getByText(formatDate(group.date))).toBeInTheDocument();

                group.audits.forEach(audit => {
                    // Member name
                    expect(
                        screen.getByText((content) => content.includes(audit.member_name))
                    ).toBeInTheDocument();

                    // User name
                    expect(
                        screen.getByText((content) => content.includes(audit.user_name))
                    ).toBeInTheDocument();

                    // Action type and model name
                    expect(screen.getByText(`home.${audit.action_type}`)).toBeInTheDocument();
                    expect(screen.getByText(`model.${audit.model_name}`)).toBeInTheDocument();
                });
            });
        });
    });

    it('renders empty state when no audits', async () => {
        fetchWithRefresh.mockResolvedValueOnce({
            ok: true,
            json: async () => [],
        });

        render(
            <MemoryRouter>
                <HomeAuditLogCard />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/home.no_recent_audits/)).toBeInTheDocument();
        });
    });

    it('handles fetch failure gracefully', async () => {
        fetchWithRefresh.mockRejectedValueOnce(new Error('Network error'));

        render(
            <MemoryRouter>
                <HomeAuditLogCard />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/home.no_recent_audits/)).toBeInTheDocument();
        });
    });
});
