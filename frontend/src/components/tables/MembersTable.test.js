import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import MembersTable from './MembersTable';
import { MemoryRouter } from 'react-router';
import { formatDate, formatSchedule } from '../../utils/formatUtils';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key }),
}));

jest.mock('../layout/NameDisplay', () => ({ memberName }) => <span>{memberName}</span>);

describe('MembersTable', () => {
    const registry = [
        {
            id: 1,
            sadc_member_id: '42',
            first_name: 'John',
            last_name: 'Doe',
            alt_name: 'Johnny',
            birth_date: '2000-01-01',
            mltc_name: 'MLTC-A',
            schedule: ['Mon', 'Wed', 'Fri'],
        },
        {
            id: 2,
            sadc_member_id: '43',
            first_name: 'Jane',
            last_name: 'Smith',
            alt_name: '',
            birth_date: '2001-02-02',
            mltc_name: 'MLTC-B',
            schedule: ['Tue', 'Thu'],
        },
    ];

    it('renders all registry entries with member names, birth dates, MLTC, schedule, and days', () => {
        render(
            <MemoryRouter>
                <MembersTable registry={registry} />
            </MemoryRouter>
        );

        registry.forEach(entry => {
            // Member name
            expect(screen.getByText(`${entry.last_name}, ${entry.first_name}`)).toBeInTheDocument();

            // Birth date using actual formatDate
            expect(screen.getByText(formatDate(entry.birth_date))).toBeInTheDocument();

            // MLTC
            expect(screen.getByText(entry.mltc_name)).toBeInTheDocument();

            // Schedule using actual formatSchedule
            expect(screen.getByText(formatSchedule(entry.schedule, true))).toBeInTheDocument();

            // Days count
            expect(screen.getByText(entry.schedule.length.toString())).toBeInTheDocument();
        });
    });

    it('renders table headers', () => {
        render(
            <MemoryRouter>
                <MembersTable registry={registry} />
            </MemoryRouter>
        );

        expect(screen.getByText('registry.table.member')).toBeInTheDocument();
        expect(screen.getByText('registry.table.birth_date')).toBeInTheDocument();
        expect(screen.getByText('registry.table.mltc')).toBeInTheDocument();
        expect(screen.getByText('registry.table.schedule')).toBeInTheDocument();
        expect(screen.getByText('registry.table.days')).toBeInTheDocument();
    });

    it('handles empty registry', () => {
        render(
            <MemoryRouter>
                <MembersTable registry={[]} />
            </MemoryRouter>
        );

        const tbody = screen.getByRole('table').querySelector('tbody');
        expect(tbody.children.length).toBe(0);
    });
});