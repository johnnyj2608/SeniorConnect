import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AuditsTable from './AuditsTable';
import { MemoryRouter } from 'react-router';
import { formatDate } from '../../utils/formatUtils';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key }),
}));

jest.mock('../layout/NameDisplay', () => ({ memberName }) => <span>{memberName}</span>);

jest.mock('../buttons/DropdownButton', () => ({ showDetails, toggleDetails }) => (
    <button onClick={toggleDetails}>{showDetails ? 'Hide' : 'Show'}</button>
));

jest.mock('../../utils/colorUtils', () => ({
    colorAudit: (actionType) => {
        if (actionType === 'create') return <span className="green">registry.audit_log.create</span>;
        if (actionType === 'update') return <span className="yellow">registry.audit_log.update</span>;
        return <span>{actionType}</span>;
    },
}));

describe('AuditsTable', () => {
    const registry = [
        {
            id: 1,
            member_id: 42,
            sadc_member_id: '42',
            member_name: 'John Doe',
            alt_name: 'Johnny',
            model_name: 'member',
            action_type: 'create',
            user_name: 'admin1',
            timestamp: '2025-09-20T10:00:00Z',
            changes: {},
        },
        {
            id: 2,
            member_id: 43,
            sadc_member_id: '43',
            member_name: 'Jane Smith',
            alt_name: '',
            model_name: 'member',
            action_type: 'update',
            user_name: 'admin2',
            timestamp: '2025-09-21T11:00:00Z',
            changes: {
                first_name: { old: 'Jane', new: 'Janet' },
                active: { old: true, new: false },
            },
        },
    ];

    it('renders all registry entries with member names, actions, users, and formatted timestamps', () => {
        render(
            <MemoryRouter>
                <AuditsTable registry={registry} />
            </MemoryRouter>
        );

        const rows = screen.getAllByRole('row').slice(1); // skip header

        registry.forEach((entry, i) => {
            const row = rows[i];
            expect(row).toHaveTextContent(entry.member_name);
            expect(row).toHaveTextContent(`model.${entry.model_name}`);
            expect(row).toHaveTextContent(entry.user_name);
            expect(row).toHaveTextContent(formatDate(entry.timestamp));
        });
    });

    it('expands and displays changes when dropdown is clicked', () => {
        render(
            <MemoryRouter>
                <AuditsTable registry={registry} />
            </MemoryRouter>
        );

        // Click the "Show" button to expand second row
        const showButton = screen.getByText('Show');
        fireEvent.click(showButton);

        // Expanded row is the next sibling after the expanded tr
        const expandedRow = screen.getByText('Hide').closest('tr').nextSibling;

        expect(expandedRow).toHaveTextContent('first_name');
        expect(expandedRow).toHaveTextContent('Jane → Janet');
        expect(expandedRow).toHaveTextContent('active');
        expect(expandedRow).toHaveTextContent('general.yes → general.no');
    });
});