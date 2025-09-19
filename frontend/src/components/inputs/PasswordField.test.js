import React, { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import PasswordField from './PasswordField';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key }),
}));

describe('PasswordField', () => {
    it('calls onChange when typing into the input', () => {
        const TestWrapper = () => {
            const [value, setValue] = useState('');
            return <PasswordField value={value} onChange={(e) => setValue(e.target.value)} />;
        };

        render(<TestWrapper />);
        const input = screen.getByPlaceholderText('general.password');

        fireEvent.change(input, { target: { value: 'mySecret' } });

        expect(input.value).toBe('mySecret');
    });

    it('toggles password visibility when toggle button is clicked', () => {
        const TestWrapper = () => {
            const [value, setValue] = useState('');
            return <PasswordField value={value} onChange={(e) => setValue(e.target.value)} />;
        };

        const { container } = render(<TestWrapper />);
        const input = screen.getByPlaceholderText('general.password');
        const toggleBtn = container.querySelector('.password-toggle');

        // Initially password type
        expect(input).toHaveAttribute('type', 'password');
        expect(container.querySelector('.eye-open')).toBeInTheDocument();

        // Click toggle
        fireEvent.click(toggleBtn);
        expect(input).toHaveAttribute('type', 'text');
        expect(container.querySelector('.eye-close')).toBeInTheDocument();

        // Click again to hide
        fireEvent.click(toggleBtn);
        expect(input).toHaveAttribute('type', 'password');
        expect(container.querySelector('.eye-open')).toBeInTheDocument();
    });

    it('renders confirm password placeholder when isConfirm is true', () => {
        const TestWrapper = () => {
            const [value, setValue] = useState('');
            return <PasswordField value={value} onChange={(e) => setValue(e.target.value)} isConfirm />;
        };

        render(<TestWrapper />);
        const input = screen.getByPlaceholderText('general.confirm_password');
        expect(input).toBeInTheDocument();
    });

    it('has required attribute on input', () => {
        render(<PasswordField value="" onChange={() => {}} />);
        const input = screen.getByPlaceholderText('general.password');
        expect(input).toBeRequired();
    });
});