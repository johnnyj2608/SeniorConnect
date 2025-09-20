import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import MemberContactCard from './MemberContactCard';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key) => key,
    }),
}));

jest.mock('../layout/ContactDetail', () => ({ label, name, contact }) => (
    <div>
        {label}: {name} / {contact}
    </div>
));

jest.mock('../layout/CardMember', () => ({ children, onEdit, emptyMessage }) => (
    <div>
        <button onClick={onEdit}>Edit</button>
        {children}
        {emptyMessage && <div>{emptyMessage}</div>}
    </div>
));

describe('MemberContactCard', () => {
    const contactsData = [
        { id: 1, contact_type: 'primary', name: 'Alice Smith', phone: '555-1111' },
        { id: 2, contact_type: 'secondary', name: 'Bob Jones', phone: '555-2222' },
    ];

    it('renders contacts correctly', () => {
        render(<MemberContactCard data={contactsData} onEdit={jest.fn()} />);

        // Each contact
        contactsData.forEach(contact => {
            const contactEl = screen.getByText(
                (content) =>
                    content.includes(contact.name) && content.includes(contact.phone)
            );
            expect(contactEl).toBeInTheDocument();
        });
    });

    it('renders empty message when no contacts', () => {
        render(<MemberContactCard data={[]} onEdit={jest.fn()} />);
        expect(screen.getByText('member.contacts.no_contacts')).toBeInTheDocument();
    });

    it('calls onEdit when edit button is clicked', () => {
        const mockOnEdit = jest.fn();
        render(<MemberContactCard data={contactsData} onEdit={mockOnEdit} />);
        fireEvent.click(screen.getByText('Edit'));
        expect(mockOnEdit).toHaveBeenCalled();
    });
});