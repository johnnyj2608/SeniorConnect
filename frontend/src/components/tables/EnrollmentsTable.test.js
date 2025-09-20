import React from 'react';
import { render, screen } from '@testing-library/react';
import EnrollmentsTable from './EnrollmentsTable';
import { MemoryRouter } from 'react-router';
import { formatDate } from '../../utils/formatUtils';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key }),
}));

jest.mock('../layout/NameDisplay', () => ({ memberName }) => <span>{memberName}</span>);

jest.mock('../../utils/colorUtils', () => ({
    colorEnrollment: (change_type, old_mltc, new_mltc, t) => {
        if (change_type === 'add') return <span className="green">{t('enrollment.added')}</span>;
        if (change_type === 'remove') return <span className="red">{t('enrollment.removed')}</span>;
        return <span>{t('enrollment.updated')}</span>;
    },
}));

describe('EnrollmentsTable', () => {
    const registry = [
        {
            id: 1,
            member_id: 42,
            sadc_member_id: '42',
            member_name: 'John Doe',
            alt_name: 'Johnny',
            change_type: 'add',
            old_mltc: null,
            new_mltc: 'A',
            change_date: '2025-09-20T10:00:00Z',
        },
        {
            id: 2,
            member_id: 43,
            sadc_member_id: '43',
            member_name: 'Jane Smith',
            alt_name: '',
            change_type: 'remove',
            old_mltc: 'B',
            new_mltc: null,
            change_date: '2025-09-21T11:00:00Z',
        },
        {
            id: 3,
            member_id: 44,
            sadc_member_id: '44',
            member_name: 'Bob Brown',
            alt_name: '',
            change_type: 'update',
            old_mltc: 'C',
            new_mltc: 'D',
            change_date: '2025-09-19T09:00:00Z',
        },
    ];

    it('renders all registry entries with member names, status, and formatted dates', () => {
        render(
            <MemoryRouter>
                <EnrollmentsTable registry={registry} />
            </MemoryRouter>
        );

        registry.forEach(entry => {
            expect(screen.getByText(entry.member_name)).toBeInTheDocument();
            expect(screen.getByText(formatDate(entry.change_date))).toBeInTheDocument();
        });

        // Status checks
        expect(screen.getByText('enrollment.added')).toHaveClass('green');
        expect(screen.getByText('enrollment.removed')).toHaveClass('red');
        expect(screen.getByText('enrollment.updated')).toBeInTheDocument();
    });

    it('handles empty registry', () => {
        render(
            <MemoryRouter>
                <EnrollmentsTable registry={[]} />
            </MemoryRouter>
        );

        const tbody = screen.getByRole('table').querySelector('tbody');
        expect(tbody.children.length).toBe(0);
    });
});