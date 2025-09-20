import React from 'react';
import { render, screen } from '@testing-library/react';
import SnapshotsTable from './SnapshotsTable';
import { MemoryRouter } from 'react-router';
import { formatDate } from '../../utils/formatUtils';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key }),
}));

jest.mock('../buttons/OpenSaveButtons', () => ({ file, name }) => (
    <button>{name}</button>
));

describe('SnapshotsTable', () => {
    const registry = [
        {
            id: 1,
            date: '2025-09-20T10:00:00Z',
            type: 'pdf',
            pages: 5,
            file: 'file1.pdf',
            name: 'Snapshot 1',
        },
        {
            id: 2,
            date: '2025-09-21T11:00:00Z',
            type: 'docx',
            pages: 1,
            file: 'file2.docx',
            name: 'Snapshot 2',
        },
    ];

    it('renders table headers', () => {
        render(
            <MemoryRouter>
                <SnapshotsTable registry={registry} />
            </MemoryRouter>
        );

        expect(screen.getByText('registry.table.date')).toBeInTheDocument();
        expect(screen.getByText('registry.table.type')).toBeInTheDocument();
        expect(screen.getByText('registry.table.size')).toBeInTheDocument();
        expect(screen.getByText('registry.table.open_or_save')).toBeInTheDocument();
    });

    it('renders all registry entries with formatted date, type, pages, and buttons', () => {
        render(
            <MemoryRouter>
                <SnapshotsTable registry={registry} />
            </MemoryRouter>
        );

        registry.forEach(entry => {
            expect(screen.getByText(formatDate(entry.date))).toBeInTheDocument();
            expect(screen.getByText(`registry.snapshots.${entry.type}`)).toBeInTheDocument();
            expect(screen.getByText(`${entry.pages} ${entry.pages === 1 ? 'Page' : 'Pages'}`)).toBeInTheDocument();
            expect(screen.getByText(entry.name)).toBeInTheDocument(); 
        });
    });

    it('handles empty registry', () => {
        render(
            <MemoryRouter>
                <SnapshotsTable registry={[]} />
            </MemoryRouter>
        );

        const tbody = screen.getByRole('table').querySelector('tbody');
        expect(tbody.children.length).toBe(0);
    });
});