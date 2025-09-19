import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import MemberInfoCard from './MemberInfoCard';
import { formatDate, formatGender, formatPhone, formatSSN } from '../../utils/formatUtils';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: key => key.split('.').pop() }),
}));

jest.mock('../layout/CardMember', () => ({ children, onEdit, emptyMessage }) => (
    <div>
        <button onClick={onEdit}>Edit</button>
        {children}
        {emptyMessage && <div>{emptyMessage}</div>}
    </div>
));

jest.mock('../layout/MemberDetail', () => ({ label, value }) => (
    <div>{label}: {value}</div>
));

jest.mock('../layout/ContactDetail', () => ({ label, name }) => (
    <div>{label}: {name}</div>
));

describe('MemberInfoCard', () => {
    const mockOnEdit = jest.fn();
    const memberData = {
        sadc_member_id: 'M123',
        last_name: 'Doe',
        first_name: 'John',
        alt_name: 'Johnny',
        birth_date: '1990-01-01',
        gender: 'M',
        phone: '5551234567',
        address: '123 Main St',
        email: 'john.doe@example.com',
        medicaid: 'a123456',
        ssn: '123456789',
        language: 'English',
        enrollment_date: '2020-06-01',
        note: 'Test note',
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders member info correctly', () => {
        render(<MemberInfoCard data={memberData} onEdit={mockOnEdit} />);

        expect(screen.getByText(`sadc_member_id: ${memberData.sadc_member_id}`)).toBeInTheDocument();
        expect(screen.getByText(`last_name: ${memberData.last_name}`)).toBeInTheDocument();
        expect(screen.getByText(`first_name: ${memberData.first_name}`)).toBeInTheDocument();
        expect(screen.getByText(`alt_name: ${memberData.alt_name}`)).toBeInTheDocument();
        expect(screen.getByText(`birth_date: ${formatDate(memberData.birth_date)}`)).toBeInTheDocument();
        expect(screen.getByText(`gender: ${formatGender(memberData.gender)}`)).toBeInTheDocument();
        expect(screen.getByText(`phone: ${formatPhone(memberData.phone)}`)).toBeInTheDocument();
        expect(screen.getByText(`address: ${memberData.address}`)).toBeInTheDocument();
        expect(screen.getByText(`email: ${memberData.email}`)).toBeInTheDocument();
        expect(screen.getByText(`medicaid: ${memberData.medicaid.toUpperCase()}`)).toBeInTheDocument();
        expect(screen.getByText(`ssn: ${formatSSN(memberData.ssn)}`)).toBeInTheDocument();
        expect(screen.getByText(`language: ${memberData.language}`)).toBeInTheDocument();
        expect(screen.getByText(`enrollment: ${formatDate(memberData.enrollment_date)}`)).toBeInTheDocument();
        expect(screen.getByText(`note: ${memberData.note}`)).toBeInTheDocument();
    });

    it('renders empty message when no data', () => {
        render(<MemberInfoCard data={null} onEdit={mockOnEdit} />);
        expect(screen.getByText('no_info')).toBeInTheDocument();
    });

    it('calls onEdit when edit button is clicked', () => {
        render(<MemberInfoCard data={memberData} onEdit={mockOnEdit} />);
        const editButton = screen.getByText('Edit');
        fireEvent.click(editButton);
        expect(mockOnEdit).toHaveBeenCalled();
    });
});