import React from 'react';
import { render, screen } from '@testing-library/react';
import NameDisplay from './NameDisplay';
import usePreferences from '../../hooks/usePreferences';

jest.mock('../../hooks/usePreferences');

describe('NameDisplay', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders memberName when alt_name preference is false', () => {
        usePreferences.mockReturnValue(false);
        render(<NameDisplay memberName="John Doe" altName="Johnny" sadcId="M123" />);
        expect(screen.getByText('M123. John Doe')).toBeInTheDocument();
    });

    it('renders altName when alt_name preference is true', () => {
        usePreferences.mockReturnValue(true);
        render(<NameDisplay memberName="John Doe" altName="Johnny" sadcId="M123" />);
        expect(screen.getByText('M123. Johnny')).toBeInTheDocument();
    });

    it('renders without prefix if sadcId is not provided', () => {
        usePreferences.mockReturnValue(false);
        render(<NameDisplay memberName="John Doe" altName="Johnny" />);
        expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('falls back to memberName if altName is empty but preference is true', () => {
        usePreferences.mockReturnValue(true);
        render(<NameDisplay memberName="John Doe" altName="" sadcId="M123" />);
        expect(screen.getByText('M123. John Doe')).toBeInTheDocument();
    });
});