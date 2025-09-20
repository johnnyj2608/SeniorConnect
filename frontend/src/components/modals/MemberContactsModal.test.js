import React from 'react';
import { render, screen } from '@testing-library/react';
import MemberContactsModal from './MemberContactsModal';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key }),
}));

jest.mock('../inputs/TextInput', () => (props) => (
    <label>
        {props.label}
        <input {...props} />
    </label>
));

// Mock SearchContacts
jest.mock('../inputs/SearchContacts', () => (props) => (
    <label>
        {props.label || 'search-contacts'}
        <input
            value={props.value}
            onChange={props.onChange}
            disabled={props.disabled}
        />
    </label>
));

const noop = () => {};

// Mock data
const mockData = [
    {
        id: '1',
        contact_type: 'emergency_contact',
        relationship_type: 'husband',
        name: 'John Doe',
        phone: '1234567890',
    },
    {
        id: '2',
        contact_type: 'pharmacy',
        relationship_type: '',
        name: 'CVS Pharmacy',
        phone: '9876543210',
    },
];

describe('MemberContactsModal - core behaviors', () => {
    it('renders all contact fields for emergency contact', () => {
        render(
            <MemberContactsModal
                data={mockData}
                handleChange={noop}
                activeTab={0} // emergency_contact
                memberID="M001"
                handleLimit={noop}
            />
        );

        // Contact type select
        expect(screen.getByLabelText('member.contacts.label *')).toBeInTheDocument();

        // Relationship select should exist for emergency_contact
        expect(screen.getByLabelText('member.contacts.relationship *')).toBeInTheDocument();

        // Name field (SearchContacts)
        expect(screen.getByLabelText('search-contacts')).toBeInTheDocument();

        // Phone field (TextInput)
        expect(screen.getByLabelText('member.contacts.phone')).toBeInTheDocument();
    });

    it('does not render relationship select for non-emergency contacts', () => {
        render(
            <MemberContactsModal
                data={mockData}
                handleChange={noop}
                activeTab={1} // pharmacy
                memberID="M001"
                handleLimit={noop}
            />
        );

        expect(screen.queryByLabelText('member.contacts.relationship *')).toBeNull();
    });

    it('renders all contact type options', () => {
        render(
            <MemberContactsModal
                data={mockData}
                handleChange={noop}
                activeTab={1} // any tab
                memberID="M001"
                handleLimit={noop}
            />
        );

        const select = screen.getByLabelText('member.contacts.label *');
        expect(select).toBeInTheDocument();

        const options = Array.from(select.querySelectorAll('option')).map(o => o.textContent);
        expect(options).toContain('member.contacts.emergency_contact');
        expect(options).toContain('member.contacts.primary_care_provider');
        expect(options).toContain('member.contacts.pharmacy');
        expect(options).toContain('member.contacts.home_aid');
        expect(options).toContain('member.contacts.home_care');
        expect(options).toContain('member.contacts.other');
    });

    it('renders all relationship options for emergency contact', () => {
        render(
            <MemberContactsModal
                data={mockData}
                handleChange={noop}
                activeTab={0} // emergency_contact
                memberID="M001"
                handleLimit={noop}
            />
        );

        const select = screen.getByLabelText('member.contacts.relationship *');
        const options = Array.from(select.querySelectorAll('option')).map(o => o.textContent);

        expect(options).toContain('member.contacts.husband');
        expect(options).toContain('member.contacts.wife');
        expect(options).toContain('member.contacts.son');
        expect(options).toContain('member.contacts.daughter');
        expect(options).toContain('member.contacts.brother');
        expect(options).toContain('member.contacts.sister');
        expect(options).toContain('member.contacts.friend');
        expect(options).toContain('member.contacts.father');
        expect(options).toContain('member.contacts.mother');
        expect(options).toContain('member.contacts.other');
    });
});