import React from 'react';
import { render, screen } from '@testing-library/react';
import ContactDetail from './ContactDetail';
import { formatPhone } from '../../utils/formatUtils';

describe('ContactDetail', () => {
    it('renders name and formatted contact when not email', () => {
        const name = 'Alice';
        const phone = '5551234';

        render(<ContactDetail label="Phone" name={name} contact={phone} />);

        // Label
        expect(screen.getByText('Phone:')).toBeInTheDocument();
        // Name
        expect(screen.getByText(name)).toBeInTheDocument();
        // Formatted phone
        expect(screen.getByText(formatPhone(phone))).toBeInTheDocument();
    });

    it('renders email correctly', () => {
        const email = 'alice@example.com';

        render(<ContactDetail label="Email" name={email} email />);

        expect(screen.getByText('Email:')).toBeInTheDocument();
        expect(screen.getByText('alice')).toBeInTheDocument();
        expect(screen.getByText('@example.com')).toBeInTheDocument();
    });

    it('renders nothing when name is missing', () => {
        const { container } = render(<ContactDetail label="Phone" />);
        expect(container).toBeEmptyDOMElement();
    });
});