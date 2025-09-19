import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import MemberAuthCard from './MemberAuthCard';
import { openFile } from '../../utils/fileUtils';
import { formatDate, formatSchedule } from '../../utils/formatUtils';

jest.mock('../../utils/fetchWithRefresh');
jest.mock('../../utils/fileUtils', () => ({
    openFile: jest.fn(),
}));

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: key => key }),
}));

jest.mock('../layout/CardMember', () => ({ children, onEdit, emptyMessage }) => (
  <div>
    <button data-testid="edit-button" onClick={onEdit}>Edit</button>
    {children}
    {emptyMessage && <div>{emptyMessage}</div>}
  </div>
));

jest.mock('../layout/MemberDetail', () => ({ label, value }) => (
    <div data-testid="member-detail">{label}: {value}</div>
));
jest.mock('../layout/ListDetail', () => ({ label, value }) => (
    <div data-testid="list-detail">{label}: {value}</div>
));
jest.mock('../layout/ContactDetail', () => ({ label, name, contact }) => (
    <div data-testid="contact-detail">{label}: {name} / {contact}</div>
));

describe('MemberAuthCard', () => {
    const mockOnEdit = jest.fn();
    const authData = {
        mltc: 'MLTC1',
        mltc_member_id: '123',
        start_date: '2025-09-19',
        end_date: '2025-12-31',
        dx_code: 'A123',
        schedule: ['mon', 'tue'],
        services: [
            { id: 1, service_type: 'therapy', auth_id: 'auth1', service_code: 'S1', service_units: 10 },
            { id: null, service_type: 'nursing', auth_id: 'auth2', service_code: 'S2', service_units: 5 },
        ],
        cm_name: 'Alice CM',
        cm_phone: '555-1234',
        file: 'somefile.pdf',
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders authorization details correctly', () => {
        render(<MemberAuthCard id={1} data={authData} onEdit={mockOnEdit} />);

        // Member details
        expect(screen.getByText('member.authorizations.mltc: MLTC1')).toBeInTheDocument();
        expect(screen.getByText('member.authorizations.start_date: ' + formatDate(authData.start_date))).toBeInTheDocument();
        expect(screen.getByText('member.authorizations.schedule: ' + formatSchedule(authData.schedule))).toBeInTheDocument();

        // Only service with valid id should render
        expect(screen.getByText('member.authorizations.auth_id: auth1')).toBeInTheDocument();
        expect(screen.queryByText('auth2')).not.toBeInTheDocument();

        // Contact detail
        expect(screen.getByText('member.authorizations.care_manager: Alice CM / 555-1234')).toBeInTheDocument();

        // File button
        const fileBtn = screen.getByText('member.authorizations.view_auth');
        expect(fileBtn).toBeInTheDocument();
    });

    it('calls openFile when file button is clicked', () => {
        render(<MemberAuthCard id={1} data={authData} onEdit={mockOnEdit} />);
        const fileBtn = screen.getByText('member.authorizations.view_auth');
        fireEvent.click(fileBtn);
        expect(openFile).toHaveBeenCalledWith('somefile.pdf');
    });

    it('calls onEdit with fetchData when edit button is clicked', () => {
        render(<MemberAuthCard id={1} data={authData} onEdit={mockOnEdit} />);
        const editButton = screen.getByTestId('edit-button');
        fireEvent.click(editButton);

        expect(mockOnEdit).toHaveBeenCalled();
        const args = mockOnEdit.mock.calls[0];
        expect(args[0]).toBe('authorizations');
        expect(typeof args[1].fetchData).toBe('function');
    });

    it('renders empty message when no data', () => {
        render(<MemberAuthCard id={1} data={null} onEdit={mockOnEdit} />);
        expect(screen.getByText('member.authorizations.no_authorization')).toBeInTheDocument();
    });
});