import React from 'react';
import { render, screen } from '@testing-library/react';

import MemberDetail from './MemberDetail';

describe('MemberDetail', () => {
    it('renders label and value when value is provided', () => {
        render(<MemberDetail label="Name" value="John Doe" />);
        expect(screen.getByText('Name:')).toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('renders nothing when value is null', () => {
        const { container } = render(<MemberDetail label="Name" value={null} />);
        expect(container).toBeEmptyDOMElement();
    });

    it('renders nothing when value is an empty string', () => {
        const { container } = render(<MemberDetail label="Name" value="" />);
        expect(container).toBeEmptyDOMElement();
    });
});