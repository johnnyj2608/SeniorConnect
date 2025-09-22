import React from 'react';
import { render, screen } from '@testing-library/react';
import AbsencesTable from './AbsencesTable';
import { MemoryRouter } from 'react-router';
import { formatDate } from '../../utils/formatUtils';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key }),
}));

jest.mock('../layout/NameDisplay', () => ({ memberName }) => <span>{memberName}</span>);

describe('AbsencesTable', () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const registry = [
        {
            id: 1,
            member: 42,
            sadc_member_id: '42',
            member_name: 'John Doe',
            alt_name: 'Johnny',
            start_date: today.toISOString().split('T')[0],
            end_date: null,
            absence_type: 'vacation',
            called: true,
        },
        {
            id: 2,
            member: 43,
            sadc_member_id: '43',
            member_name: 'Jane Smith',
            alt_name: '',
            start_date: tomorrow.toISOString().split('T')[0],
            end_date: null,
            absence_type: 'hospital',
            called: false,
        },
        {
            id: 3,
            member: 44,
            sadc_member_id: '44',
            member_name: 'Bob Brown',
            alt_name: '',
            start_date: yesterday.toISOString().split('T')[0],
            end_date: yesterday.toISOString().split('T')[0],
            absence_type: 'personal',
            called: true,
        },
    ];

    it('renders table headers', () => {
        render(
            <MemoryRouter>
                <AbsencesTable registry={registry} />
            </MemoryRouter>
        );

        expect(screen.getByText('registry.table.member')).toBeInTheDocument();
        expect(screen.getByText('registry.table.start_date')).toBeInTheDocument();
        expect(screen.getByText('registry.table.end_date')).toBeInTheDocument();
        expect(screen.getByText('registry.table.reason')).toBeInTheDocument();
        expect(screen.getByText('registry.table.status')).toBeInTheDocument();
        expect(screen.getByText('registry.table.called')).toBeInTheDocument();
    });

    it('renders all registry entries with member names and formatted start dates', () => {
        render(
            <MemoryRouter>
                <AbsencesTable registry={registry} />
            </MemoryRouter>
        );

        registry.forEach(entry => {
            expect(screen.getByText(entry.member_name)).toBeInTheDocument();
            const dates = screen.getAllByText(formatDate(entry.start_date));
            expect(dates.length).toBeGreaterThan(0);
        });

        // end_date fallback
        const nAs = screen.getAllByText('N/A');
        expect(nAs.length).toBeGreaterThan(0);
    });

    it('applies colorAbsence and colorBoolean correctly', () => {
        render(
            <MemoryRouter>
                <AbsencesTable registry={registry} />
            </MemoryRouter>
        );

        expect(screen.getByText('registry.absences.ongoing')).toHaveClass('green');
        expect(screen.getByText('registry.absences.upcoming')).toHaveClass('yellow');
        expect(screen.getByText('registry.absences.completed')).not.toHaveClass('green');

        expect(screen.getAllByText('general.yes')[0]).toHaveClass('green');
        expect(screen.getByText('general.no')).toHaveClass('red');
    });

    it('handles empty registry', () => {
        const { container } = render(
            <MemoryRouter>
                <AbsencesTable registry={[]} />
            </MemoryRouter>
        );

        const tbody = container.querySelector('tbody');
        expect(tbody.children.length).toBe(0);
    });
});