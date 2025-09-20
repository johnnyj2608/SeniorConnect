import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import RegistryPage from './RegistryPage';
import { AuthContext } from '../context/AuthContext';
import { BrowserRouter } from 'react-router';

// Simple i18n mock: t(key) = key
jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key }),
}));

// Mock components
jest.mock('../components/buttons/SwitchButton', () => ({ onClick }) => (
    <button onClick={onClick}>SwitchButton</button>
));
jest.mock('../components/buttons/PaginationButtons', () => ({ currentPage }) => (
    <div>PaginationButtons page={currentPage}</div>
));
jest.mock('../components/tables/MembersTable', () => ({ registry }) => (
    <div>MembersTable {registry.length}</div>
));
jest.mock('../components/tables/AbsencesTable', () => ({ registry }) => (
    <div>AbsencesTable {registry.length}</div>
));
jest.mock('../components/tables/EnrollmentsTable', () => ({ registry }) => (
    <div>EnrollmentsTable {registry.length}</div>
));
jest.mock('../components/tables/AssessmentsTable', () => ({ registry }) => (
    <div>AssessmentsTable {registry.length}</div>
));
jest.mock('../components/tables/AuditsTable', () => ({ registry }) => (
    <div>AuditsTable {registry.length}</div>
));
jest.mock('../components/tables/SnapshotsTable', () => ({ registry }) => (
    <div>SnapshotsTable {registry.length}</div>
));
jest.mock('../components/inputs/MltcFilter', () => ({ value, onChange }) => (
    <input value={value} onChange={(e) => onChange(e.target.value)} placeholder="MltcFilter" />
));

// Mock useFilteredRegistry
const mockSetCurrentPage = jest.fn();
const mockFetchRegistry = jest.fn();

jest.mock('../hooks/useFilteredRegistry', () => (type, filter) => ({
    registry: [{ id: 1 }],
    currentPage: 1,
    totalPages: 2,
    setCurrentPage: mockSetCurrentPage,
    fetchRegistry: mockFetchRegistry,
}));

describe('RegistryPage', () => {
    const renderPage = (user = { is_org_admin: true }) =>
        render(
            <BrowserRouter>
                <AuthContext.Provider value={{ user }}>
                    <RegistryPage />
                </AuthContext.Provider>
            </BrowserRouter>
        );

    it('renders page header', () => {
        renderPage();
        expect(screen.getByText(/general.registry/i)).toBeInTheDocument();
        expect(screen.getByText('SwitchButton')).toBeInTheDocument();
    });

    it('renders registry type select with correct options', () => {
        renderPage();
        const select = screen.getByLabelText('registry.registry_type');
        expect(select).toBeInTheDocument();
        fireEvent.change(select, { target: { value: 'absences' } });
        expect(select.value).toBe('absences');
    });

    it('renders status filter select or MltcFilter depending on registry type', () => {
        renderPage();
        const filterInput = screen.getByPlaceholderText('MltcFilter');
        expect(filterInput).toBeInTheDocument();

        const typeSelect = screen.getByLabelText('registry.registry_type');
        fireEvent.change(typeSelect, { target: { value: 'absences' } });

        const statusSelect = screen.getByLabelText('registry.status_filter');
        expect(statusSelect).toBeInTheDocument();
        expect(statusSelect.tagName).toBe('SELECT');
    });

    it('renders correct table component based on registry type', () => {
        renderPage();
        expect(screen.getByText('MembersTable 1')).toBeInTheDocument();

        const typeSelect = screen.getByLabelText('registry.registry_type');
        fireEvent.change(typeSelect, { target: { value: 'absences' } });
        expect(screen.getByText('AbsencesTable 1')).toBeInTheDocument();
    });

    it('renders pagination and result text', () => {
        renderPage();
        expect(screen.getByText('PaginationButtons page=1')).toBeInTheDocument();
        expect(screen.getByText(/1 general.result/i)).toBeInTheDocument();
    });

    it('calls fetchRegistry when SwitchButton is clicked', () => {
        renderPage();
        const switchButton = screen.getByText('SwitchButton');
        fireEvent.click(switchButton);
        expect(mockFetchRegistry).toHaveBeenCalledTimes(1);
    });

    it('updates page when pagination buttons trigger setCurrentPage', () => {
        renderPage();
        // simulate pagination
        mockSetCurrentPage(2);
        expect(mockSetCurrentPage).toHaveBeenCalledWith(2);
    });
});
