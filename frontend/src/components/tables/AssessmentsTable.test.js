import React from 'react';
import { render, screen } from '@testing-library/react';
import AssessmentsTable from './AssessmentsTable';
import { MemoryRouter } from 'react-router';
import { formatDate, formatTime } from '../../utils/formatUtils';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key }),
}));

jest.mock('../layout/NameDisplay', () => ({ memberName }) => <span>{memberName}</span>);

describe('AssessmentsTable', () => {
    const registry = [
        {
            id: 1,
            member: 42,
            sadc_member_id: '42',
            member_name: 'John Doe',
            alt_name: 'Johnny',
            user_name: 'admin1',
            start_date: '2025-09-20',
            time: '14:30',
        },
        {
            id: 2,
            member: 43,
            sadc_member_id: '43',
            member_name: 'Jane Smith',
            alt_name: '',
            user_name: 'admin2',
            start_date: '2025-09-21',
            time: '09:15',
        },
    ];

    it('renders table headers', () => {
        render(
            <MemoryRouter>
                <AssessmentsTable registry={registry} />
            </MemoryRouter>
        );

        expect(screen.getByText('registry.table.member')).toBeInTheDocument();
        expect(screen.getByText('registry.table.user')).toBeInTheDocument();
        expect(screen.getByText('registry.table.start_date')).toBeInTheDocument();
        expect(screen.getByText('registry.table.time')).toBeInTheDocument();
    });

    it('renders all registry entries with member names, user names, dates, and times', () => {
        render(
            <MemoryRouter>
                <AssessmentsTable registry={registry} />
            </MemoryRouter>
        );

        registry.forEach(entry => {
            expect(screen.getByText(entry.member_name)).toBeInTheDocument();
            expect(screen.getByText(entry.user_name)).toBeInTheDocument();

            const dateCells = screen.getAllByText(formatDate(entry.start_date));
            expect(dateCells.length).toBeGreaterThan(0);

            const timeCells = screen.getAllByText(formatTime(entry.time));
            expect(timeCells.length).toBeGreaterThan(0);
        });
    });

    it('handles empty registry', () => {
        const { container } = render(
            <MemoryRouter>
                <AssessmentsTable registry={[]} />
            </MemoryRouter>
        );

        const tbody = container.querySelector('tbody');
        expect(tbody.children.length).toBe(0);
    });
});
