import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemberInfoModal } from './MemberInfoModal';

jest.mock('../inputs/TextInput', () => (props) => (
    <label>
        {props.label}
        <input
            type={props.type || 'text'}
            value={props.value}
            onChange={props.onChange}
            maxLength={props.maxLength}
            required={props.required}
        />
    </label>
));

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key }),
}));

describe('MemberInfoModal - core behaviors', () => {
    const noop = () => {};

    const memberData = {
        sadc_member_id: 12345,
        last_name: 'Doe',
        first_name: 'John',
        alt_name: '',
        phone: '1234567890',
        address: '123 Main St',
        email: 'john@example.com',
        medicaid: 'A1234567',
        ssn: '987654321',
        enrollment_date: '2025-01-01',
        note: 'Test note',
    };

    it('renders all basic member info fields', () => {
        render(<MemberInfoModal data={memberData} handleChange={noop} handleLimit={noop} />);

        // Check input fields by their labels
        Object.entries(memberData).forEach(([key, value]) => {
            const labelText =
                key === 'enrollment_date'
                    ? 'member.info.enrollment'
                    : key === 'note'
                    ? 'general.note'
                    : `member.info.${key}`;
            expect(screen.getByLabelText(labelText)).toBeInTheDocument();
        });
    });

    it('calls handleChange when typing in text inputs', () => {
        const handleChange = jest.fn(() => noop);
        render(<MemberInfoModal data={memberData} handleChange={handleChange} handleLimit={noop} />);

        const firstNameInput = screen.getByLabelText('member.info.first_name');
        fireEvent.change(firstNameInput, { target: { value: 'Jane' } });

        expect(handleChange).toHaveBeenCalledWith('first_name');
    });
});